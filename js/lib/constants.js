"use strict";

const DISCIPLINES = [
  "Electrical", "HVAC", "Fire Fighting", "Plumbing", "ELV", "BMS",
  "Lifts", "Solar", "MEP Estimation", "Codes & Standards",
];

const DISCIPLINE_FILTER_OPTIONS = ["All MEP", ...DISCIPLINES];

const TOPICS_BY_DISCIPLINE = {
  "Electrical": ["Electrical Fundamentals","Three-Phase Systems & Transformers","HT Systems & Switchgear","LT Switchgear & Protection","Metering & Power Quality","DG Sets & Standby Power","UPS & Batteries","Electrical Panels & Distribution","Motors & Starters","Cables & Conductors","Cable Containment Systems","Earthing & Lightning Protection","Electrical Safety, Testing & Commissioning","Electrical BOQ & Estimation"],
  "HVAC": ["HVAC Fundamentals & Psychrometrics","Refrigeration Cycle","Chillers","Air Handling Units","VRF/VRV & DX Systems","Package & Split AC Systems","Cooling Towers & Condenser Water","Chilled Water Systems & Pumps","Valves, Strainers & Expansion Tanks","Ducting & Insulation","Air Distribution & Dampers","Ventilation & Smoke Management","HVAC Controls, TAB & Commissioning","HVAC BOQ & Estimation"],
  "Fire Fighting": ["Fire Protection Fundamentals","Fire Water Supply & Pumps","Hydrant Systems","Sprinkler Systems","Special Suppression Systems","Fire Extinguishers & Portable Equipment","Fire-Rated Piping & Fire Stopping","Hydraulic Calculations & Pump Sizing","Fire Fighting BOQ & Estimation","Fire Codes, Testing & Commissioning"],
  "Plumbing": ["Domestic Water Supply","Water Storage & Pumping Systems","Drainage & Vent Systems","Rainwater & Storm Water Drainage","Sewage Treatment (STP/WTP/RO)","Plumbing Valves & Fixtures","Pipe Materials & Selection","Plumbing Calculations & Sizing","Plumbing BOQ, Testing & Commissioning"],
  "ELV": ["CCTV Systems","Structured Cabling & Networking","Access Control Systems","Fire Alarm Systems","Public Address & Voice Evacuation","Intercom, SMATV & IPTV","Intrusion & Gas Detection","Emergency Lighting","ELV Containment & Infrastructure","ELV BOQ & Estimation"],
  "BMS": ["BMS Fundamentals & Architecture","Controllers & Field Devices","HVAC & Lighting Control Integration","Communication Protocols","BMS Graphics, Alarms & Trends","Points Lists & I/O Calculations","BMS BOQ & Estimation"],
  "MEP Estimation": ["BOQ & Quantity Take-off Fundamentals","Rate Analysis & Costing","Electrical Estimation","HVAC Estimation","Fire Fighting Estimation","Plumbing Estimation","ELV & BMS Estimation","Drawing & Specification Interpretation","Tendering, Queries & Scope Management","Measurement Principles"],
  "Codes & Standards": ["National Building Code (NBC)","Indian Standards (IS Codes)","International Standards (IEC/IEEE/NEC)","Fire Codes (NFPA)","HVAC Standards (ASHRAE/SMACNA)","Electrical Safety Standards","Testing & Inspection Requirements","MEP Coordination Practices"],
  "Lifts": ["Lift Fundamentals & Types","Traction & Machine Room Systems","Lift Safety Systems","Lift Electrical & Control Systems","Lift Selection & Traffic Analysis","Lift Codes & Commissioning"],
  "Solar": ["Solar PV Fundamentals","Solar Panel Types & Technology","Inverters & Balance of System","Solar System Sizing & Design","Grid-Tied & Off-Grid Systems","Solar Codes & Net Metering"],
};

function topicsFor(discipline) {
  if (discipline === "All MEP" || !discipline) {
    return Array.from(new Set(Object.values(TOPICS_BY_DISCIPLINE).flat())).sort();
  }
  return TOPICS_BY_DISCIPLINE[discipline] || [];
}

const DIFFICULTIES = ["Basic", "Intermediate", "Advanced"];
const DIFFICULTY_FILTER_OPTIONS = ["All", ...DIFFICULTIES];
const QUESTION_COUNT_OPTIONS = [10, 20, 25, 50, 100, 200];
const TIME_LIMIT_OPTIONS = [30, 60, 90, 120];
const EXAM_MODES = [
  { value: "practice", label: "Practice Mode", description: "Instant feedback after each question. No timer." },
  { value: "timed", label: "Timed Exam", description: "A fixed time limit for the whole exam." },
  { value: "mock", label: "Mock Test", description: "Simulates a real exam: timed, feedback only at the end." },
];
