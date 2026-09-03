import { randInt, randFloat, pick } from "../lib/rng.mjs";
import { buildFromFactBank, buildCalcSet, roundRobinTrim } from "../lib/engine.mjs";

const D = "ELV";
const TARGET = 500;
const CONCEPTUAL_TARGET = 200;

const FACTS = [
  // CCTV Systems
  { term: "IP Camera", topic: "CCTV Systems", difficulty: "Basic", tags: ["cctv"],
    definition: "A camera that captures and transmits video digitally over a network, typically using Ethernet or PoE.",
    function: "To provide network-based video surveillance that can be viewed, stored, and managed over IP infrastructure.",
    fact: "IP cameras commonly support higher resolutions and easier network integration than analog cameras." },
  { term: "Analog Camera", topic: "CCTV Systems", difficulty: "Basic", tags: ["cctv"],
    definition: "A camera that transmits video as an analog signal over coaxial cable to a recording device such as a DVR.",
    function: "To provide a cost-effective surveillance solution using traditional coaxial cabling infrastructure.",
    fact: "Analog CCTV systems typically use a DVR to digitize and store video from multiple analog cameras." },
  { term: "NVR (Network Video Recorder)", topic: "CCTV Systems", difficulty: "Intermediate", tags: ["cctv"],
    definition: "A recording device that stores video from IP cameras over a network, typically receiving already-digitized video streams.",
    function: "To record, store, and manage video footage captured by IP cameras across a surveillance network.",
    fact: "NVRs record digital video streams received over the network, unlike DVRs which digitize incoming analog signals." },
  { term: "DVR (Digital Video Recorder)", topic: "CCTV Systems", difficulty: "Basic", tags: ["cctv"],
    definition: "A recording device that digitizes and stores video from analog cameras connected via coaxial cable.",
    function: "To convert and store analog camera feeds as digital video for later review.",
    fact: "DVRs are typically used with analog or HD-over-coax camera systems rather than IP camera systems." },
  { term: "PoE (Power over Ethernet)", topic: "CCTV Systems", difficulty: "Intermediate", tags: ["cctv", "networking"],
    definition: "A technology that delivers electrical power to networked devices, such as IP cameras, over the same cable used for data.",
    function: "To simplify installation by eliminating the need for a separate power cable to devices like IP cameras and access points.",
    fact: "PoE switches are commonly used to power IP cameras, eliminating the need for local power outlets near each camera." },
  { term: "Video Management System (VMS)", topic: "CCTV Systems", difficulty: "Intermediate", tags: ["cctv"],
    definition: "Software that manages video feeds from multiple cameras, providing live viewing, recording, playback, and analytics.",
    function: "To centralize monitoring, recording, and management of a CCTV system's video streams.",
    fact: "A VMS can typically integrate video analytics such as motion detection, line crossing, and facial recognition." },
  { term: "Camera Resolution (Megapixel)", topic: "CCTV Systems", difficulty: "Basic", tags: ["cctv"],
    definition: "A measure of the level of detail an IP camera can capture, expressed in megapixels.",
    function: "To indicate the image clarity and level of detail available for identification and analysis purposes.",
    fact: "Higher megapixel cameras generally require more storage space and network bandwidth than lower-resolution cameras." },

  // Structured Cabling & Networking
  { term: "Structured Cabling System", topic: "Structured Cabling & Networking", difficulty: "Basic", tags: ["cabling"],
    definition: "A standardized cabling infrastructure design supporting multiple types of network and communication services within a building.",
    function: "To provide a flexible, organized cabling backbone supporting data, voice, and other low-current systems.",
    fact: "Structured cabling systems are typically organized into horizontal cabling, backbone cabling, and work area components." },
  { term: "Cat6 Cable", topic: "Structured Cabling & Networking", difficulty: "Basic", tags: ["cabling"],
    definition: "A twisted-pair copper cable standard supporting Gigabit Ethernet networking over structured cabling systems.",
    function: "To carry high-speed network data between network equipment and end devices within a building.",
    fact: "Cat6 cabling generally supports higher data rates and better noise immunity than earlier Cat5e cabling." },
  { term: "Cat6A Cable", topic: "Structured Cabling & Networking", difficulty: "Intermediate", tags: ["cabling"],
    definition: "An augmented Cat6 cable standard supporting 10 Gigabit Ethernet over longer distances than standard Cat6.",
    function: "To support higher-bandwidth applications requiring 10 Gigabit Ethernet performance over structured cabling.",
    fact: "Cat6A cabling typically has improved shielding and construction to reduce crosstalk at higher data rates than Cat6." },
  { term: "Fiber Optic Cable", topic: "Structured Cabling & Networking", difficulty: "Intermediate", tags: ["cabling"],
    definition: "A cable that transmits data as light signals through glass or plastic fibers, offering high bandwidth over long distances.",
    function: "To carry high-bandwidth data over longer distances than copper cabling typically allows, with immunity to electromagnetic interference.",
    fact: "Fiber optic cables are commonly used for backbone links between IT racks, floors, or buildings due to their distance and bandwidth advantages." },
  { term: "Patch Panel", topic: "Structured Cabling & Networking", difficulty: "Basic", tags: ["cabling"],
    definition: "A mounted panel with multiple ports used to terminate and organize cabling connections within a rack or cabinet.",
    function: "To provide an organized, manageable termination point for structured cabling within a network rack.",
    fact: "Patch panels simplify moves, adds, and changes by allowing reconnections at a centralized point rather than at the cable's far end." },
  { term: "Network Switch", topic: "Structured Cabling & Networking", difficulty: "Basic", tags: ["networking"],
    definition: "A networking device that connects multiple devices on a local network and forwards data between them.",
    function: "To interconnect networked devices such as computers, cameras, and access points within a local area network.",
    fact: "Managed network switches offer configuration features such as VLANs and PoE budget management, unlike basic unmanaged switches." },
  { term: "IT Rack", topic: "Structured Cabling & Networking", difficulty: "Basic", tags: ["cabling"],
    definition: "An enclosure or frame used to mount network switches, patch panels, servers, and other IT/ELV equipment in an organized manner.",
    function: "To organize and protect networking and ELV equipment while providing structured cable management.",
    fact: "IT racks are typically sized in rack units (U) to standardize the mounting of 19-inch equipment." },

  // Access Control Systems
  { term: "Access Control System", topic: "Access Control Systems", difficulty: "Basic", tags: ["access-control"],
    definition: "A system that regulates and monitors entry to a building or restricted area using credentials such as cards or biometrics.",
    function: "To restrict physical access to authorized personnel only and maintain a record of entry and exit events.",
    fact: "Access control systems typically log all access attempts, whether granted or denied, for security auditing purposes." },
  { term: "Card Reader", topic: "Access Control Systems", difficulty: "Basic", tags: ["access-control"],
    definition: "A device that reads access credentials from a proximity card or smart card to grant or deny entry.",
    function: "To authenticate a presented access card and communicate the credential to the access control panel for a decision.",
    fact: "Card readers are commonly installed at doors, turnstiles, and other controlled access points." },
  { term: "Biometric Reader", topic: "Access Control Systems", difficulty: "Intermediate", tags: ["access-control"],
    definition: "A device that authenticates identity using a unique biological characteristic, such as a fingerprint or facial pattern.",
    function: "To provide a higher level of identity assurance than card-based credentials alone, since biometrics cannot be easily shared or lost.",
    fact: "Biometric readers are often combined with a card or PIN for two-factor authentication in higher-security areas." },
  { term: "Door Access Controller", topic: "Access Control Systems", difficulty: "Intermediate", tags: ["access-control"],
    definition: "A control panel that makes access decisions for one or more doors based on presented credentials and programmed rules.",
    function: "To process access requests, verify credentials against a database, and command the door lock accordingly.",
    fact: "Door access controllers typically maintain a local decision capability even if network connectivity to the central server is temporarily lost." },
  { term: "Electromagnetic Lock", topic: "Access Control Systems", difficulty: "Intermediate", tags: ["access-control"],
    definition: "A locking device that uses an electromagnet to hold a door closed, releasing when power is removed or a valid access command is given.",
    function: "To securely hold a door closed under normal conditions while allowing controlled, fail-safe release when needed.",
    fact: "Electromagnetic locks are typically wired fail-safe, meaning they unlock automatically on loss of power, for life-safety egress." },
  { term: "Electric Strike", topic: "Access Control Systems", difficulty: "Intermediate", tags: ["access-control"],
    definition: "A locking device fitted into a door frame that releases the latch when energized, allowing the door to be opened.",
    function: "To allow remote or automatic release of a standard mechanical door latch without replacing the entire lock.",
    fact: "Electric strikes can be configured as fail-safe or fail-secure depending on the required behavior during a power failure." },
  { term: "Request-to-Exit (REX) Device", topic: "Access Control Systems", difficulty: "Advanced", tags: ["access-control"],
    definition: "A sensor or push button that signals the access control system to release the door lock for exit, without requiring a credential.",
    function: "To allow free egress from a secured area while still requiring credentials for entry, as required by life-safety codes.",
    fact: "Request-to-exit devices are commonly used to prevent alarm activation when authorized personnel exit through a secured, monitored door." },

  // Fire Alarm Systems
  { term: "Addressable Fire Alarm System", topic: "Fire Alarm Systems", difficulty: "Intermediate", tags: ["fire-alarm"],
    definition: "A fire alarm system where each device on the loop has a unique address, allowing the panel to identify the exact device in alarm.",
    function: "To provide precise identification of the location and device in an alarm condition, speeding up emergency response.",
    fact: "Addressable systems can typically identify the specific detector or device that triggered an alarm, unlike conventional zone-based systems." },
  { term: "Conventional Fire Alarm System", topic: "Fire Alarm Systems", difficulty: "Basic", tags: ["fire-alarm"],
    definition: "A fire alarm system where devices are wired in zones, indicating only the zone, not the specific device, in an alarm condition.",
    function: "To provide basic fire detection and alarm indication by zone, suitable for smaller or simpler installations.",
    fact: "Conventional systems identify only the zone of an alarm, requiring physical search within that zone to locate the actual device." },
  { term: "Smoke Detector", topic: "Fire Alarm Systems", difficulty: "Basic", tags: ["fire-alarm"],
    definition: "A device that detects the presence of smoke, typically using optical (photoelectric) or ionization sensing technology.",
    function: "To provide early detection of a developing fire by sensing smoke before flames or excessive heat develop.",
    fact: "Optical smoke detectors are generally more responsive to smoldering fires, while ionization detectors respond faster to flaming fires." },
  { term: "Heat Detector", topic: "Fire Alarm Systems", difficulty: "Basic", tags: ["fire-alarm"],
    definition: "A device that triggers an alarm when ambient temperature exceeds a fixed threshold or rises at an abnormally fast rate.",
    function: "To detect fire in areas where smoke detectors are unsuitable, such as kitchens or dusty environments prone to false alarms.",
    fact: "Heat detectors are commonly used in areas where smoke detectors would be prone to nuisance alarms, such as kitchens or garages." },
  { term: "Manual Call Point (MCP)", topic: "Fire Alarm Systems", difficulty: "Basic", tags: ["fire-alarm"],
    definition: "A manually operated device, typically a break-glass unit, that allows occupants to manually raise a fire alarm.",
    function: "To allow a building occupant who discovers a fire to immediately raise an alarm without waiting for automatic detection.",
    fact: "Manual call points are typically installed along escape routes and near exits for easy access during an emergency." },
  { term: "Fire Alarm Sounder", topic: "Fire Alarm Systems", difficulty: "Basic", tags: ["fire-alarm"],
    definition: "A device that produces an audible alarm signal to warn occupants of a fire condition.",
    function: "To alert building occupants audibly that a fire has been detected and evacuation may be required.",
    fact: "Fire alarm sounders are typically designed to produce a sound level audible above ambient background noise throughout the space." },
  { term: "Beam Detector", topic: "Fire Alarm Systems", difficulty: "Advanced", tags: ["fire-alarm"],
    definition: "A smoke detection device that projects an infrared beam across a large area, detecting smoke that obscures the beam.",
    function: "To provide smoke detection coverage over large open areas, such as atriums or warehouses, where point detectors would be impractical.",
    fact: "Beam detectors are commonly used in large open spaces like atriums, warehouses, and auditoriums where ceiling height makes point detectors impractical." },

  // Public Address & Voice Evacuation
  { term: "Public Address (PA) System", topic: "Public Address & Voice Evacuation", difficulty: "Basic", tags: ["pa-system"],
    definition: "A system of speakers and amplifiers used to broadcast announcements throughout a building.",
    function: "To provide general announcements, background music, and emergency messaging to building occupants.",
    fact: "PA systems in commercial buildings are often integrated with the fire alarm system to provide voice evacuation messaging." },
  { term: "Voice Evacuation System", topic: "Public Address & Voice Evacuation", difficulty: "Intermediate", tags: ["pa-system"],
    definition: "A public address system specifically designed to broadcast pre-recorded or live emergency evacuation instructions during a fire.",
    function: "To provide clear, understandable evacuation instructions to occupants during a fire emergency, often more effective than a simple alarm tone.",
    fact: "Voice evacuation messages are often considered more effective than alarm tones alone in prompting appropriate occupant response." },
  { term: "Ceiling Speaker", topic: "Public Address & Voice Evacuation", difficulty: "Basic", tags: ["pa-system"],
    definition: "A speaker mounted flush in a ceiling, commonly used for PA and voice evacuation systems in commercial buildings.",
    function: "To distribute audio announcements evenly throughout an occupied space from an unobtrusive ceiling-mounted location.",
    fact: "Ceiling speakers are typically spaced to provide even audio coverage and adequate intelligibility throughout a room." },
  { term: "Horn Speaker", topic: "Public Address & Voice Evacuation", difficulty: "Basic", tags: ["pa-system"],
    definition: "A directional speaker often used outdoors or in high-noise areas, such as car parks, for PA announcements.",
    function: "To project audio clearly over longer distances or in high-ambient-noise environments where ceiling speakers would be ineffective.",
    fact: "Horn speakers are commonly used in car parks, plant rooms, and outdoor areas due to their higher output and directional projection." },
  { term: "PA Amplifier", topic: "Public Address & Voice Evacuation", difficulty: "Intermediate", tags: ["pa-system"],
    definition: "An electronic device that increases the power of an audio signal to drive multiple speakers throughout a PA system.",
    function: "To provide sufficient audio power to drive the speaker system's zones at an adequate and intelligible volume.",
    fact: "PA amplifiers are commonly sized with spare capacity to accommodate future speaker additions and system losses." },

  // Intercom, SMATV & IPTV
  { term: "Video Door Intercom", topic: "Intercom, SMATV & IPTV", difficulty: "Basic", tags: ["intercom"],
    definition: "A system allowing two-way audio and video communication between a visitor at a door and an occupant inside, often with remote door release.",
    function: "To allow occupants to see and speak with visitors before granting entry, improving security and convenience.",
    fact: "Video door intercom systems are commonly integrated with electric door locks or strikes for remote entry release." },
  { term: "SMATV System", topic: "Intercom, SMATV & IPTV", difficulty: "Intermediate", tags: ["smatv"],
    definition: "A system that distributes satellite and terrestrial TV signals from a shared antenna or dish to multiple units within a building.",
    function: "To provide shared television signal distribution to multiple units without requiring individual satellite dishes per unit.",
    fact: "SMATV systems allow a building to share a common antenna infrastructure, reducing the need for multiple individual dishes." },
  { term: "IPTV System", topic: "Intercom, SMATV & IPTV", difficulty: "Intermediate", tags: ["iptv"],
    definition: "A system that delivers television content to viewers over an IP network rather than traditional broadcast, satellite, or cable formats.",
    function: "To distribute television and video content over the building's existing IP network infrastructure.",
    fact: "IPTV systems can typically integrate with in-room hospitality features such as guest information and on-demand content in hotels." },
  { term: "Master Clock System", topic: "Intercom, SMATV & IPTV", difficulty: "Intermediate", tags: ["master-clock"],
    definition: "A centralized system that distributes a synchronized time signal to secondary clocks throughout a building or campus.",
    function: "To ensure all displayed clocks throughout a facility show a consistent, accurate, synchronized time.",
    fact: "Master clock systems are commonly used in institutional buildings such as hospitals, schools, and transit facilities." },

  // Intrusion & Gas Detection
  { term: "Intrusion Detection System", topic: "Intrusion & Gas Detection", difficulty: "Basic", tags: ["intrusion"],
    definition: "A system of sensors and a control panel that detects unauthorized entry into a protected building or area.",
    function: "To detect and alert on unauthorized entry attempts, triggering an alarm response.",
    fact: "Intrusion detection systems commonly combine door/window contacts, motion detectors, and a central control panel with remote monitoring." },
  { term: "PIR Motion Detector", topic: "Intrusion & Gas Detection", difficulty: "Basic", tags: ["intrusion"],
    definition: "A passive infrared sensor that detects movement by sensing changes in infrared radiation (heat) within its field of view.",
    function: "To detect the presence or movement of a person within a protected area as part of an intrusion detection system.",
    fact: "PIR motion detectors are one of the most common sensor types used in indoor intrusion detection systems." },
  { term: "Door/Window Contact", topic: "Intrusion & Gas Detection", difficulty: "Basic", tags: ["intrusion"],
    definition: "A magnetic sensor that detects when a door or window is opened, used as part of an intrusion detection system.",
    function: "To detect unauthorized opening of a monitored door or window and trigger an alarm signal.",
    fact: "Door and window contacts are typically among the most basic and widely used intrusion detection sensors." },
  { term: "Gas Detection System", topic: "Intrusion & Gas Detection", difficulty: "Intermediate", tags: ["gas-detection"],
    definition: "A system of sensors that detects the presence of hazardous or combustible gases and triggers an alarm or safety response.",
    function: "To provide early warning of gas leaks, protecting occupants and equipment from fire, explosion, or toxic exposure risks.",
    fact: "Gas detection systems are commonly installed in areas such as DG rooms, kitchens, and gas-fired plant rooms." },

  // Emergency Lighting
  { term: "Emergency Lighting", topic: "Emergency Lighting", difficulty: "Basic", tags: ["emergency-lighting"],
    definition: "Lighting that automatically activates during a power failure to illuminate escape routes and critical areas.",
    function: "To ensure occupants can safely evacuate a building during a power failure or emergency.",
    fact: "Emergency lighting is typically required to provide adequate illumination along escape routes for a minimum specified duration." },
  { term: "Exit Sign", topic: "Emergency Lighting", difficulty: "Basic", tags: ["emergency-lighting"],
    definition: "An illuminated sign indicating the direction of an emergency exit, typically remaining lit or illuminating during a power failure.",
    function: "To clearly guide occupants toward the nearest emergency exit during evacuation, especially in reduced visibility conditions.",
    fact: "Exit signs are commonly required to remain illuminated continuously or to activate automatically during a power failure." },
  { term: "Self-Contained Emergency Luminaire", topic: "Emergency Lighting", difficulty: "Intermediate", tags: ["emergency-lighting"],
    definition: "An emergency light fitting with its own internal battery, charger, and control circuitry, independent of a central battery system.",
    function: "To provide localized emergency illumination without requiring a dedicated central battery supply and wiring.",
    fact: "Self-contained emergency luminaires typically include a test facility to verify battery and lamp function periodically." },
  { term: "Central Battery System (Emergency Lighting)", topic: "Emergency Lighting", difficulty: "Advanced", tags: ["emergency-lighting"],
    definition: "A system where a single central battery bank supplies power to multiple emergency luminaires throughout a building during a power failure.",
    function: "To centralize emergency lighting power supply and maintenance at one location rather than in each individual fitting.",
    fact: "Central battery systems can simplify maintenance since batteries are consolidated at one location rather than distributed in every fitting." },

  // ELV Containment & Infrastructure
  { term: "ELV Containment", topic: "ELV Containment & Infrastructure", difficulty: "Basic", tags: ["containment"],
    definition: "Cable trays, conduits, and trunking dedicated to routing extra-low-voltage cabling such as CCTV, data, and fire alarm wiring.",
    function: "To provide organized, protected, and often segregated routing for ELV cabling, separate from LT power cabling.",
    fact: "ELV containment is typically routed with adequate separation from LT power cabling to minimize electromagnetic interference." },
  { term: "ELV Cable Trunking", topic: "ELV Containment & Infrastructure", difficulty: "Basic", tags: ["containment"],
    definition: "An enclosed rectangular channel used to route and protect ELV cables, often with a removable cover for access.",
    function: "To protect and organize ELV cabling while allowing easy access for future additions or modifications.",
    fact: "Cable trunking is commonly used in exposed or accessible areas where a tidy, serviceable cable route is required." },
  { term: "ELV Room", topic: "ELV Containment & Infrastructure", difficulty: "Intermediate", tags: ["containment"],
    definition: "A dedicated room housing ELV system head-end equipment such as CCTV NVRs, access control servers, and PA amplifiers.",
    function: "To centralize and secure critical ELV system equipment in a controlled environment.",
    fact: "ELV rooms are typically provided with dedicated power, cooling, and restricted access due to the criticality of the equipment housed." },
  { term: "Grounding for ELV Systems", topic: "ELV Containment & Infrastructure", difficulty: "Advanced", tags: ["containment"],
    definition: "Earthing provisions specifically for ELV equipment racks and enclosures to ensure safety and signal integrity.",
    function: "To protect ELV equipment and provide a stable reference potential, reducing noise and protecting against surges.",
    fact: "Proper ELV grounding helps reduce electromagnetic interference and protects sensitive electronic equipment from surge damage." },

  // ELV BOQ & Estimation
  { term: "ELV BOQ", topic: "ELV BOQ & Estimation", difficulty: "Basic", tags: ["estimation"],
    definition: "A bill of quantities listing cameras, cabling, panels, and other ELV system materials with quantities for pricing.",
    function: "To provide a standardized basis for pricing and comparing ELV works packages.",
    fact: "ELV BOQs typically list items separately by sub-system, such as CCTV, access control, fire alarm, and PA." },
  { term: "ELV Rate Analysis", topic: "ELV BOQ & Estimation", difficulty: "Intermediate", tags: ["estimation"],
    definition: "A detailed cost breakdown for ELV items covering equipment supply, cabling, installation, and testing labour.",
    function: "To establish and justify unit rates quoted for ELV BOQ items.",
    fact: "ELV rate analysis often separates equipment cost, such as camera or panel cost, from cabling and installation labour cost." },
  { term: "ELV System Integration", topic: "ELV BOQ & Estimation", difficulty: "Advanced", tags: ["estimation"],
    definition: "The process of connecting and configuring multiple ELV sub-systems, such as CCTV, access control, and fire alarm, to work together.",
    function: "To enable coordinated operation between ELV sub-systems, such as triggering cameras on an access control or intrusion alarm event.",
    fact: "System integration is often achieved by having sub-systems, such as CCTV, access control, and fire alarm, share event data through a common platform." },
];

