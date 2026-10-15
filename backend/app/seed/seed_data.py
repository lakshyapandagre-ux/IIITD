import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.models.institution import Institution
from app.models.organization import Organization
from app.models.capability import Capability, OrganizationCapability
from app.models.exchange import ExchangeItem
from app.models.charter import ProjectCharter, CharterParticipant, CharterMilestone
from app.services.embedding import generate_embedding

logger = logging.getLogger("uvicorn.error")


async def seed_initial_data(db: AsyncSession) -> None:
    """Idempotently seed default accredited institutions, organizations, and capabilities."""
    stmt = select(Institution).limit(1)
    res = await db.execute(stmt)
    if res.scalars().first():
        logger.info("Database already contains initial seed data. Skipping seed step.")
        return

    logger.info("Seeding initial institutions, organizations, capabilities, and exchange items...")

    # 1. Institutions
    institutions_data = [
        {"name": "Indian Institute of Technology Indore", "domain": "iiti.ac.in", "campus_location": "Simrol, Indore"},
        {"name": "Shri Govindram Seksaria Institute of Tech & Science", "domain": "sgsits.ac.in", "campus_location": "Vallabh Nagar, Indore"},
        {"name": "Devi Ahilya Vishwavidyalaya", "domain": "dauniv.ac.in", "campus_location": "Khandwa Road, Indore"},
        {"name": "Medi-Caps University", "domain": "medicaps.ac.in", "campus_location": "Pigdamber, Rau, Indore"},
        {"name": "COEP Technological University", "domain": "coep.ac.in", "campus_location": "Shivajinagar, Pune"},
        {"name": "IIITDM Jabalpur", "domain": "iiitdmj.ac.in", "campus_location": "Dumna Airport Road, Jabalpur"},
    ]

    inst_map = {}
    for d in institutions_data:
        inst = Institution(**d, is_verified=True)
        db.add(inst)
        await db.flush()
        inst_map[d["domain"]] = inst

    # 2. Organizations
    orgs_data = [
        {
            "name": "IIT Indore Robotics Club",
            "slug": "iit-indore-robotics",
            "institution_domain": "iiti.ac.in",
            "category": "Robotics",
            "description": "Elite university robotics and autonomy research lab specializing in ROS2 navigation, multi-rotor aerial vehicles, and multi-sensor fusion.",
            "verification_tier": "faculty_verified",
            "faculty_poc": "Dr. Aruna Tiwari (CSE / Robotics Lab)",
            "weekly_available_hours": 45,
            "is_overlooked": False,
            "trust_score": 98,
            "avatar_url": "🤖",
            "offers": [
                ("ROS2 Autonomous Navigation Stack", "skill", "4 core maintainers"),
                ("High-Precision LiPo Power Architecture", "equipment", "Full test bench access"),
                ("5-Axis CNC Milling Laboratory", "equipment", "Available Tue & Thu 14:00-18:00"),
            ],
            "needs": [
                ("Edge AI Quantization & TensorRT", "skill", "Blocker for flight controller"),
                ("Carbon Fiber Autoclave Curing", "equipment", "High priority for lightweight chassis"),
                ("Agricultural Drone Field Testing Zone", "field_access", "Required for validation"),
            ],
        },
        {
            "name": "SGSITS Embedded Systems & IoT Lab",
            "slug": "sgsits-iot-lab",
            "institution_domain": "sgsits.ac.in",
            "category": "Hardware",
            "description": "Premier engineering institute hardware laboratory focused on custom STM32/ESP32 PCB design, CAN bus protocol telemetry, and thermal management.",
            "verification_tier": "faculty_verified",
            "faculty_poc": "Prof. R. C. Gurjar (Electronics & Instrumentation)",
            "weekly_available_hours": 38,
            "is_overlooked": False,
            "trust_score": 94,
            "avatar_url": "⚡",
            "offers": [
                ("Custom PCB CAD & Surface Mount Assembly", "equipment", "High-speed pick and place line"),
                ("CAN Bus Industrial Telemetry", "skill", "Complete protocol stack verified"),
                ("Thermal Chamber & Dynamometer Testing", "equipment", "-20C to +85C cyclic chamber"),
            ],
            "needs": [
                ("ROS2 Nav2 Software Stack", "skill", "Need navigation integration"),
                ("Reinforcement Learning Control Policies", "skill", "High priority"),
            ],
        },
        {
            "name": "DAVV AI & Machine Intelligence Group",
            "slug": "davv-ai-group",
            "institution_domain": "dauniv.ac.in",
            "category": "AI",
            "description": "University research consortium building transformer models, vision-language pipelines, and edge TensorRT inference engines for spatial computing.",
            "verification_tier": "faculty_verified",
            "faculty_poc": "Dr. Pratosh Bansal (IET DAVV CS & AI)",
            "weekly_available_hours": 50,
            "is_overlooked": False,
            "trust_score": 93,
            "avatar_url": "🧠",
            "offers": [
                ("Edge TensorRT Vision Model Quantization", "skill", "FP16/INT8 optimizations ready"),
                ("Synthetic Dataset Augmentation Pipeline", "skill", "Blender/Unreal simulated photorealism"),
                ("Multi-Modal Sensor Fusion", "skill", "LiDAR + Camera Kalman filtering"),
            ],
            "needs": [
                ("Autonomous Quadcopter Testbed Access", "equipment", "Need physical flight validation"),
                ("Rapid Metal 3D Printing Facility", "equipment", "Need titanium mount brackets"),
            ],
        },
        {
            "name": "Medi-Caps Additive Manufacturing Center",
            "slug": "medicaps-additive",
            "institution_domain": "medicaps.ac.in",
            "category": "Design",
            "description": "Advanced prototyping center with high-temperature SLA/SLS 3D printers, composite carbon fiber layups, and aerodynamic wind tunnel.",
            "verification_tier": "student_verified",
            "faculty_poc": "Dr. Nitin Kulkarni (Mechanical Prototyping)",
            "weekly_available_hours": 35,
            "is_overlooked": False,
            "trust_score": 88,
            "avatar_url": "🎨",
            "offers": [
                ("High-Temperature SLS Nylon 3D Printing", "equipment", "EOS Formiga P110 printer"),
                ("Low-Speed Subsonic Aerodynamic Wind Tunnel", "equipment", "Up to 45 m/s test section"),
                ("Tensile & Stress Analysis Lab", "equipment", "Instron 5969 Universal Testing"),
            ],
            "needs": [
                ("Autonomous Flight Controller Software", "skill", "Need telemetry firmware"),
                ("Edge Vision AI Inference", "skill", "Need real-time crop disease detector"),
            ],
        },
        {
            "name": "COEP Precision Machining & Robotics Lab",
            "slug": "coep-robotics",
            "institution_domain": "coep.ac.in",
            "category": "Robotics",
            "description": "Historic regional engineering lab with state-of-the-art Haas 5-axis CNC machining, micro-EDM, and precision structural testing.",
            "verification_tier": "faculty_verified",
            "faculty_poc": "Dr. S. S. Ohol (Robotics & Mechatronics)",
            "weekly_available_hours": 42,
            "is_overlooked": True,  # Regional lab for Exploration Boost
            "trust_score": 96,
            "avatar_url": "⚙️",
            "offers": [
                ("Haas 5-Axis CNC Precision Milling", "equipment", "Aerospace-grade tolerance milling"),
                ("Micro-EDM Wire Cutting", "equipment", "Precision micro-machining"),
                ("Structural Modal Vibration Testing", "equipment", "Laser vibrometer setup"),
            ],
            "needs": [
                ("Distributed GPU Training Infrastructure", "equipment", "Need cluster for model training"),
                ("Computer Vision Depth Pipelines", "skill", "Need SLAM algorithms"),
            ],
        },
        {
            "name": "IIITDM Design & Prototyping Consortium",
            "slug": "iiitdm-design",
            "institution_domain": "iiitdmj.ac.in",
            "category": "Design",
            "description": "Specialized design and manufacturing institute equipped with industrial laser sintering, ergonomics studio, and FEA simulation cluster.",
            "verification_tier": "faculty_verified",
            "faculty_poc": "Prof. Puneet Tandon (CAD/CAM & Product Design)",
            "weekly_available_hours": 40,
            "is_overlooked": True,  # Regional lab for Exploration Boost
            "trust_score": 95,
            "avatar_url": "📐",
            "offers": [
                ("Industrial SLM Metal 3D Printing", "equipment", "Direct metal laser melting in Inconel & Al"),
                ("Ergonomics & CAD Generative Design", "skill", "Topology optimization for airframes"),
                ("Ansys FEA Multi-Physics Simulation", "skill", "High-performance compute license"),
            ],
            "needs": [
                ("ROS2 Ground Mobile Base Firmware", "skill", "Need embedded motion control"),
                ("Long-Range LoRa Telemetry", "equipment", "Need field transceiver units"),
            ],
        },
    ]

    org_map = {}
    for o in orgs_data:
        inst = inst_map[o["institution_domain"]]
        desc_emb = generate_embedding(f"{o['name']} {o['category']} {o['description']}")
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
            description_embedding=desc_emb,
        )
        db.add(org)
        await db.flush()
        org_map[o["slug"]] = org

        # Add offers
        for cap_name, cap_type, cap_detail in o["offers"]:
            c_obj = Capability(name=cap_name, type=cap_type)
            db.add(c_obj)
            await db.flush()
            cap_emb = generate_embedding(f"{cap_name} {cap_type} OFFER {cap_detail}")
            org_cap = OrganizationCapability(
                organization_id=org.id,
                capability_id=c_obj.id,
                direction="OFFER",
                capacity_detail=cap_detail,
                embedding=cap_emb,
            )
            db.add(org_cap)

        # Add needs
        for cap_name, cap_type, cap_detail in o["needs"]:
            c_obj = Capability(name=cap_name, type=cap_type)
            db.add(c_obj)
            await db.flush()
            cap_emb = generate_embedding(f"{cap_name} {cap_type} NEED {cap_detail}")
            org_cap = OrganizationCapability(
                organization_id=org.id,
                capability_id=c_obj.id,
                direction="NEED",
                capacity_detail=cap_detail,
                embedding=cap_emb,
            )
            db.add(org_cap)

    # 3. Exchange Items (Spot Market)
    exchange_items = [
        {
            "org_slug": "coep-robotics",
            "title": "Haas VF-2SS 5-Axis CNC Machining Center",
            "type": "equipment",
            "category": "Hardware",
            "lab_name": "COEP High Precision Aerospace Machining Lab",
            "availability": "Available Saturdays 09:00 - 17:00",
            "faculty_poc": "Dr. S. S. Ohol",
            "description": "Sub-10 micron aerospace precision milling for lightweight aluminum 7075 and titanium airframe bulkheads.",
            "specs": ["5-Axis Simultaneous Trunnion", "12,000 RPM Inline Spindle", "High-Pressure Through-Spindle Coolant"],
            "capacity": "2 slots/week (8 hrs each)",
            "image_url": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
        },
        {
            "org_slug": "medicaps-additive",
            "title": "Subsonic Low-Turbulence Aerodynamic Wind Tunnel",
            "type": "equipment",
            "category": "Space",
            "lab_name": "Medi-Caps Aerodynamics & Fluid Testing Facility",
            "availability": "Available Tuesdays & Thursdays 13:00 - 18:00",
            "faculty_poc": "Dr. Nitin Kulkarni",
            "description": "Instrumented test chamber with 6-component force balance for aerodynamic lift, drag, and wing airfoil optimization.",
            "specs": ["600mm x 600mm Test Section", "Velocity Range 5 - 45 m/s", "Automated Smoke & Particle Laser PIV"],
            "capacity": "3 testing sessions/week",
            "image_url": "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=800&q=80",
        },
        {
            "org_slug": "davv-ai-group",
            "title": "NVIDIA DGX H100 Distributed Compute Slice",
            "type": "field_access",
            "category": "Compute",
            "lab_name": "DAVV Spatial Intelligence GPU Cluster",
            "availability": "24/7 Remote SSH & Slurm Queue Access",
            "faculty_poc": "Dr. Pratosh Bansal",
            "description": "Accelerated FP8/FP16 training node for custom transformer perception models, vision encoders, and sensor fusion.",
            "specs": ["8x NVIDIA H100 80GB SXM5", "3.2 Tbps InfiniBand Interconnect", "NVLink 900 GB/s"],
            "capacity": "Dedicated 16 GPU hours per reservation",
            "image_url": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
        },
    ]

    for item_data in exchange_items:
        org = org_map[item_data["org_slug"]]
        item = ExchangeItem(
            organization_id=org.id,
            title=item_data["title"],
            type=item_data["type"],
            category=item_data["category"],
            lab_name=item_data["lab_name"],
            availability=item_data["availability"],
            faculty_poc=item_data["faculty_poc"],
            description=item_data["description"],
            specs=item_data["specs"],
            capacity=item_data["capacity"],
            status="Available",
            image_url=item_data["image_url"],
        )
        db.add(item)

    # 4. Multi-Sig Project Charter
    iit_org = org_map["iit-indore-robotics"]
    davv_org = org_map["davv-ai-group"]
    coep_org = org_map["coep-robotics"]

    charter = ProjectCharter(
        title="Autonomous Agricultural Drone with Multispectral Vision",
        project_goal="Design, manufacture, and fly an autonomous fixed-wing drone equipped with edge AI crop disease segmentation.",
        status="active",
        escrow_status="Active",
        contract_hash="0x77d9c612ea09b782c5f609e99a4c0a87f12e12b4",
    )
    db.add(charter)
    await db.flush()

    # Add Participants
    db.add(CharterParticipant(
        charter_id=charter.id,
        organization_id=iit_org.id,
        role="Lead Flight Hardware & Telemetry",
        allocated_hours_per_week=25,
        has_signed=True,
        signed_at="2026-10-12 10:30:00",
        signatory_name="Aarav Sharma (Club Lead)",
    ))
    db.add(CharterParticipant(
        charter_id=charter.id,
        organization_id=davv_org.id,
        role="Vision Intelligence & TensorRT Pipeline",
        allocated_hours_per_week=20,
        has_signed=True,
        signed_at="2026-10-12 11:15:00",
        signatory_name="Ananya Verma (AI Lead)",
    ))
    db.add(CharterParticipant(
        charter_id=charter.id,
        organization_id=coep_org.id,
        role="Airframe CNC Milling & Stress Validation",
        allocated_hours_per_week=18,
        has_signed=True,
        signed_at="2026-10-12 14:00:00",
        signatory_name="Dr. S. S. Ohol (Faculty POC)",
    ))

    # Add Milestones
    db.add(CharterMilestone(
        charter_id=charter.id,
        title="M1: Airframe CAD & Stress FEA Simulation",
        assigned_organization_id=coep_org.id,
        deadline="2026-10-25",
        status="verified_proof",
        proof_url="https://github.com/nexuscollab/agri-drone/pull/14",
        proof_type="cad_model",
        proof_hash="0xa9f381c0...42e881 (IPFS Minted)",
        verified_by=["IIT Indore Robotics Club", "DAVV AI Group"],
        required_signatures=2,
        spec_notes="Airframe withstands 4.5G pullout acceleration in ANSYS static structural analysis.",
    ))
    db.add(CharterMilestone(
        charter_id=charter.id,
        title="M2: TensorRT INT8 Model Quantization on Jetson Orin",
        assigned_organization_id=davv_org.id,
        deadline="2026-11-05",
        status="in_review",
        proof_url="https://github.com/nexuscollab/agri-drone/pull/22",
        proof_type="github_pr",
        verified_by=["IIT Indore Robotics Club"],
        required_signatures=2,
        spec_notes="Demonstrating 42 FPS segmentation inference at under 15W TDP.",
    ))
    db.add(CharterMilestone(
        charter_id=charter.id,
        title="M3: Full Autonomous Flight & Crop Map Delivery",
        assigned_organization_id=iit_org.id,
        deadline="2026-11-20",
        status="committed",
        required_signatures=2,
        spec_notes="Complete 25-minute autonomous survey flight with live telemetry feed.",
    ))

    await db.commit()
    logger.info("Database seeding completed successfully.")
