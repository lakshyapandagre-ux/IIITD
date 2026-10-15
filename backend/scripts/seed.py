import asyncio
import logging
from sqlalchemy import text
from sqlmodel import select
from app.core.database import async_session_maker, init_db
from app.models.institution import Institution
from app.models.organization import Organization
from app.models.capability import Capability, OrganizationCapability
from app.models.exchange import ExchangeItem
from app.models.charter import ProjectCharter, CharterParticipant, CharterMilestone
from app.services.embedding import generate_embedding

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("scripts.seed")


async def run_seed():
    logger.info("Initializing database schemas and tables...")
    await init_db()

    async with async_session_maker() as db:
        logger.info("Populating database with realistic test entities...")

        # 1. Clear existing test data for idempotency
        try:
            await db.execute(text("DELETE FROM reservations;"))
            await db.execute(text("DELETE FROM exchange_items;"))
            await db.execute(text("DELETE FROM charter_milestones;"))
            await db.execute(text("DELETE FROM charter_participants;"))
            await db.execute(text("DELETE FROM project_charters;"))
            await db.execute(text("DELETE FROM organization_capabilities;"))
            await db.execute(text("DELETE FROM capabilities;"))
            await db.execute(text("DELETE FROM organizations;"))
            await db.execute(text("DELETE FROM institutions;"))
            await db.commit()
            logger.info("Cleared previous seed tables.")
        except Exception as e:
            await db.rollback()
            logger.warning(f"Notice on table clean: {e}")

        # 2. 4 Institutions
        institutions_data = [
            {
                "name": "Indian Institute of Technology Indore",
                "domain": "iiti.ac.in",
                "campus_location": "Simrol, Indore",
                "is_verified": True,
            },
            {
                "name": "Shri Govindram Seksaria Institute of Technology and Science",
                "domain": "sgsits.ac.in",
                "campus_location": "Vallabh Nagar, Indore",
                "is_verified": True,
            },
            {
                "name": "Devi Ahilya Vishwavidyalaya",
                "domain": "dauniv.ac.in",
                "campus_location": "Khandwa Road, Indore",
                "is_verified": True,
            },
            {
                "name": "Medicaps University",
                "domain": "medicaps.ac.in",
                "campus_location": "Pigdamber, Rau, Indore",
                "is_verified": True,
            },
        ]

        inst_map = {}
        for inst_info in institutions_data:
            inst = Institution(**inst_info)
            db.add(inst)
            await db.flush()
            inst_map[inst.domain] = inst
            logger.info(f"Created Institution: {inst.name} ({inst.domain})")

        # 3. 6 Organizations
        orgs_seed = [
            {
                "name": "IIT Indore Robotics Club",
                "slug": "iit-indore-robotics",
                "institution_domain": "iiti.ac.in",
                "category": "Robotics",
                "description": "Elite university robotics and autonomy research lab specializing in ROS2 navigation, edge computing with Jetson Orin, multi-rotor aerial vehicles, and multi-sensor computer vision pipelines.",
                "verification_tier": "faculty_verified",
                "faculty_poc": "Dr. Aruna Tiwari (CSE / Robotics Lab)",
                "weekly_available_hours": 45,
                "is_overlooked": False,
                "trust_score": 98,
                "avatar_url": "🤖",
                "offers": [
                    ("ROS2", "skill", "Full navigation stack maintainers"),
                    ("Computer Vision", "skill", "Real-time object detection and segmentation"),
                    ("Jetson Orin Lab", "equipment", "4x NVIDIA Jetson Orin AGX developer kits"),
                ],
                "needs": [
                    ("Industrial Enclosure", "equipment", "IP67 sealed ruggedized housing"),
                    ("Marine Bio Access", "field_access", "Wetland and riverbed testing permits"),
                ],
            },
            {
                "name": "SGSITS Product Design Lab",
                "slug": "sgsits-product-design",
                "institution_domain": "sgsits.ac.in",
                "category": "Design",
                "description": "Specialized industrial engineering lab for computer-aided design (CAD), rapid metal and polymer 3D prototyping, ergonomic human factors evaluation, and finite element stress analysis.",
                "verification_tier": "faculty_verified",
                "faculty_poc": "Prof. R. C. Gurjar (Mechanical & Industrial Design)",
                "weekly_available_hours": 38,
                "is_overlooked": False,
                "trust_score": 94,
                "avatar_url": "📐",
                "offers": [
                    ("CAD", "skill", "Parametric SolidWorks and Siemens NX generative modeling"),
                    ("3D Prototyping", "equipment", "Industrial SLA/SLS multi-material printers"),
                    ("Ergonomics", "skill", "Human-machine interface and anthropometric testing"),
                ],
                "needs": [
                    ("Embedded Firmware", "skill", "STM32 and FreeRTOS control software"),
                ],
            },
            {
                "name": "DAVV Bio-Resource Center",
                "slug": "davv-bio-resource",
                "institution_domain": "dauniv.ac.in",
                "category": "Biotech",
                "description": "Regional biological research and ecological conservation center conducting continuous environmental monitoring, riparian wetland testing, and biochemical water purity assays.",
                "verification_tier": "faculty_verified",
                "faculty_poc": "Dr. Pratosh Bansal (Environmental Sciences)",
                "weekly_available_hours": 40,
                "is_overlooked": True,
                "trust_score": 93,
                "avatar_url": "🌿",
                "offers": [
                    ("Wetland Field Access", "field_access", "Exclusive research permits for protected wetland zones"),
                    ("Water Sample Testing", "equipment", "Mass spectrometry and microbiological assay lab"),
                ],
                "needs": [
                    ("IoT Telemetry", "equipment", "Long-range cellular/LoRa environmental telemetry nodes"),
                    ("Mobile Dashboard", "skill", "Cross-platform real-time monitoring application"),
                ],
            },
            {
                "name": "Medicaps Aerial Systems",
                "slug": "medicaps-aerial-systems",
                "institution_domain": "medicaps.ac.in",
                "category": "Hardware",
                "description": "Aeronautical research group building composite fixed-wing and VTOL airframes with long-range spread spectrum telemetry, endurance battery packs, and autonomous waypoint guidance.",
                "verification_tier": "student_verified",
                "faculty_poc": "Dr. Nitin Kulkarni (Aerospace Systems)",
                "weekly_available_hours": 36,
                "is_overlooked": False,
                "trust_score": 89,
                "avatar_url": "🛰️",
                "offers": [
                    ("Long-range LoRa", "equipment", "2.4GHz & 868MHz high-power LoRa transceiver nodes"),
                    ("Drone Airframes", "equipment", "Carbon fiber 1.8m fixed-wing survey airframes"),
                ],
                "needs": [
                    ("Thermal Calibration", "equipment", "Radiometric thermal camera calibration chamber"),
                ],
            },
            {
                "name": "IIT Indore AI Research Society",
                "slug": "iit-indore-ai-society",
                "institution_domain": "iiti.ac.in",
                "category": "AI",
                "description": "Applied deep learning consortium training custom transformer architectures, spatial vision encoders, and edge quantization models in PyTorch for autonomous robotics.",
                "verification_tier": "faculty_verified",
                "faculty_poc": "Dr. Bodhisatwa Mazumdar (AI & Embedded Systems)",
                "weekly_available_hours": 48,
                "is_overlooked": False,
                "trust_score": 97,
                "avatar_url": "🧠",
                "offers": [
                    ("PyTorch", "skill", "Custom neural network architecture design and training"),
                    ("Edge AI", "skill", "FP16 and INT8 TensorRT quantization for mobile chips"),
                ],
                "needs": [
                    ("Real-world Sensor Data", "field_access", "Calibrated multimodal field datasets"),
                ],
            },
            {
                "name": "SGSITS Green Earth Initiative",
                "slug": "sgsits-green-earth",
                "institution_domain": "sgsits.ac.in",
                "category": "Biotech",
                "description": "Interdisciplinary civic engineering initiative coordinating university volunteer corps, environmental ground surveys, watershed restoration, and urban heat mapping.",
                "verification_tier": "student_verified",
                "faculty_poc": "Prof. Sunita Verma (Civil & Environmental Engineering)",
                "weekly_available_hours": 35,
                "is_overlooked": True,
                "trust_score": 91,
                "avatar_url": "🌱",
                "offers": [
                    ("Ground survey volunteers", "skill", "Trained field scout cohort of 25 engineering students"),
                ],
                "needs": [
                    ("Automated Water Monitoring", "equipment", "Continuous optical turbidity and pH probes"),
                ],
            },
        ]

        org_map = {}
        for o in orgs_seed:
            inst = inst_map[o["institution_domain"]]
            # Generate realistic 384-dimensional vector embedding
            embedding_text = f"{o['name']} {o['category']}. {o['description']}"
            desc_embedding = generate_embedding(embedding_text)

            org = Organization(
                name=o["name"],
                slug=o["slug"],
                institution_id=inst.id,
                category=o["category"],
                description=o["description"],
                verification_tier=o["verification_tier"],
                faculty_poc=o["faculty_poc"],
                weekly_available_hours=o["weekly_available_hours"],
                is_overlooked=o["is_overlooked"],
                trust_score=o["trust_score"],
                avatar_url=o["avatar_url"],
                description_embedding=desc_embedding,
            )
            db.add(org)
            await db.flush()
            org_map[o["slug"]] = org
            logger.info(f"Created Organization: {org.name} (Embedding dims: {len(desc_embedding)})")

            # Capabilities: OFFERS
            for cap_name, cap_type, cap_detail in o["offers"]:
                c_stmt = select(Capability).where(Capability.name == cap_name)
                c_res = await db.execute(c_stmt)
                cap_obj = c_res.scalars().first()
                if not cap_obj:
                    cap_obj = Capability(name=cap_name, type=cap_type)
                    db.add(cap_obj)
                    await db.flush()

                cap_emb = generate_embedding(f"{cap_name} {cap_type} OFFER {cap_detail}")
                org_cap = OrganizationCapability(
                    organization_id=org.id,
                    capability_id=cap_obj.id,
                    direction="OFFER",
                    capacity_detail=cap_detail,
                    embedding=cap_emb,
                )
                db.add(org_cap)

            # Capabilities: NEEDS
            for cap_name, cap_type, cap_detail in o["needs"]:
                c_stmt = select(Capability).where(Capability.name == cap_name)
                c_res = await db.execute(c_stmt)
                cap_obj = c_res.scalars().first()
                if not cap_obj:
                    cap_obj = Capability(name=cap_name, type=cap_type)
                    db.add(cap_obj)
                    await db.flush()

                cap_emb = generate_embedding(f"{cap_name} {cap_type} NEED {cap_detail}")
                org_cap = OrganizationCapability(
                    organization_id=org.id,
                    capability_id=cap_obj.id,
                    direction="NEED",
                    capacity_detail=cap_detail,
                    embedding=cap_emb,
                )
                db.add(org_cap)

        # 4. Spot-Market Exchange Equipment
        exchange_items_data = [
            {
                "org_slug": "sgsits-product-design",
                "title": "5-Axis CNC Router & Prototyping Mill",
                "type": "equipment",
                "category": "Hardware",
                "lab_name": "SGSITS Precision Rapid Prototyping Facility",
                "availability": "Available Saturdays 09:00 - 17:00",
                "faculty_poc": "Prof. R. C. Gurjar",
                "description": "High-speed 5-axis CNC machining router for carbon composites, structural foams, Delrin, and aluminum alloys.",
                "specs": ["5-Axis Simultaneous Trunnion", "24,000 RPM Spindle", "High Precision Tool Probe"],
                "capacity": "2 slots/week (8 hrs per session)",
                "image_url": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
            },
            {
                "org_slug": "davv-bio-resource",
                "title": "Water Turbidity & Multichannel Sensor Kit",
                "type": "equipment",
                "category": "Hardware",
                "lab_name": "DAVV Limnological Ecology Field Station",
                "availability": "Available Weekdays 10:00 - 16:00",
                "faculty_poc": "Dr. Pratosh Bansal",
                "description": "Submersible multi-parameter water quality sensor sonde measuring NTU turbidity, dissolved oxygen, electrical conductivity, and pH.",
                "specs": ["0 - 4000 NTU Optical Probe", "RS485 Modbus Interface", "IP68 Submersible to 50m"],
                "capacity": "3 kits available for field borrowing",
                "image_url": "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=800&q=80",
            },
            {
                "org_slug": "medicaps-aerial-systems",
                "title": "AeroLab Subsonic Flow Wind Tunnel",
                "type": "equipment",
                "category": "Space",
                "lab_name": "Medicaps Aerodynamics Research Facility",
                "availability": "Available Tuesdays & Thursdays 13:00 - 18:00",
                "faculty_poc": "Dr. Nitin Kulkarni",
                "description": "Instrumented test section with 6-component force balance for measuring aerodynamic drag, lift, and airfoil stall characteristics.",
                "specs": ["600mm x 600mm Open Jet Chamber", "Speed range 5 - 45 m/s", "Automated Smoke Streamline Visualization"],
                "capacity": "4 hours per reservation slot",
                "image_url": "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=800&q=80",
            },
            {
                "org_slug": "iit-indore-robotics",
                "title": "Indoor Autonomous Flight Test Arena",
                "type": "field_access",
                "category": "Space",
                "lab_name": "IIT Indore Autonomy & Navigation Arena",
                "availability": "Available Mon & Wed 14:00 - 19:00",
                "faculty_poc": "Dr. Aruna Tiwari",
                "description": "OptiTrack-instrumented 10m x 8m x 5m safety-netted flight cage with sub-millimeter ground truth motion capture tracking.",
                "specs": ["12x OptiTrack Prime 13 Cameras", "ROS2 Vicon Bridge", "High-G Padded Safety Perimeter"],
                "capacity": "Dedicated test blocks (3 hours each)",
                "image_url": "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80",
            },
        ]

        for item_info in exchange_items_data:
            org = org_map[item_info["org_slug"]]
            item = ExchangeItem(
                organization_id=org.id,
                title=item_info["title"],
                type=item_info["type"],
                category=item_info["category"],
                lab_name=item_info["lab_name"],
                availability=item_info["availability"],
                faculty_poc=item_info["faculty_poc"],
                description=item_info["description"],
                specs=item_info["specs"],
                capacity=item_info["capacity"],
                status="Available",
                image_url=item_info["image_url"],
            )
            db.add(item)
            logger.info(f"Created Exchange Item: {item.title} ({item.lab_name})")

        # 5. Multi-Sig Cross-Institutional Project Charter
        iit_robotics = org_map["iit-indore-robotics"]
        medicaps_aero = org_map["medicaps-aerial-systems"]
        davv_bio = org_map["davv-bio-resource"]

        charter = ProjectCharter(
            title="Autonomous Riverbed Environmental Drone",
            project_goal="Design, build, and deploy an autonomous fixed-wing drone equipped with edge AI and submersible water quality telemetry for continuous Khan River basin monitoring.",
            status="active",
            escrow_status="Active",
            contract_hash="0x77d9c612ea09b782c5f609e99a4c0a87f12e12b4",
        )
        db.add(charter)
        await db.flush()

        # Add Charter Participants
        db.add(CharterParticipant(
            charter_id=charter.id,
            organization_id=iit_robotics.id,
            role="Autonomous ROS2 Navigation & Edge Jetson Compute",
            allocated_hours_per_week=25,
            has_signed=True,
            signed_at="2026-10-12 10:30:00",
            signatory_name="Aarav Sharma (Club Lead)",
        ))
        db.add(CharterParticipant(
            charter_id=charter.id,
            organization_id=medicaps_aero.id,
            role="Carbon Fiber Airframe & Spread Spectrum Telemetry",
            allocated_hours_per_week=20,
            has_signed=True,
            signed_at="2026-10-12 11:15:00",
            signatory_name="Dr. Nitin Kulkarni (Faculty POC)",
        ))
        db.add(CharterParticipant(
            charter_id=charter.id,
            organization_id=davv_bio.id,
            role="Water Quality Sensor Sonde & Ecological Field Testing",
            allocated_hours_per_week=16,
            has_signed=True,
            signed_at="2026-10-12 14:00:00",
            signatory_name="Dr. Pratosh Bansal (Faculty POC)",
        ))

        # Add Milestones
        db.add(CharterMilestone(
            charter_id=charter.id,
            title="M1: Airframe CAD & Stress FEA Simulation",
            assigned_organization_id=medicaps_aero.id,
            deadline="2026-10-25",
            status="verified_proof",
            proof_url="https://github.com/nexuscollab/khan-river-drone/pull/14",
            proof_type="cad_model",
            proof_hash="0xa9f381c0...42e881 (IPFS Minted)",
            verified_by=["IIT Indore Robotics Club", "DAVV Bio-Resource Center"],
            required_signatures=2,
            spec_notes="Airframe withstands 4.5G pullout acceleration in ANSYS static structural analysis.",
        ))
        db.add(CharterMilestone(
            charter_id=charter.id,
            title="M2: Edge ROS2 Navigation & Sonde Integration",
            assigned_organization_id=iit_robotics.id,
            deadline="2026-11-05",
            status="in_review",
            proof_url="https://github.com/nexuscollab/khan-river-drone/pull/22",
            proof_type="github_pr",
            verified_by=["Medicaps Aerial Systems"],
            required_signatures=2,
            spec_notes="Demonstrating 42 FPS segmentation inference at under 15W TDP on Jetson Orin.",
        ))
        db.add(CharterMilestone(
            charter_id=charter.id,
            title="M3: Full Autonomous Flight & Riparian Water Survey",
            assigned_organization_id=davv_bio.id,
            deadline="2026-11-20",
            status="committed",
            required_signatures=2,
            spec_notes="Complete 25-minute autonomous survey flight with live NTU turbidity telemetry.",
        ))

        await db.commit()
        logger.info("Database seeding successfully completed!")


if __name__ == "__main__":
    asyncio.run(run_seed())
