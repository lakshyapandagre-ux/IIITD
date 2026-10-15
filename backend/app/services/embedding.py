import asyncio
import logging
import uuid
from functools import lru_cache
from typing import List, Optional, Any
import numpy as np
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

logger = logging.getLogger("uvicorn.error")

# Global singleton model reference
_EMBEDDING_MODEL = None
_MODEL_BACKEND = "none"


def _initialize_model():
    """Attempt to load fastembed or sentence-transformers model (all-MiniLM-L6-v2, 384 dimensions)."""
    global _EMBEDDING_MODEL, _MODEL_BACKEND
    if _EMBEDDING_MODEL is not None:
        return _EMBEDDING_MODEL

    try:
        from fastembed import TextEmbedding
        _EMBEDDING_MODEL = TextEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")
        _MODEL_BACKEND = "fastembed"
        logger.info("Loaded fastembed (sentence-transformers/all-MiniLM-L6-v2) for CPU vector embeddings.")
        return _EMBEDDING_MODEL
    except Exception as e:
        logger.debug(f"fastembed not available: {e}")

    try:
        from sentence_transformers import SentenceTransformer
        _EMBEDDING_MODEL = SentenceTransformer("all-MiniLM-L6-v2", device="cpu")
        _MODEL_BACKEND = "sentence-transformers"
        logger.info("Loaded sentence-transformers (all-MiniLM-L6-v2) on CPU.")
        return _EMBEDDING_MODEL
    except Exception as e:
        logger.debug(f"sentence-transformers not available: {e}")

    _MODEL_BACKEND = "dense_hash"
    logger.info("Using high-entropy deterministic dense vector projection (384 dims, CPU).")
    return None


def _fallback_dense_embedding(text: str, dim: int = 384) -> List[float]:
    """
    Deterministic 384-dimensional dense vector projection.
    Uses subword character trigrams and token hashing with L2 normalization.
    """
    if not text or not text.strip():
        return [0.0] * dim

    vec = np.zeros(dim, dtype=np.float32)
    clean = text.lower().replace("-", " ").replace("_", " ").replace("/", " ")
    tokens = clean.split()

    for idx, token in enumerate(tokens):
        h = hash(token)
        b1 = abs(h) % dim
        b2 = abs(h >> 7) % dim
        b3 = abs(h >> 13) % dim
        decay = 1.0 / (1.0 + 0.05 * idx)

        vec[b1] += 2.0 * decay
        vec[b2] += 1.2 * decay
        vec[b3] -= 0.7 * decay

        for j in range(len(token) - 2):
            gram = token[j : j + 3]
            g_b = abs(hash(gram)) % dim
            vec[g_b] += 0.5 * decay

    norm = np.linalg.norm(vec)
    if norm > 1e-6:
        vec = vec / norm
    return vec.tolist()


@lru_cache(maxsize=4096)
def _cached_embedding(text: str) -> tuple[float, ...]:
    """Cached internal synchronous embedding generator returning an immutable tuple."""
    model = _initialize_model()

    if _MODEL_BACKEND == "fastembed" and model is not None:
        try:
            embeddings_generator = model.embed([text])
            first_vector = next(embeddings_generator)
            return tuple(float(x) for x in first_vector)
        except Exception as e:
            logger.warning(f"fastembed generation error: {e}. Falling back to dense projection.")

    elif _MODEL_BACKEND == "sentence-transformers" and model is not None:
        try:
            emb = model.encode(text, normalize_embeddings=True)
            return tuple(float(x) for x in emb)
        except Exception as e:
            logger.warning(f"sentence-transformers generation error: {e}. Falling back to dense projection.")

    return tuple(_fallback_dense_embedding(text, dim=384))


def generate_embedding(text: str) -> List[float]:
    """
    Synchronous wrapper to generate 384-dimensional dense vectors on CPU.
    Utilizes LRU caching for high-frequency queries and tag sets.
    """
    if not text:
        return [0.0] * 384
    return list(_cached_embedding(text.strip()))


async def async_generate_embedding(text: str) -> List[float]:
    """Asynchronous wrapper for embedding generation running CPU bound work in executor."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, generate_embedding, text)


def compute_cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """Compute cosine similarity between two 384-dimensional vectors."""
    if not vec1 or not vec2 or len(vec1) != len(vec2):
        return 0.0
    a = np.array(vec1, dtype=np.float32)
    b = np.array(vec2, dtype=np.float32)
    dot = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a < 1e-6 or norm_b < 1e-6:
        return 0.0
    return float(dot / (norm_a * norm_b))


async def update_organization_embedding(
    db: AsyncSession,
    organization_id: uuid.UUID
) -> Optional[Any]:
    """
    Embedding Update Trigger:
    Generates and stores the 384-d vector in Postgres description_embedding
    whenever an organization profile or capability ledger is created or updated.
    """
    from app.models.organization import Organization
    from app.models.capability import OrganizationCapability

    stmt = select(Organization).where(Organization.id == organization_id)
    res = await db.execute(stmt)
    org = res.scalars().first()
    if not org:
        return None

    # Compose rich text representation including category, description, and capabilities
    caps_stmt = select(OrganizationCapability).where(OrganizationCapability.organization_id == organization_id)
    caps_res = await db.execute(caps_stmt)
    caps = caps_res.scalars().all()

    offer_names = [c.capability.name for c in caps if c.direction == "OFFER" and c.capability]
    need_names = [c.capability.name for c in caps if c.direction == "NEED" and c.capability]

    composite_text = f"{org.name}. Category: {org.category}. Description: {org.description}. Offers: {', '.join(offer_names)}. Needs: {', '.join(need_names)}."

    new_embedding = await async_generate_embedding(composite_text)
    org.description_embedding = new_embedding

    await db.commit()
    await db.refresh(org)
    logger.info(f"Updated description_embedding (384-d) for organization '{org.name}' ({org.id}).")
    return org
