// Starter crosswalk of common military occupations to civilian roles.
// Extend freely; O*NET's Military Crosswalk is a good source for more codes.

export type Branch = "Army" | "Navy" | "Air Force" | "Marine Corps" | "Coast Guard" | "Space Force";

export interface OccupationCode {
  code: string;
  branch: Branch;
  title: string;
  civilianTitles: string[];
  skills: string[];
}

export const OCCUPATION_CODES: OccupationCode[] = [
  // Army MOS
  { code: "11B", branch: "Army", title: "Infantryman", civilianTitles: ["Security Manager", "Operations Supervisor", "Law Enforcement Officer", "Team Lead"], skills: ["Team Leadership", "Risk Assessment", "Crisis Management", "Training & Development", "Physical Security"] },
  { code: "12B", branch: "Army", title: "Combat Engineer", civilianTitles: ["Construction Supervisor", "Site Safety Manager", "Civil Engineering Technician"], skills: ["Construction Management", "Heavy Equipment Operation", "Site Safety", "Project Planning"] },
  { code: "13F", branch: "Army", title: "Fire Support Specialist", civilianTitles: ["Operations Coordinator", "GIS Technician", "Communications Coordinator"], skills: ["Geospatial Analysis", "Radio Communications", "Coordination", "Data Analysis"] },
  { code: "15T", branch: "Army", title: "UH-60 Helicopter Repairer", civilianTitles: ["Aircraft Maintenance Technician", "A&P Mechanic", "Aviation Quality Inspector"], skills: ["Aircraft Maintenance", "Hydraulic Systems", "Technical Manuals", "Quality Assurance"] },
  { code: "17C", branch: "Army", title: "Cyber Operations Specialist", civilianTitles: ["Cybersecurity Analyst", "Penetration Tester", "Security Operations Center Analyst"], skills: ["Network Security", "Incident Response", "Threat Analysis", "Vulnerability Assessment"] },
  { code: "25B", branch: "Army", title: "Information Technology Specialist", civilianTitles: ["IT Support Specialist", "Systems Administrator", "Network Administrator", "Help Desk Manager"], skills: ["Network Administration", "Windows Server", "Active Directory", "Technical Support", "Cybersecurity"] },
  { code: "25U", branch: "Army", title: "Signal Support Systems Specialist", civilianTitles: ["Telecommunications Technician", "Radio Frequency Technician", "IT Technician"], skills: ["RF Communications", "Network Troubleshooting", "Equipment Installation"] },
  { code: "31B", branch: "Army", title: "Military Police", civilianTitles: ["Police Officer", "Security Supervisor", "Loss Prevention Manager", "Corrections Officer"], skills: ["Law Enforcement", "Investigations", "Report Writing", "Conflict Resolution", "Physical Security"] },
  { code: "35F", branch: "Army", title: "Intelligence Analyst", civilianTitles: ["Intelligence Analyst", "Data Analyst", "Risk Analyst", "Business Intelligence Analyst"], skills: ["Data Analysis", "Research", "Briefing", "Threat Assessment", "Report Writing"] },
  { code: "42A", branch: "Army", title: "Human Resources Specialist", civilianTitles: ["HR Specialist", "HR Generalist", "Personnel Administrator", "Payroll Specialist"], skills: ["HRIS", "Records Management", "Personnel Actions", "Customer Service", "Compliance"] },
  { code: "68W", branch: "Army", title: "Combat Medic Specialist", civilianTitles: ["EMT / Paramedic", "Medical Assistant", "Emergency Room Technician", "Clinical Coordinator"], skills: ["Emergency Medical Care", "Patient Assessment", "Triage", "Medical Documentation", "BLS/ACLS"] },
  { code: "88M", branch: "Army", title: "Motor Transport Operator", civilianTitles: ["CDL Truck Driver", "Fleet Manager", "Transportation Coordinator", "Dispatcher"], skills: ["Fleet Operations", "Route Planning", "Vehicle Maintenance", "DOT Compliance"] },
  { code: "91B", branch: "Army", title: "Wheeled Vehicle Mechanic", civilianTitles: ["Diesel Mechanic", "Automotive Technician", "Fleet Maintenance Supervisor"], skills: ["Diesel Engines", "Diagnostics", "Preventive Maintenance", "Parts Management"] },
  { code: "92A", branch: "Army", title: "Automated Logistical Specialist", civilianTitles: ["Inventory Manager", "Warehouse Supervisor", "Supply Chain Analyst", "Logistics Coordinator"], skills: ["Inventory Control", "Supply Chain Management", "ERP Systems", "Warehouse Operations", "Procurement"] },
  { code: "92Y", branch: "Army", title: "Unit Supply Specialist", civilianTitles: ["Supply Clerk", "Purchasing Agent", "Property Manager", "Materials Coordinator"], skills: ["Property Accountability", "Purchasing", "Inventory Audits", "Records Management"] },
  // Navy ratings
  { code: "IT", branch: "Navy", title: "Information Systems Technician", civilianTitles: ["Network Engineer", "Systems Administrator", "IT Specialist"], skills: ["Network Administration", "Cybersecurity", "Satellite Communications", "System Maintenance"] },
  { code: "HM", branch: "Navy", title: "Hospital Corpsman", civilianTitles: ["Medical Assistant", "LPN", "Emergency Medical Technician", "Healthcare Administrator"], skills: ["Patient Care", "Emergency Medicine", "Medical Records", "Pharmacology"] },
  { code: "MM", branch: "Navy", title: "Machinist's Mate", civilianTitles: ["Maintenance Technician", "Power Plant Operator", "HVAC Technician"], skills: ["Mechanical Systems", "Preventive Maintenance", "Steam & Power Systems", "Troubleshooting"] },
  { code: "ET", branch: "Navy", title: "Electronics Technician", civilianTitles: ["Electronics Technician", "Field Service Engineer", "Instrumentation Technician"], skills: ["Electronics Repair", "Radar Systems", "Schematics", "Calibration"] },
  { code: "LS", branch: "Navy", title: "Logistics Specialist", civilianTitles: ["Logistics Coordinator", "Purchasing Agent", "Inventory Specialist"], skills: ["Supply Chain Management", "Inventory Control", "Procurement", "Shipping & Receiving"] },
  { code: "YN", branch: "Navy", title: "Yeoman", civilianTitles: ["Administrative Manager", "Executive Assistant", "Office Manager"], skills: ["Administration", "Correspondence", "Records Management", "Scheduling"] },
  { code: "MA", branch: "Navy", title: "Master-at-Arms", civilianTitles: ["Police Officer", "Security Manager", "Corporate Security Specialist"], skills: ["Law Enforcement", "Force Protection", "Investigations", "Antiterrorism"] },
  // Air Force AFSC
  { code: "1N0X1", branch: "Air Force", title: "All Source Intelligence Analyst", civilianTitles: ["Intelligence Analyst", "Data Analyst", "Threat Intelligence Analyst"], skills: ["Intelligence Analysis", "Briefing", "Research", "Geospatial Analysis"] },
  { code: "1D7X1", branch: "Air Force", title: "Cyber Defense Operations", civilianTitles: ["Network Administrator", "Cybersecurity Specialist", "Systems Engineer"], skills: ["Network Defense", "Systems Administration", "Incident Response", "Cloud Infrastructure"] },
  { code: "2A3X3", branch: "Air Force", title: "Tactical Aircraft Maintenance", civilianTitles: ["Aircraft Mechanic", "Aviation Maintenance Supervisor", "Quality Assurance Inspector"], skills: ["Aircraft Maintenance", "Technical Data", "Safety Compliance", "Team Supervision"] },
  { code: "2S0X1", branch: "Air Force", title: "Materiel Management", civilianTitles: ["Inventory Manager", "Supply Chain Specialist", "Warehouse Manager"], skills: ["Inventory Management", "Supply Chain", "ERP Systems", "Asset Tracking"] },
  { code: "3F0X1", branch: "Air Force", title: "Personnel", civilianTitles: ["HR Specialist", "Personnel Coordinator", "Benefits Administrator"], skills: ["Human Resources", "Customer Service", "Records Management", "HRIS"] },
  { code: "3P0X1", branch: "Air Force", title: "Security Forces", civilianTitles: ["Police Officer", "Security Supervisor", "Emergency Management Specialist"], skills: ["Law Enforcement", "Physical Security", "Emergency Response", "Team Leadership"] },
  { code: "4N0X1", branch: "Air Force", title: "Aerospace Medical Service", civilianTitles: ["Medical Technician", "EMT", "Clinical Assistant"], skills: ["Patient Care", "Emergency Medicine", "Clinical Procedures", "Medical Documentation"] },
  // Marine Corps MOS
  { code: "0311", branch: "Marine Corps", title: "Rifleman", civilianTitles: ["Security Supervisor", "Operations Lead", "Law Enforcement Officer"], skills: ["Team Leadership", "Risk Management", "Crisis Response", "Training"] },
  { code: "0411", branch: "Marine Corps", title: "Maintenance Management Specialist", civilianTitles: ["Maintenance Planner", "Maintenance Coordinator", "Asset Manager"], skills: ["Maintenance Planning", "Records Management", "Asset Tracking", "Scheduling"] },
  { code: "0621", branch: "Marine Corps", title: "Field Radio Operator", civilianTitles: ["Radio Technician", "Telecommunications Specialist", "Dispatcher"], skills: ["Radio Communications", "Equipment Maintenance", "Network Setup"] },
  { code: "3043", branch: "Marine Corps", title: "Supply Administration and Operations Specialist", civilianTitles: ["Supply Chain Coordinator", "Purchasing Specialist", "Inventory Analyst"], skills: ["Procurement", "Inventory Management", "Budget Tracking", "Audits"] },
  { code: "3531", branch: "Marine Corps", title: "Motor Vehicle Operator", civilianTitles: ["CDL Driver", "Transportation Supervisor", "Logistics Driver"], skills: ["Vehicle Operations", "Route Planning", "Safety Compliance", "Cargo Handling"] },
  // Coast Guard / Space Force
  { code: "BM", branch: "Coast Guard", title: "Boatswain's Mate", civilianTitles: ["Marine Operations Supervisor", "Harbor Master", "Vessel Operator"], skills: ["Vessel Operations", "Seamanship", "Search and Rescue", "Team Supervision"] },
  { code: "5S0X1", branch: "Space Force", title: "Space Systems Operations", civilianTitles: ["Satellite Operator", "Systems Engineer", "Mission Operations Specialist"], skills: ["Satellite Operations", "Orbital Mechanics", "Systems Monitoring", "Data Analysis"] },
];

export function findOccupation(code: string): OccupationCode | undefined {
  const needle = code.trim().toUpperCase();
  if (!needle) return undefined;
  return OCCUPATION_CODES.find((o) => o.code.toUpperCase() === needle);
}

export function searchOccupations(query: string, limit = 8): OccupationCode[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return OCCUPATION_CODES.filter(
    (o) =>
      o.code.toLowerCase().includes(q) ||
      o.title.toLowerCase().includes(q) ||
      o.civilianTitles.some((t) => t.toLowerCase().includes(q)),
  ).slice(0, limit);
}
