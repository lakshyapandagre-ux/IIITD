export type Domain = "Robotics" | "AI" | "Biotech" | "Design" | "Hardware" | "Energy";

export type VerificationTier = 
  | "Tier 1 Dean Verified"
  | "Tier 2 Faculty Verified"
  | "DST Gov-Endorsed"
  | "Incubator Backed";

export interface AlgorithmicScore {
  composite: number; // 0 to 100
  skillComplementarity: number; // C (0 to 100)
  goalAlignment: number; // G (0 to 100)
  resourceAvailability: number; // R (0 to 100)
  verificationTrust: number; // T (0 to 100)
  rationale: string;
}

export interface Club {
  id: string;
  name: string;
  institution: string;
  campusCode: string;
  domain: Domain;
  verificationStatus: VerificationTier;
  domainAttestation: string; // e.g. "iiti.ac.in"
  facultyPOC: string;
  leadStudent: string;
  avatarUrl: string;
  bannerGradient: string;
  offers: {
    title: string;
    category: "skill" | "equipment" | "space" | "dataset";
    capacity: string;
    tags: string[];
  }[];
  needs: {
    title: string;
    urgency: "Low" | "High" | "Blocker";
    category: string;
  }[];
  scores: AlgorithmicScore;
  isOverlooked?: boolean; // For Exploration Boost
  activeProjectsCount: number;
  completedChartersCount: number;
  weeklyAvailableHours: number;
  labAddress: string;
}

export interface CoalitionRequirement {
  id: string;
  title: string;
  coveredByClubId?: string;
  coveredSkill?: string;
}

export interface CoalitionSlot {
  slotNumber: number;
  role: string;
  club?: Club;
  coveredCapability?: string;
}

export interface MissingAdvisorTip {
  warning: string;
  suggestedPartner: string;
  collegeName: string;
  clubId: string;
  missingCapability: string;
}

export interface Milestone {
  id: string;
  title: string;
  assignedClubId: string;
  assignedClubName: string;
  deadline: string;
  status: "Committed" | "In Review" | "Verified Proof";
  proofUrl?: string;
  proofType?: "github_pr" | "cad_model" | "lab_report" | "ipfs_hash";
  proofHash?: string;
  verifiedBy: string[]; // List of college names that signed off
  requiredSignatures: number;
  specNotes: string;
}

export interface CharterDeliverable {
  id: string;
  title: string;
  ownerCollege: string;
  allocatedHoursPerWeek: number;
  outputArtifact: string;
}

export interface Charter {
  id: string;
  title: string;
  projectGoal: string;
  participatingClubs: {
    clubId: string;
    clubName: string;
    institution: string;
    signed: boolean;
    signedAt?: string;
    signatoryName: string;
    allocatedHours: number;
  }[];
  deliverables: CharterDeliverable[];
  milestones: Milestone[];
  escrowStatus: "Active" | "Pending Multi-Sig" | "Concluded";
  contractHash: string;
}

export interface ExchangeItem {
  id: string;
  title: string;
  type: "equipment" | "human_resource";
  category: Domain;
  institution: string;
  labName: string;
  availability: string; // e.g. "Available Saturdays 09:00 - 17:00"
  facultyPOC: string;
  description: string;
  specs: string[];
  capacity: string; // e.g. "2 engineers available for 3-week sprint"
  status: "Available" | "Reserved" | "In Maintenance";
  imageUrl: string;
  reservedUntil?: string;
  reservedBy?: string;
}

export interface HistoricalProof {
  id: string;
  projectTitle: string;
  partnerClub: string;
  partnerCollege: string;
  completionDate: string;
  rating: number; // out of 5
  testimonial: string;
  artifactPill: string;
  verifiedStamp: string;
}