const num = (n, unit, decimals = 2) => `${Number(n.toFixed(decimals)).toLocaleString("en-IN")} ${unit}`;
const near = (v, pct, rng) => v * (1 + (rng() * 2 - 1) * pct);

const CALC_TEMPLATES = [
  {
    name: "cctv-storage-sizing",
    weight: 7,
    spec: {
      discipline: D, topic: "CCTV Systems", subtopic: "Storage Sizing", tags: ["calculation"], difficulty: "Advanced",
      gen: (rng) => ({ cameras: randInt(rng, 8, 200), bitrateMbps: randFloat(rng, 2, 8, 1), days: pick(rng, [15, 30, 45, 60, 90]) }),
      compute: ({ cameras, bitrateMbps, days }) => {
        const totalMbps = cameras * bitrateMbps;
        const bytesPerSec = (totalMbps * 1_000_000) / 8;
        const totalBytes = bytesPerSec * 86400 * days;
        const tb = totalBytes / 1e12;
        return { formatted: num(tb, "TB", 2), value: tb };
      },
      question: ({ cameras, bitrateMbps, days }) =>
        `A CCTV system has ${cameras} IP cameras, each streaming at an average bitrate of ${bitrateMbps} Mbps, continuously recorded for a retention period of ${days} days. What is the approximate total storage capacity required?`,
      explanation: ({ cameras, bitrateMbps, days }, formatted) =>
        `Total bitrate = Cameras x bitrate per camera. Storage = (Total bitrate in bytes/sec) x seconds per day x retention days, converted to TB = approximately ${formatted}.`,
      distractors: ({ cameras, bitrateMbps, days }, result, rng) => [
        num(result.value * 2, "TB", 2),
        num(result.value / 2, "TB", 2),
        num(near(result.value, 0.3, rng), "TB", 2),
      ],
    },
  },
  {
    name: "camera-count-from-area",
    weight: 5,
    spec: {
      discipline: D, topic: "CCTV Systems", subtopic: "Camera Coverage", tags: ["calculation"], difficulty: "Intermediate",
      gen: (rng) => ({ area: randInt(rng, 200, 8000), coveragePerCamera: pick(rng, [80, 100, 120, 150, 180]) }),
      compute: ({ area, coveragePerCamera }) => ({ formatted: `${Math.ceil(area / coveragePerCamera)} cameras`, value: Math.ceil(area / coveragePerCamera) }),
      question: ({ area, coveragePerCamera }) =>
        `A parking area of ${area} sq.m needs CCTV coverage, with each camera assumed to effectively cover ${coveragePerCamera} sq.m. What is the minimum number of cameras required?`,
      explanation: ({ area, coveragePerCamera }, formatted) =>
        `Minimum cameras = Area / Coverage per camera, rounded up = ${area} / ${coveragePerCamera} rounded up to ${formatted}.`,
      distractors: ({ area, coveragePerCamera }, result, rng) => [
        `${Math.max(1, Math.round(result.value / 2))} cameras`,
        `${Math.round(result.value * 1.6)} cameras`,
        `${Math.max(1, Math.round(near(result.value, 0.3, rng)))} cameras`,
      ],
    },
  },
  {
    name: "poe-budget-check",
    weight: 5,
    spec: {
      discipline: D, topic: "Structured Cabling & Networking", subtopic: "PoE Budget", tags: ["calculation"], difficulty: "Advanced",
      gen: (rng) => ({ ports: randInt(rng, 8, 48), wattPerDevice: randFloat(rng, 4, 15, 1), switchBudget: pick(rng, [130, 250, 370, 400, 740]) }),
      compute: ({ ports, wattPerDevice, switchBudget }) => {
        const required = ports * wattPerDevice;
        return { formatted: `${required.toFixed(1)} W (switch budget ${switchBudget} W)`, value: required, sufficient: required <= switchBudget };
      },
      question: ({ ports, wattPerDevice, switchBudget }) =>
        `A PoE switch with a total power budget of ${switchBudget} W needs to power ${ports} connected devices, each drawing approximately ${wattPerDevice} W. What is the total PoE power demand, and is the switch budget sufficient?`,
      explanation: ({ ports, wattPerDevice, switchBudget }, formatted) => {
        const required = ports * wattPerDevice;
        const verdict = required <= switchBudget ? "sufficient" : "NOT sufficient";
        return `Total demand = Ports x Watts per device = ${ports} x ${wattPerDevice} = ${required.toFixed(1)} W. Since the switch budget is ${switchBudget} W, the budget is ${verdict} for this demand.`;
      },
      distractors: ({ ports, wattPerDevice, switchBudget }, result, rng) => {
        const required = result.value;
        const oppositeVerdict = required <= switchBudget ? "NOT sufficient" : "sufficient";
        return [
          `${required.toFixed(1)} W (switch budget ${switchBudget} W) - ${oppositeVerdict}`,
          `${(required / 2).toFixed(1)} W (switch budget ${switchBudget} W)`,
          `${(near(required, 0.3, rng)).toFixed(1)} W (switch budget ${switchBudget} W)`,
        ];
      },
    },
  },
  {
    name: "pa-speaker-count",
    weight: 5,
    spec: {
      discipline: D, topic: "Public Address & Voice Evacuation", subtopic: "Speaker Coverage", tags: ["calculation"], difficulty: "Intermediate",
      gen: (rng) => ({ area: randInt(rng, 100, 4000), coveragePerSpeaker: pick(rng, [15, 20, 25, 30]) }),
      compute: ({ area, coveragePerSpeaker }) => ({ formatted: `${Math.ceil(area / coveragePerSpeaker)} speakers`, value: Math.ceil(area / coveragePerSpeaker) }),
      question: ({ area, coveragePerSpeaker }) =>
        `A hall of ${area} sq.m requires PA ceiling speaker coverage, with each speaker covering approximately ${coveragePerSpeaker} sq.m. What is the minimum number of speakers required?`,
      explanation: ({ area, coveragePerSpeaker }, formatted) =>
        `Minimum speakers = Area / Coverage per speaker, rounded up = ${area} / ${coveragePerSpeaker} rounded up to ${formatted}.`,
      distractors: ({ area, coveragePerSpeaker }, result, rng) => [
        `${Math.max(1, Math.round(result.value / 2))} speakers`,
        `${Math.round(result.value * 1.6)} speakers`,
        `${Math.max(1, Math.round(near(result.value, 0.3, rng)))} speakers`,
      ],
    },
  },
  {
    name: "pa-amplifier-sizing",
    weight: 5,
    spec: {
      discipline: D, topic: "Public Address & Voice Evacuation", subtopic: "Amplifier Sizing", tags: ["calculation"], difficulty: "Advanced",
      gen: (rng) => ({ speakers: randInt(rng, 10, 200), wattPerSpeaker: pick(rng, [3, 6, 10]), safetyFactor: randFloat(rng, 1.2, 1.5, 2) }),
      compute: ({ speakers, wattPerSpeaker, safetyFactor }) => {
        const total = speakers * wattPerSpeaker * safetyFactor;
        return { formatted: num(total, "W", 0), value: total };
      },
      question: ({ speakers, wattPerSpeaker, safetyFactor }) =>
        `A PA zone has ${speakers} speakers, each tapped at ${wattPerSpeaker} W. Applying a design safety factor of ${safetyFactor} to allow for future expansion and line losses, what is the minimum amplifier power rating required for this zone?`,
      explanation: ({ speakers, wattPerSpeaker, safetyFactor }, formatted) =>
        `Required amplifier power = Total speaker load x safety factor = (${speakers} x ${wattPerSpeaker}) x ${safetyFactor} = approximately ${formatted}.`,
      distractors: ({ speakers, wattPerSpeaker, safetyFactor }, result, rng) => [
        num(speakers * wattPerSpeaker, "W", 0),
        num(result.value * 1.6, "W", 0),
        num(near(result.value, 0.25, rng), "W", 0),
      ],
    },
  },
  {
    name: "emergency-light-battery-backup",
    weight: 4,
    spec: {
      discipline: D, topic: "Emergency Lighting", subtopic: "Battery Backup", tags: ["calculation"], difficulty: "Intermediate",
      gen: (rng) => ({ batteryWh: pick(rng, [4, 6, 8, 10, 12]), loadW: randFloat(rng, 2, 8, 1) }),
      compute: ({ batteryWh, loadW }) => ({ formatted: num(batteryWh / loadW, "hours", 2), value: batteryWh / loadW }),
      question: ({ batteryWh, loadW }) =>
        `A self-contained emergency luminaire has a battery rated at ${batteryWh} Wh, supplying a lamp load of ${loadW} W. What is the approximate emergency backup duration available?`,
      explanation: ({ batteryWh, loadW }, formatted) => `Backup time = Battery energy / Load power = ${batteryWh} / ${loadW} = approximately ${formatted}.`,
      distractors: ({ batteryWh, loadW }, result, rng) => [
        num(result.value * 2, "hours", 2),
        num(result.value / 2, "hours", 2),
        num(near(result.value, 0.3, rng), "hours", 2),
      ],
    },
  },
  {
    name: "network-bandwidth-total",
    weight: 5,
    spec: {
      discipline: D, topic: "Structured Cabling & Networking", subtopic: "Bandwidth Planning", tags: ["calculation"], difficulty: "Intermediate",
      gen: (rng) => ({ devices: randInt(rng, 10, 300), mbpsEach: randFloat(rng, 1, 6, 1) }),
      compute: ({ devices, mbpsEach }) => ({ formatted: num(devices * mbpsEach, "Mbps", 1), value: devices * mbpsEach }),
      question: ({ devices, mbpsEach }) =>
        `A building network segment connects ${devices} devices, each requiring an average sustained bandwidth of ${mbpsEach} Mbps. What is the approximate total bandwidth that the network backbone must support for this segment?`,
      explanation: ({ devices, mbpsEach }, formatted) => `Total bandwidth = Devices x Bandwidth per device = ${devices} x ${mbpsEach} = ${formatted}.`,
      distractors: ({ devices, mbpsEach }, result, rng) => [
        num(result.value / 2, "Mbps", 1),
        num(result.value * 1.6, "Mbps", 1),
        num(near(result.value, 0.25, rng), "Mbps", 1),
      ],
    },
  },
  {
    name: "smoke-detector-count",
    weight: 5,
    spec: {
      discipline: D, topic: "Fire Alarm Systems", subtopic: "Detector Coverage", tags: ["calculation"], difficulty: "Intermediate",
      gen: (rng) => ({ area: randInt(rng, 80, 3000), coveragePerDetector: pick(rng, [40, 60, 80, 90]) }),
      compute: ({ area, coveragePerDetector }) => ({ formatted: `${Math.ceil(area / coveragePerDetector)} detectors`, value: Math.ceil(area / coveragePerDetector) }),
      question: ({ area, coveragePerDetector }) =>
        `A floor area of ${area} sq.m requires smoke detector coverage, with each detector covering a maximum of ${coveragePerDetector} sq.m per its listed spacing. What is the minimum number of smoke detectors required?`,
      explanation: ({ area, coveragePerDetector }, formatted) =>
        `Minimum detectors = Area / Maximum coverage per detector, rounded up = ${area} / ${coveragePerDetector} rounded up to ${formatted}.`,
      distractors: ({ area, coveragePerDetector }, result, rng) => [
        `${Math.max(1, Math.round(result.value / 2))} detectors`,
        `${Math.round(result.value * 1.6)} detectors`,
        `${Math.max(1, Math.round(near(result.value, 0.3, rng)))} detectors`,
      ],
    },
  },
  {
    name: "fiber-loss-budget",
    weight: 4,
    spec: {
      discipline: D, topic: "Structured Cabling & Networking", subtopic: "Fiber Loss Budget", tags: ["calculation"], difficulty: "Advanced",
      gen: (rng) => ({
        lengthKm: randFloat(rng, 0.1, 8, 2),
        attenuationDbKm: pick(rng, [0.35, 0.4]),
        connectors: randInt(rng, 2, 8),
        lossPerConnector: 0.3,
      }),
      compute: ({ lengthKm, attenuationDbKm, connectors, lossPerConnector }) => {
        const totalLoss = lengthKm * attenuationDbKm + connectors * lossPerConnector;
        return { formatted: num(totalLoss, "dB", 2), value: totalLoss };
      },
      question: ({ lengthKm, attenuationDbKm, connectors }) =>
        `A single-mode fiber optic link runs ${lengthKm} km with a cable attenuation of ${attenuationDbKm} dB/km, and includes ${connectors} connector interfaces each contributing approximately 0.3 dB loss. What is the approximate total optical loss budget for this link?`,
      explanation: ({ lengthKm, attenuationDbKm, connectors, lossPerConnector }, formatted) =>
        `Total loss = (Length x Attenuation per km) + (Connectors x Loss per connector) = (${lengthKm} x ${attenuationDbKm}) + (${connectors} x ${lossPerConnector}) = approximately ${formatted}.`,
      distractors: ({ lengthKm, attenuationDbKm, connectors }, result, rng) => [
        num(lengthKm * attenuationDbKm, "dB", 2),
        num(result.value * 1.7, "dB", 2),
        num(near(result.value, 0.3, rng), "dB", 2),
      ],
    },
  },
  {
    name: "elv-boq-cost",
    weight: 4,
    spec: {
      discipline: D, topic: "ELV BOQ & Estimation", subtopic: "Rate Analysis", tags: ["calculation", "estimation"], difficulty: "Basic",
      gen: (rng) => ({ qty: randInt(rng, 10, 500), rate: randInt(rng, 800, 25000), unit: pick(rng, ["nos", "m", "point"]) }),
      compute: ({ qty, rate }) => ({ formatted: `Rs ${(qty * rate).toLocaleString("en-IN")}`, value: qty * rate }),
      question: ({ qty, rate, unit }) =>
        `An ELV BOQ item has a measured quantity of ${qty} ${unit} at a finalized rate of Rs ${rate} per ${unit}. What is the total cost for this BOQ item?`,
      explanation: ({ qty, rate }, formatted) => `Total cost = Quantity x Rate = ${qty} x ${rate} = ${formatted}.`,
      distractors: ({ qty, rate }, result, rng) => [
        `Rs ${Math.round(result.value / 2).toLocaleString("en-IN")}`,
        `Rs ${Math.round(result.value * 1.5).toLocaleString("en-IN")}`,
        `Rs ${Math.round(near(result.value, 0.25, rng)).toLocaleString("en-IN")}`,
      ],
    },
  },
  {
    name: "rack-units-required",
    weight: 3,
    spec: {
      discipline: D, topic: "Structured Cabling & Networking", subtopic: "Rack Space Planning", tags: ["calculation"], difficulty: "Basic",
      gen: (rng) => ({
        switches: randInt(rng, 1, 6), switchU: 1,
        patchPanels: randInt(rng, 1, 8), patchPanelU: 1,
        nvr: randInt(rng, 0, 2), nvrU: 2,
        ups: randInt(rng, 0, 1), upsU: 3,
      }),
      compute: ({ switches, switchU, patchPanels, patchPanelU, nvr, nvrU, ups, upsU }) => {
        const total = switches * switchU + patchPanels * patchPanelU + nvr * nvrU + ups * upsU;
        return { formatted: `${total} U`, value: total };
      },
      question: ({ switches, patchPanels, nvr, ups }) =>
        `An IT rack must accommodate ${switches} network switch(es) at 1U each, ${patchPanels} patch panel(s) at 1U each${nvr ? `, ${nvr} NVR(s) at 2U each` : ""}${ups ? `, and 1 rack-mount UPS at 3U` : ""}. What is the total rack space (in U) required for this equipment?`,
      explanation: ({ switches, patchPanels, nvr, ups }, formatted) =>
        `Total U = (Switches x 1U) + (Patch panels x 1U) + (NVRs x 2U) + (UPS x 3U) = ${formatted}.`,
      distractors: ({ switches, patchPanels, nvr, ups }, result, rng) => [
        `${Math.max(1, result.value - 2)} U`,
        `${result.value + 4} U`,
        `${Math.max(1, Math.round(near(result.value, 0.3, rng)))} U`,
      ],
    },
  },
];

export function generateELV() {
  const conceptual = roundRobinTrim(buildFromFactBank(FACTS, D), CONCEPTUAL_TARGET, (q) => q.topic);
  const calcTarget = TARGET - conceptual.length;
  const calc = buildCalcSet(CALC_TEMPLATES, calcTarget, "elv");
  return [...conceptual, ...calc].slice(0, TARGET);
}
