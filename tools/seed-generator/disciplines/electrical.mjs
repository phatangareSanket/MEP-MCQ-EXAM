import { randInt, randFloat, pick } from "../lib/rng.mjs";
import { buildFromFactBank, buildCalcSet, roundRobinTrim } from "../lib/engine.mjs";

const D = "Electrical";
const TARGET = 1200;
const CONCEPTUAL_TARGET = 250;

// ---------------------------------------------------------------------------
// Fact bank -> auto-generated conceptual (non-calculation) questions
// ---------------------------------------------------------------------------
const FACTS = [
  // Electrical Fundamentals
  { term: "Voltage", topic: "Electrical Fundamentals", difficulty: "Basic", tags: ["fundamentals"],
    definition: "The electrical potential difference that drives current flow between two points in a circuit, measured in volts (V).",
    function: "To provide the driving force (EMF) that pushes electric charge through a circuit.",
    fact: "Voltage is measured across (in parallel with) a component using a voltmeter." },
  { term: "Current", topic: "Electrical Fundamentals", difficulty: "Basic", tags: ["fundamentals"],
    definition: "The rate of flow of electric charge through a conductor, measured in amperes (A).",
    function: "To transfer electrical energy from source to load through a conductor.",
    fact: "Current is measured in series with a circuit using an ammeter." },
  { term: "Resistance", topic: "Electrical Fundamentals", difficulty: "Basic", tags: ["fundamentals"],
    definition: "Opposition offered by a material to the flow of electric current, measured in ohms.",
    function: "To limit current flow and dissipate electrical energy as heat.",
    fact: "Resistance of a conductor increases with length and decreases with cross-sectional area." },
  { term: "Active Power (kW)", topic: "Electrical Fundamentals", difficulty: "Basic", tags: ["fundamentals", "power"],
    definition: "The real power that performs useful work in an AC circuit, measured in kilowatts.",
    function: "To represent the power actually consumed by resistive and useful loads.",
    fact: "Active power in a single-phase circuit is calculated as P = V x I x cos(phi)." },
  { term: "Reactive Power (kVAR)", topic: "Electrical Fundamentals", difficulty: "Intermediate", tags: ["fundamentals", "power"],
    definition: "The power that oscillates between source and reactive loads without doing useful work, measured in kVAR.",
    function: "To sustain magnetic and electric fields in inductive and capacitive loads.",
    fact: "Reactive power is supplied by inductors (lagging) and capacitors (leading)." },
  { term: "Apparent Power (kVA)", topic: "Electrical Fundamentals", difficulty: "Intermediate", tags: ["fundamentals", "power"],
    definition: "The vector sum of active and reactive power, representing total power delivered to a circuit.",
    function: "To size electrical equipment such as transformers and generators based on total loading.",
    fact: "Apparent power (kVA) equals the square root of kW-squared plus kVAR-squared." },
  { term: "Power Factor", topic: "Electrical Fundamentals", difficulty: "Basic", tags: ["fundamentals", "power-factor"],
    definition: "The ratio of active power to apparent power in an AC circuit, indicating how effectively current is converted into useful work.",
    function: "To indicate the efficiency of power utilization in an electrical system.",
    fact: "A low power factor increases current draw for the same real power, raising system losses." },
  { term: "Supply Frequency", topic: "Electrical Fundamentals", difficulty: "Basic", tags: ["fundamentals"],
    definition: "The number of complete AC voltage cycles occurring per second, measured in hertz.",
    function: "To define the rate of alternation of voltage and current in an AC supply.",
    fact: "The standard supply frequency in India is 50 Hz." },
  { term: "Impedance", topic: "Electrical Fundamentals", difficulty: "Intermediate", tags: ["fundamentals"],
    definition: "The total opposition to current flow in an AC circuit, combining resistance and reactance.",
    function: "To determine current flow and voltage drop in AC circuits containing reactive elements.",
    fact: "Impedance is a complex quantity having both magnitude and phase angle." },

  // Three-Phase Systems & Transformers
  { term: "Three-Phase System", topic: "Three-Phase Systems & Transformers", difficulty: "Basic", tags: ["three-phase"],
    definition: "A polyphase electrical supply using three AC voltages of equal magnitude displaced by 120 degrees.",
    function: "To deliver power more efficiently and economically for industrial and commercial loads.",
    fact: "In a balanced star-connected three-phase system, line voltage is root-3 times the phase voltage." },
  { term: "Star (Wye) Connection", topic: "Three-Phase Systems & Transformers", difficulty: "Basic", tags: ["three-phase"],
    definition: "A three-phase connection where one end of each winding is joined at a common neutral point.",
    function: "To provide both line and phase voltage along with a neutral for single-phase loads.",
    fact: "In a star connection, line current equals phase current." },
  { term: "Delta Connection", topic: "Three-Phase Systems & Transformers", difficulty: "Basic", tags: ["three-phase"],
    definition: "A three-phase connection where windings are connected end-to-end forming a closed loop with no neutral.",
    function: "To supply balanced three-phase loads without requiring a neutral conductor.",
    fact: "In a delta connection, line current is root-3 times the phase current." },
  { term: "Power Transformer", topic: "Three-Phase Systems & Transformers", difficulty: "Basic", tags: ["transformer"],
    definition: "A static device that transfers electrical energy between circuits via electromagnetic induction, changing voltage levels.",
    function: "To step up or step down voltage for efficient transmission and distribution.",
    fact: "Transformers operate only on AC supply since they rely on a changing magnetic flux." },
  { term: "Transformer Vector Group", topic: "Three-Phase Systems & Transformers", difficulty: "Advanced", tags: ["transformer"],
    definition: "A notation describing the winding connections and phase displacement of a three-phase transformer, such as Dyn11.",
    function: "To ensure correct paralleling and phase matching between transformers.",
    fact: "Dyn11 denotes a delta-primary, star-secondary transformer with the secondary lagging by 330 degrees (30 degrees lead)." },
  { term: "On-Load Tap Changer", topic: "Three-Phase Systems & Transformers", difficulty: "Intermediate", tags: ["transformer"],
    definition: "A device that adjusts a transformer's turns ratio while energized, to regulate output voltage under varying load.",
    function: "To compensate for supply voltage variation and maintain a stable secondary voltage without shutdown.",
    fact: "Off-circuit tap changers, unlike on-load types, must be operated only when the transformer is de-energized." },
  { term: "Transformer Oil", topic: "Three-Phase Systems & Transformers", difficulty: "Intermediate", tags: ["transformer"],
    definition: "A mineral or synthetic dielectric fluid used in oil-filled transformers for insulation and cooling.",
    function: "To insulate windings and dissipate heat generated during transformer operation.",
    fact: "Transformer oil quality is periodically tested for dielectric strength, moisture content, and acidity." },
  { term: "ONAN/ONAF Cooling", topic: "Three-Phase Systems & Transformers", difficulty: "Intermediate", tags: ["transformer"],
    definition: "Cooling classifications describing the medium and circulation method used to dissipate transformer heat, e.g. Oil Natural Air Natural.",
    function: "To keep transformer winding and oil temperatures within safe design limits.",
    fact: "ONAF cooling adds forced-air fans over radiators to increase capacity beyond the base ONAN rating." },
  { term: "Neutral Grounding Resistor", topic: "Three-Phase Systems & Transformers", difficulty: "Advanced", tags: ["transformer", "earthing"],
    definition: "A resistor connected between a transformer or generator neutral and earth to limit fault current magnitude.",
    function: "To limit earth fault current to a safe, controlled value and reduce equipment damage.",
    fact: "Neutral grounding resistors are commonly used on generator and transformer neutrals in industrial power systems." },
  { term: "Parallel Operation of Transformers", topic: "Three-Phase Systems & Transformers", difficulty: "Advanced", tags: ["transformer"],
    definition: "Operating two or more transformers together to share load while connected to common busbars.",
    function: "To increase supply capacity and provide redundancy in power distribution.",
    fact: "Transformers operated in parallel must have matching vector group, voltage ratio, and percentage impedance." },

  // HT Systems & Switchgear
  { term: "HT (High Tension) System", topic: "HT Systems & Switchgear", difficulty: "Basic", tags: ["ht"],
    definition: "An electrical system operating above 1000 V AC, used for bulk power transmission and utility supply.",
    function: "To transmit large quantities of power efficiently over distribution networks with reduced losses.",
    fact: "Common HT voltage levels for industrial supply in India include 11 kV, 22 kV, and 33 kV." },
  { term: "Vacuum Circuit Breaker (VCB)", topic: "HT Systems & Switchgear", difficulty: "Intermediate", tags: ["ht", "switchgear"],
    definition: "A high voltage circuit breaker that interrupts current by creating and quenching an arc inside a vacuum interrupter.",
    function: "To safely make and break HT circuits under normal and fault conditions.",
    fact: "VCBs require minimal maintenance since the vacuum interrupter has no combustible arc-quenching medium." },
  { term: "SF6 Circuit Breaker", topic: "HT Systems & Switchgear", difficulty: "Intermediate", tags: ["ht", "switchgear"],
    definition: "A circuit breaker that uses sulfur hexafluoride gas as the arc-quenching and insulating medium.",
    function: "To interrupt high voltage fault currents with excellent dielectric and arc-quenching performance.",
    fact: "SF6 is a potent greenhouse gas, so leak-tight handling and disposal practices are required." },
  { term: "Ring Main Unit (RMU)", topic: "HT Systems & Switchgear", difficulty: "Intermediate", tags: ["ht", "switchgear"],
    definition: "A compact, metal-enclosed HT switchgear assembly used for ring or radial distribution with switching and protection functions.",
    function: "To control and protect incoming and outgoing HT ring feeders from a compact, centralized unit.",
    fact: "RMUs are widely used for HT ring distribution in commercial and high-rise buildings." },
  { term: "Isolator (Disconnector)", topic: "HT Systems & Switchgear", difficulty: "Basic", tags: ["ht", "switchgear"],
    definition: "An off-load switching device used to isolate a section of an HT circuit for safe maintenance.",
    function: "To provide visible, guaranteed isolation of a de-energized circuit before maintenance work.",
    fact: "Isolators must never be operated under load since they are designed only for off-load isolation." },
  { term: "Current Transformer (CT)", topic: "HT Systems & Switchgear", difficulty: "Intermediate", tags: ["ht", "metering"],
    definition: "An instrument transformer that steps down high current to a proportional, measurable low-current signal.",
    function: "To supply accurately scaled current signals to meters, relays, and protection devices.",
    fact: "A CT secondary must never be left open while the primary is energized, as it can generate dangerously high voltage." },
  { term: "Potential Transformer (PT/VT)", topic: "HT Systems & Switchgear", difficulty: "Intermediate", tags: ["ht", "metering"],
    definition: "An instrument transformer that steps down high voltage to a proportional, measurable low-voltage signal.",
    function: "To supply accurately scaled voltage signals to meters, relays, and synchronizing equipment.",
    fact: "PT secondary windings are typically rated at 110 V for standard metering and protection circuits." },
  { term: "Protection Relay", topic: "HT Systems & Switchgear", difficulty: "Intermediate", tags: ["protection"],
    definition: "A device that monitors electrical parameters and initiates circuit breaker tripping when abnormal or fault conditions are detected.",
    function: "To detect faults and isolate the affected part of the system quickly to limit damage.",
    fact: "Modern numerical relays can combine overcurrent, earth fault, and differential protection functions in a single unit." },
  { term: "Differential Protection", topic: "HT Systems & Switchgear", difficulty: "Advanced", tags: ["protection"],
    definition: "A protection scheme that compares current entering and leaving a protected zone, such as a transformer, to detect internal faults.",
    function: "To provide fast, sensitive protection against internal faults within a clearly defined zone.",
    fact: "Differential protection operates on the principle that current entering equals current leaving under healthy conditions." },

  // LT Switchgear & Protection
  { term: "Air Circuit Breaker (ACB)", topic: "LT Switchgear & Protection", difficulty: "Basic", tags: ["lt", "switchgear"],
    definition: "A low voltage circuit breaker that interrupts current in open air using contact separation and arc chutes.",
    function: "To protect and switch high-current LT circuits such as incomers and bus couplers in main panels.",
    fact: "ACBs are typically used for current ratings above 630 A, up to several thousand amperes." },
  { term: "Moulded Case Circuit Breaker (MCCB)", topic: "LT Switchgear & Protection", difficulty: "Basic", tags: ["lt", "switchgear"],
    definition: "A compact, enclosed low voltage circuit breaker providing overload and short-circuit protection for feeders.",
    function: "To protect distribution circuits and equipment from overload and short-circuit currents.",
    fact: "MCCBs are commonly available in current ratings from about 16 A up to 1600 A." },
  { term: "Miniature Circuit Breaker (MCB)", topic: "LT Switchgear & Protection", difficulty: "Basic", tags: ["lt", "switchgear"],
    definition: "A compact circuit breaker used in final distribution circuits to protect against overload and short circuits up to about 125 A.",
    function: "To protect final sub-circuits such as lighting and socket outlets from overcurrent.",
    fact: "MCB tripping curves (B, C, D) define the instantaneous trip multiple relative to rated current." },
  { term: "RCCB", topic: "LT Switchgear & Protection", difficulty: "Basic", tags: ["lt", "protection"],
    definition: "A residual current circuit breaker that disconnects a circuit when it detects an imbalance between live and neutral current, indicating earth leakage.",
    function: "To protect against electric shock from earth leakage and reduce fire risk from leakage currents.",
    fact: "A commonly used RCCB sensitivity for personnel protection against shock is 30 mA." },
  { term: "RCBO", topic: "LT Switchgear & Protection", difficulty: "Intermediate", tags: ["lt", "protection"],
    definition: "A combined device that provides both overcurrent protection, like an MCB, and earth leakage protection, like an RCCB, in one unit.",
    function: "To provide overload, short-circuit, and earth leakage protection in a single compact device.",
    fact: "RCBOs allow individual circuit protection without needing a separate upstream RCCB for the whole board." },
  { term: "Overcurrent Relay", topic: "LT Switchgear & Protection", difficulty: "Intermediate", tags: ["protection"],
    definition: "A protective relay that trips a breaker when current exceeds a preset threshold for a defined time.",
    function: "To protect equipment and cables from damage due to sustained overcurrent conditions.",
    fact: "Overcurrent relays may have definite-time or inverse definite minimum time (IDMT) characteristics." },
  { term: "Earth Fault Relay", topic: "LT Switchgear & Protection", difficulty: "Intermediate", tags: ["protection"],
    definition: "A protective relay that detects current flowing to earth due to insulation failure and initiates tripping.",
    function: "To detect earth faults and isolate the faulty circuit before it causes further damage or hazard.",
    fact: "Earth fault relays typically operate at a lower pickup current than phase overcurrent relays." },
  { term: "Distribution Board (DB)", topic: "LT Switchgear & Protection", difficulty: "Basic", tags: ["lt"],
    definition: "An enclosure housing MCBs and RCCBs that divides an electrical supply into separate final circuits at a load point.",
    function: "To distribute power safely to final circuits while providing individual circuit protection.",
    fact: "Distribution boards are typically labeled with a circuit schedule identifying each protected load." },
  { term: "Selectivity (Discrimination)", topic: "LT Switchgear & Protection", difficulty: "Advanced", tags: ["protection"],
    definition: "A protection coordination principle ensuring that only the breaker nearest to a fault trips, leaving upstream breakers closed.",
    function: "To limit the extent of a power outage to only the faulty circuit during a fault.",
    fact: "A proper selectivity (discrimination) study prevents unnecessary tripping of upstream breakers during downstream faults." },

  // Metering & Power Quality
  { term: "Energy Meter", topic: "Metering & Power Quality", difficulty: "Basic", tags: ["metering"],
    definition: "A device that measures and records electrical energy consumption in kWh over time.",
    function: "To measure billing-grade energy consumption for tariff and monitoring purposes.",
    fact: "Modern digital energy meters can log kW, kVA, power factor, and harmonics in addition to kWh." },
  { term: "APFC Panel", topic: "Metering & Power Quality", difficulty: "Intermediate", tags: ["power-factor"],
    definition: "An Automatic Power Factor Correction panel that switches capacitor banks in and out to maintain a target power factor.",
    function: "To automatically maintain power factor near unity and avoid utility low power-factor penalties.",
    fact: "APFC panels use a power factor controller relay that monitors load PF and switches capacitor steps via contactors." },
  { term: "Capacitor Bank", topic: "Metering & Power Quality", difficulty: "Basic", tags: ["power-factor"],
    definition: "A group of capacitors connected together to supply reactive power (kVAR) to a system.",
    function: "To offset lagging reactive power drawn by inductive loads such as motors and improve power factor.",
    fact: "Capacitor banks are often provided with detuned reactors when significant harmonic distortion is present." },
  { term: "Total Harmonic Distortion (THD)", topic: "Metering & Power Quality", difficulty: "Advanced", tags: ["power-quality"],
    definition: "A measure of the total harmonic content of a waveform relative to its fundamental component, expressed as a percentage.",
    function: "To quantify how much a voltage or current waveform deviates from a pure sine wave.",
    fact: "IEEE 519 is a commonly referenced standard for recommended voltage and current THD limits." },
  { term: "Active Harmonic Filter", topic: "Metering & Power Quality", difficulty: "Advanced", tags: ["power-quality"],
    definition: "An electronic device that injects compensating currents in real time to cancel harmonic distortion at its point of connection.",
    function: "To reduce harmonic distortion and improve power quality in installations with heavy non-linear loading.",
    fact: "Active harmonic filters can adapt to changing load conditions, unlike fixed passive filters." },
  { term: "Detuned Reactor", topic: "Metering & Power Quality", difficulty: "Advanced", tags: ["power-quality"],
    definition: "An inductor connected in series with a capacitor bank to shift the resonant frequency away from dominant harmonics.",
    function: "To prevent harmonic resonance and protect capacitor banks from harmonic overload.",
    fact: "Detuned reactors are typically specified by a factor such as 7% or 14%, referenced to the fundamental frequency." },
  { term: "Voltage Unbalance", topic: "Metering & Power Quality", difficulty: "Intermediate", tags: ["power-quality"],
    definition: "A condition where the three phase voltages of a supply differ in magnitude or are not exactly 120 degrees apart.",
    function: "To highlight a power quality issue that can cause excessive heating and reduced life in three-phase motors.",
    fact: "Even a small percentage of voltage unbalance can cause a much larger percentage of current unbalance in motors." },
  { term: "Maximum Demand", topic: "Metering & Power Quality", difficulty: "Intermediate", tags: ["metering"],
    definition: "The highest average power demand recorded over a defined interval (typically 15 or 30 minutes) during a billing period.",
    function: "To form the basis for utility demand-based tariff charges separate from energy (kWh) charges.",
    fact: "Exceeding a contracted maximum demand often results in penalty charges from the utility." },

  // DG Sets & Standby Power
  { term: "Diesel Generator (DG) Set", topic: "DG Sets & Standby Power", difficulty: "Basic", tags: ["dg"],
    definition: "A standby power generation unit combining a diesel engine and an alternator to supply power during utility outages.",
    function: "To provide backup electrical power to critical loads when the normal utility supply fails.",
    fact: "DG sets are commonly rated in kVA and specified along with a standard power factor, typically 0.8." },
  { term: "AMF Panel", topic: "DG Sets & Standby Power", difficulty: "Intermediate", tags: ["dg"],
    definition: "An Automatic Mains Failure panel that senses utility power loss and automatically starts and connects the DG set.",
    function: "To automatically transfer load to the DG set on mains failure and restore mains supply once available, without manual intervention.",
    fact: "AMF panels typically include a time delay before starting the DG to avoid nuisance starts on momentary dips." },
  { term: "Automatic Transfer Switch (ATS)", topic: "DG Sets & Standby Power", difficulty: "Intermediate", tags: ["dg"],
    definition: "A switching device that automatically transfers a load between two power sources, typically utility and DG or UPS.",
    function: "To ensure uninterrupted supply to critical loads by switching sources automatically on failure of the primary source.",
    fact: "ATS units are typically interlocked to prevent the two sources from ever being connected together simultaneously." },
  { term: "Synchronizing Panel", topic: "DG Sets & Standby Power", difficulty: "Advanced", tags: ["dg"],
    definition: "A panel containing controls and relays used to match voltage, frequency, and phase before connecting two generators or a generator to the grid.",
    function: "To allow safe paralleling of multiple generators, or a generator with the utility grid, without damaging equipment.",
    fact: "Synchronizing before paralleling checks voltage magnitude, frequency, and phase sequence match closely." },
  { term: "Alternator", topic: "DG Sets & Standby Power", difficulty: "Basic", tags: ["dg"],
    definition: "The rotating electrical machine within a generator set that converts mechanical energy from the engine into AC electrical power.",
    function: "To generate three-phase AC power from the mechanical rotation supplied by the diesel engine.",
    fact: "Alternator output voltage and frequency are regulated by an automatic voltage regulator (AVR) and governor respectively." },
  { term: "Acoustic Enclosure", topic: "DG Sets & Standby Power", difficulty: "Basic", tags: ["dg"],
    definition: "A soundproofed housing around a DG set that reduces noise emission to comply with pollution control norms.",
    function: "To reduce generator noise levels for occupant comfort and statutory compliance.",
    fact: "Acoustic enclosures are typically rated for a maximum noise level in dB(A) measured at a specified distance." },
  { term: "Load Sharing (Generators)", topic: "DG Sets & Standby Power", difficulty: "Advanced", tags: ["dg"],
    definition: "The proportional distribution of load between two or more generators operating in parallel.",
    function: "To ensure generators running in parallel share active and reactive load proportionally to their ratings.",
    fact: "Poor load sharing between paralleled generators can lead to one unit overloading while another is underutilized." },
  { term: "DG Set Sizing", topic: "DG Sets & Standby Power", difficulty: "Advanced", tags: ["dg", "estimation"],
    definition: "The process of selecting generator kVA capacity based on connected load, motor starting kVA, and desired power factor.",
    function: "To ensure the DG set can reliably start and run the intended critical loads, including motor inrush.",
    fact: "DG sizing often considers the starting kVA of the largest motor, not just the steady-state running load." },

  // UPS & Batteries
  { term: "Online UPS", topic: "UPS & Batteries", difficulty: "Intermediate", tags: ["ups"],
    definition: "A UPS topology where the load is continuously supplied through the inverter, with the charger and inverter always active.",
    function: "To provide the highest power quality and zero transfer time protection against supply disturbances.",
    fact: "Online (double-conversion) UPS systems isolate the load completely from raw utility disturbances." },
  { term: "Line-Interactive UPS", topic: "UPS & Batteries", difficulty: "Intermediate", tags: ["ups"],
    definition: "A UPS topology that normally passes utility power through a voltage regulator, switching to battery and inverter only when needed.",
    function: "To provide voltage regulation with reasonable efficiency, transferring to battery power during larger disturbances.",
    fact: "Line-interactive UPS units are generally more efficient than online UPS but have a brief transfer time on switchover." },
  { term: "VRLA Battery", topic: "UPS & Batteries", difficulty: "Basic", tags: ["battery"],
    definition: "Valve Regulated Lead Acid battery, a sealed, low-maintenance battery type commonly used for UPS backup.",
    function: "To store DC energy and supply it to the UPS inverter during a mains failure.",
    fact: "VRLA batteries use a pressure relief valve and require no periodic electrolyte topping up." },
  { term: "Static Bypass Switch", topic: "UPS & Batteries", difficulty: "Intermediate", tags: ["ups"],
    definition: "An electronic switch in a UPS that transfers the load directly to raw utility supply if the inverter fails or is overloaded.",
    function: "To maintain continuity of supply to the load even if the UPS inverter malfunctions.",
    fact: "Static bypass switching is typically fast enough to be transparent to most connected IT loads." },
  { term: "Battery Charger (Float/Boost)", topic: "UPS & Batteries", difficulty: "Basic", tags: ["battery"],
    definition: "A rectifier-based device that charges batteries and maintains them at a float voltage during normal operation.",
    function: "To keep standby batteries fully charged and ready for immediate use during a power failure.",
    fact: "Boost charging applies a higher voltage than float charging to recharge batteries more quickly after a discharge." },
  { term: "DC UPS / Substation Battery Bank", topic: "UPS & Batteries", difficulty: "Advanced", tags: ["battery", "ht"],
    definition: "A battery-based DC supply system used to power protection relays, breaker trip coils, and control circuits in substations.",
    function: "To ensure protection and control systems remain operational even during a complete AC supply failure.",
    fact: "Substation DC battery banks are commonly rated at 110 V DC or 24 V DC depending on the control philosophy." },
  { term: "Battery Backup Time", topic: "UPS & Batteries", difficulty: "Intermediate", tags: ["battery"],
    definition: "The duration a UPS or DC system can supply a given load before its batteries are depleted, based on Ah capacity and load current.",
    function: "To indicate how long critical loads can be sustained during an extended mains failure.",
    fact: "Battery backup time reduces as connected load increases, for a fixed battery Ah capacity." },

  // Electrical Panels & Distribution
  { term: "PCC (Power Control Centre)", topic: "Electrical Panels & Distribution", difficulty: "Basic", tags: ["panels"],
    definition: "A main LT panel that receives incoming power from transformers or DG sets and distributes it to downstream panels.",
    function: "To serve as the primary point of control and distribution for incoming LT power in a facility.",
    fact: "A PCC typically houses the main incomer breakers along with bus couplers and major outgoing feeders." },
  { term: "MCC (Motor Control Centre)", topic: "Electrical Panels & Distribution", difficulty: "Basic", tags: ["panels", "motors"],
    definition: "An assembly of motor starters, breakers, and control devices grouped together to control multiple motors from one panel.",
    function: "To centralize control, protection, and monitoring of multiple motor loads such as pumps and fans.",
    fact: "MCCs are commonly used in HVAC plant rooms and pump houses to control multiple motor feeders." },
  { term: "MDB (Main Distribution Board)", topic: "Electrical Panels & Distribution", difficulty: "Basic", tags: ["panels"],
    definition: "A distribution panel that receives power from the PCC and feeds sub-distribution boards or large loads within a building.",
    function: "To distribute bulk power to floor-wise or zone-wise sub-distribution boards.",
    fact: "An MDB typically sits between the PCC and the smaller SMDBs/DBs in a distribution hierarchy." },
  { term: "SMDB (Sub Main Distribution Board)", topic: "Electrical Panels & Distribution", difficulty: "Basic", tags: ["panels"],
    definition: "A secondary distribution panel fed from an MDB that further distributes power to local DBs or equipment.",
    function: "To provide localized distribution and protection closer to the point of use.",
    fact: "SMDBs help reduce cable lengths and voltage drop by distributing power closer to individual floors or zones." },
  { term: "Bus Coupler", topic: "Electrical Panels & Distribution", difficulty: "Intermediate", tags: ["panels"],
    definition: "A circuit breaker connecting two bus sections of a panel, allowing them to be operated independently or interconnected.",
    function: "To provide flexibility and redundancy by enabling load transfer between two bus sections.",
    fact: "Bus couplers are commonly used between two transformer-fed sections of a main LT panel for redundancy." },
  { term: "Form of Segregation (Panel)", topic: "Electrical Panels & Distribution", difficulty: "Advanced", tags: ["panels"],
    definition: "A construction standard (Form 1 to Form 4) defining the degree of internal separation between busbars, functional units, and terminals in a panel.",
    function: "To limit the spread of an internal fault and improve operator safety during panel operation.",
    fact: "Higher form numbers (such as Form 4) provide greater internal segregation than lower forms like Form 1." },
  { term: "IP Rating (Enclosure)", topic: "Electrical Panels & Distribution", difficulty: "Basic", tags: ["panels"],
    definition: "A classification such as IP54 or IP65 indicating the degree of protection an enclosure provides against dust and water ingress.",
    function: "To specify enclosure suitability for a given installation environment such as indoor, outdoor, or washdown areas.",
    fact: "In an IP rating, the first digit relates to protection against solid objects/dust and the second to water ingress." },

  // Motors & Starters
  { term: "Induction Motor", topic: "Motors & Starters", difficulty: "Basic", tags: ["motors"],
    definition: "An AC motor in which rotor current is induced by the rotating magnetic field of the stator, requiring no external rotor excitation.",
    function: "To convert electrical energy into mechanical rotational energy for driving pumps, fans, and compressors.",
    fact: "Squirrel-cage induction motors are the most widely used motor type in MEP applications due to their simplicity and reliability." },
  { term: "DOL Starter", topic: "Motors & Starters", difficulty: "Basic", tags: ["motors", "starters"],
    definition: "A Direct-On-Line starter that connects a motor directly to full supply voltage at starting.",
    function: "To start small motors simply and economically where high starting current is acceptable.",
    fact: "DOL starting typically draws 6 to 8 times the motor's rated full load current at the instant of starting." },
  { term: "Star-Delta Starter", topic: "Motors & Starters", difficulty: "Intermediate", tags: ["motors", "starters"],
    definition: "A starter that initially connects motor windings in star (reduced voltage) then switches to delta (full voltage) after acceleration.",
    function: "To reduce starting current and mechanical stress for medium-sized induction motors.",
    fact: "Star-delta starting reduces the line starting current to roughly one-third of the direct-on-line value." },
  { term: "Soft Starter", topic: "Motors & Starters", difficulty: "Intermediate", tags: ["motors", "starters"],
    definition: "A solid-state device that gradually ramps up voltage to a motor during starting to limit inrush current and mechanical shock.",
    function: "To provide smooth, controlled acceleration and deceleration of motors, reducing stress on mechanical systems.",
    fact: "Soft starters use thyristors to control the applied voltage waveform during the starting ramp." },
  { term: "Variable Frequency Drive (VFD)", topic: "Motors & Starters", difficulty: "Intermediate", tags: ["motors", "vfd"],
    definition: "An electronic controller that varies motor speed by adjusting the frequency and voltage supplied to the motor.",
    function: "To enable variable-speed operation of motors for energy savings and process control.",
    fact: "VFDs can provide significant energy savings on centrifugal pump and fan loads because power varies with speed cubed." },
  { term: "Thermal Overload Relay", topic: "Motors & Starters", difficulty: "Intermediate", tags: ["motors", "protection"],
    definition: "A protective device that trips a motor starter when motor current exceeds a set value for a sustained period, mimicking motor heating.",
    function: "To protect motor windings from damage due to sustained overload conditions.",
    fact: "Thermal overload relays are typically set close to the motor's nameplate full load current." },
  { term: "Motor Insulation Class", topic: "Motors & Starters", difficulty: "Advanced", tags: ["motors"],
    definition: "A rating such as Class B, F, or H indicating the maximum temperature a motor's winding insulation can withstand continuously.",
    function: "To ensure motor insulation is matched to the expected operating temperature rise for reliable service life.",
    fact: "Class F insulation permits a higher maximum operating temperature than Class B insulation." },

  // Cables & Conductors
  { term: "XLPE Cable", topic: "Cables & Conductors", difficulty: "Basic", tags: ["cables"],
    definition: "A power cable insulated with cross-linked polyethylene, offering high thermal and electrical performance.",
    function: "To provide reliable insulation for LT and HT power cables with a higher conductor operating temperature than PVC.",
    fact: "XLPE-insulated cables typically have a higher continuous conductor temperature rating than PVC-insulated cables." },
  { term: "PVC Insulated Cable", topic: "Cables & Conductors", difficulty: "Basic", tags: ["cables"],
    definition: "A cable insulated with polyvinyl chloride, commonly used for LT wiring and control cabling.",
    function: "To provide cost-effective insulation for general-purpose LT wiring applications.",
    fact: "PVC cables are generally limited to a lower continuous conductor operating temperature than XLPE cables." },
  { term: "Armoured Cable", topic: "Cables & Conductors", difficulty: "Basic", tags: ["cables"],
    definition: "A cable incorporating a metallic armour layer, such as steel wire or strip, over the inner sheath for mechanical protection.",
    function: "To protect cables from mechanical damage in direct-buried or exposed installations.",
    fact: "Armoured cables are typically preferred for underground or exposed routes where mechanical damage risk is higher." },
  { term: "Voltage Drop (Cable)", topic: "Cables & Conductors", difficulty: "Intermediate", tags: ["cables"],
    definition: "The reduction in voltage between the supply end and load end of a cable, due to its resistance and reactance.",
    function: "To highlight a key cable sizing criterion ensuring adequate voltage is available at the load.",
    fact: "Cable voltage drop is commonly limited to about 3 to 5 percent of nominal voltage in typical LT wiring practice." },
  { term: "Cable Derating Factor", topic: "Cables & Conductors", difficulty: "Advanced", tags: ["cables"],
    definition: "A multiplying factor applied to a cable's base current rating to account for grouping, ambient temperature, and installation method.",
    function: "To ensure a cable's actual current-carrying capacity is safely adjusted for real installation conditions.",
    fact: "Multiple derating factors, such as grouping and ambient temperature, are typically multiplied together, not added." },
  { term: "Short Circuit Withstand Capacity", topic: "Cables & Conductors", difficulty: "Advanced", tags: ["cables", "protection"],
    definition: "The maximum fault current a cable can carry for a specified duration without insulation damage, based on conductor size and material.",
    function: "To verify that a selected cable can survive downstream fault currents until protective devices operate.",
    fact: "A cable's short-circuit withstand capacity increases with larger conductor cross-sectional area." },
  { term: "Single Core vs Multicore Cable", topic: "Cables & Conductors", difficulty: "Intermediate", tags: ["cables"],
    definition: "Single-core cables have one conductor per cable, while multicore cables combine multiple insulated conductors within one common sheath.",
    function: "To describe two common cable construction types used for different feeder and circuit applications.",
    fact: "Single-core cables are often preferred for large HT or LT feeders due to easier handling and heat dissipation." },

  // Cable Containment Systems
  { term: "Cable Tray", topic: "Cable Containment Systems", difficulty: "Basic", tags: ["containment"],
    definition: "An open support structure, such as perforated, ladder, or channel type, used to route and support multiple cables.",
    function: "To provide organized mechanical support and ventilation for power and control cables.",
    fact: "Perforated cable trays allow better heat dissipation than solid-bottom trays for grouped cables." },
  { term: "Cable Ladder", topic: "Cable Containment Systems", difficulty: "Basic", tags: ["containment"],
    definition: "A cable support system consisting of two side rails connected by rungs, used for supporting heavy cable runs over longer spans.",
    function: "To support larger cable bundles, especially HT and heavy LT feeders, while allowing good ventilation.",
    fact: "Cable ladders generally allow longer support spans than lightweight perforated cable trays." },
  { term: "Conduit", topic: "Cable Containment Systems", difficulty: "Basic", tags: ["containment"],
    definition: "A tube, either metallic or non-metallic, used to enclose and protect individual cables or wires.",
    function: "To provide mechanical protection and a defined path for wiring, especially in concealed installations.",
    fact: "Conduit fill percentage is limited by wiring codes to allow safe cable pulling and heat dissipation." },
  { term: "Bus Duct (Busway)", topic: "Cable Containment Systems", difficulty: "Intermediate", tags: ["containment", "busbar"],
    definition: "A prefabricated enclosed assembly of busbars used to carry large currents between switchgear, transformers, and panels.",
    function: "To provide a compact, high-current power distribution path as an alternative to multiple parallel cables.",
    fact: "Bus ducts are often preferred over multiple parallel cables for very high current, short-distance connections such as transformer-to-panel links." },
  { term: "Busbar", topic: "Cable Containment Systems", difficulty: "Basic", tags: ["busbar"],
    definition: "A rigid metallic conductor, typically copper or aluminium, used within panels or bus ducts to carry and distribute current.",
    function: "To provide low-impedance current distribution within switchgear and bus duct systems.",
    fact: "Copper busbars have higher current-carrying capacity than aluminium busbars of the same cross-section." },
  { term: "Cable Trench", topic: "Cable Containment Systems", difficulty: "Basic", tags: ["containment"],
    definition: "An underground or floor-level channel, often covered, used to route cables between buildings or equipment areas.",
    function: "To provide a protected, accessible route for cables without requiring deep direct burial.",
    fact: "Cable trenches are often provided with removable covers to allow future access for cable addition or maintenance." },

  // Earthing & Lightning Protection
  { term: "Earthing (Grounding)", topic: "Earthing & Lightning Protection", difficulty: "Basic", tags: ["earthing"],
    definition: "The process of connecting electrical equipment and systems to the general mass of earth to provide a safe fault current path.",
    function: "To protect personnel from electric shock and provide a stable reference potential for the electrical system.",
    fact: "A well-designed earthing system provides a low-impedance path that allows protective devices to operate quickly during a fault." },
  { term: "Earth Electrode", topic: "Earthing & Lightning Protection", difficulty: "Basic", tags: ["earthing"],
    definition: "A conductor, such as a plate, pipe, or rod, buried in the ground to establish an electrical connection with the earth.",
    function: "To provide a low-resistance path to earth for fault and lightning currents.",
    fact: "Earth electrode resistance depends significantly on soil resistivity, which varies with moisture and soil type." },
  { term: "Earth Pit", topic: "Earthing & Lightning Protection", difficulty: "Basic", tags: ["earthing"],
    definition: "A constructed chamber housing an earth electrode, typically filled with charcoal, salt, or maintenance-free compound, allowing testing access.",
    function: "To allow periodic testing and maintenance of an earth electrode's resistance to ground.",
    fact: "Earth pits are usually provided with a removable cover to allow periodic earth resistance testing." },
  { term: "Equipotential Bonding", topic: "Earthing & Lightning Protection", difficulty: "Intermediate", tags: ["earthing"],
    definition: "Connecting together the conductive parts of an installation to minimize voltage differences between them during a fault.",
    function: "To reduce the risk of electric shock due to potential differences between exposed metal parts.",
    fact: "Equipotential bonding typically connects metallic pipework, structural steel, and electrical earthing together." },
  { term: "Lightning Air Termination System", topic: "Earthing & Lightning Protection", difficulty: "Intermediate", tags: ["lightning"],
    definition: "A system of rods or mesh conductors mounted at the highest points of a structure to intercept lightning strikes.",
    function: "To protect a structure and its occupants from direct lightning strikes.",
    fact: "Air termination systems are typically designed using methods such as the rolling sphere method to determine coverage." },
  { term: "Down Conductor", topic: "Earthing & Lightning Protection", difficulty: "Intermediate", tags: ["lightning"],
    definition: "A conductor that carries lightning current from the air termination system down to the earth termination system.",
    function: "To provide a low-impedance path for lightning current to reach the earthing system safely.",
    fact: "Multiple down conductors are typically provided around a structure to share lightning current and reduce side-flash risk." },
  { term: "Surge Protection Device (SPD)", topic: "Earthing & Lightning Protection", difficulty: "Intermediate", tags: ["lightning"],
    definition: "A device installed in electrical distribution systems to limit transient overvoltages and protect connected equipment.",
    function: "To protect sensitive electronic equipment from voltage surges caused by lightning or switching transients.",
    fact: "SPDs are often installed in a cascaded arrangement (Type 1, Type 2, Type 3) at different points in a distribution system." },
  { term: "Earth Resistance Testing", topic: "Earthing & Lightning Protection", difficulty: "Advanced", tags: ["earthing", "testing"],
    definition: "A test, typically using the fall-of-potential method, to measure the resistance of an earth electrode system to the general mass of earth.",
    function: "To verify that an earthing system meets the required resistance value for effective fault current dissipation.",
    fact: "Earth resistance testing is usually performed periodically since soil conditions and electrode condition can change over time." },

  // Electrical Safety, Testing & Commissioning
  { term: "Lockout-Tagout (LOTO)", topic: "Electrical Safety, Testing & Commissioning", difficulty: "Basic", tags: ["safety"],
    definition: "A safety procedure ensuring equipment is properly shut off and isolated, with locks and tags applied, before maintenance work.",
    function: "To prevent accidental re-energization of equipment while personnel are working on it.",
    fact: "LOTO procedures require each authorized worker to apply their own personal lock before starting work." },
  { term: "Insulation Resistance (IR) Test", topic: "Electrical Safety, Testing & Commissioning", difficulty: "Intermediate", tags: ["testing"],
    definition: "A test using a megger to measure the resistance of cable or equipment insulation, verifying it is free from damage or moisture.",
    function: "To confirm insulation integrity before energizing a cable or piece of equipment.",
    fact: "A low insulation resistance reading generally indicates possible moisture ingress or insulation damage." },
  { term: "High Voltage (Hi-Pot) Test", topic: "Electrical Safety, Testing & Commissioning", difficulty: "Advanced", tags: ["testing"],
    definition: "A test that applies a voltage higher than rated voltage to verify insulation can withstand overvoltage without breakdown.",
    function: "To confirm the dielectric strength of cable and equipment insulation.",
    fact: "Hi-pot tests are typically performed after installation and periodically thereafter to detect insulation degradation." },
  { term: "Polarity Test", topic: "Electrical Safety, Testing & Commissioning", difficulty: "Intermediate", tags: ["testing"],
    definition: "A test to verify that switches and protective devices are connected in the phase or line conductor, not the neutral.",
    function: "To ensure correct wiring so that isolating a circuit fully de-energizes it.",
    fact: "Incorrect polarity can leave a circuit's neutral switched while the live conductor remains energized." },
  { term: "PPE for Electrical Work", topic: "Electrical Safety, Testing & Commissioning", difficulty: "Basic", tags: ["safety"],
    definition: "Safety gear such as insulated gloves, arc-flash suits, and safety footwear used when working on or near live electrical equipment.",
    function: "To protect personnel from electric shock, arc flash, and related hazards.",
    fact: "PPE selection for electrical work is typically based on an arc-flash risk assessment of the specific equipment." },
  { term: "Electrical Commissioning", topic: "Electrical Safety, Testing & Commissioning", difficulty: "Intermediate", tags: ["commissioning"],
    definition: "The process of testing, adjusting, and verifying that electrical systems and equipment operate correctly per design before handover.",
    function: "To confirm that installed electrical systems function safely and as intended prior to occupancy.",
    fact: "Electrical commissioning typically includes pre-commissioning checks, functional testing, and integrated system testing." },
  { term: "Permit to Work (PTW)", topic: "Electrical Safety, Testing & Commissioning", difficulty: "Basic", tags: ["safety"],
    definition: "A formal, documented system authorizing specific work on electrical equipment after specified safety precautions are confirmed.",
    function: "To ensure hazards are identified and controlled before work begins on electrical systems.",
    fact: "A permit to work is typically issued, accepted, and formally closed out once the associated work is complete." },
  { term: "Relay Secondary Injection Testing", topic: "Electrical Safety, Testing & Commissioning", difficulty: "Advanced", tags: ["testing", "protection"],
    definition: "A test method that injects controlled currents or voltages into a protection relay's secondary circuits to verify its settings and operation.",
    function: "To confirm that protection relays trip correctly at their configured pickup values and time settings.",
    fact: "Secondary injection testing verifies relay operation without needing to apply actual fault current to the primary system." },

  // Electrical BOQ & Estimation
  { term: "Electrical Works Bill of Quantities", topic: "Electrical BOQ & Estimation", difficulty: "Basic", tags: ["estimation"],
    definition: "A document listing materials, quantities, and often rates for a construction or electrical works package.",
    function: "To provide a standardized basis for pricing, comparison, and payment of electrical works.",
    fact: "A well-prepared BOQ should be read together with technical specifications, as quantities alone do not define quality." },
  { term: "Quantity Take-off", topic: "Electrical BOQ & Estimation", difficulty: "Basic", tags: ["estimation"],
    definition: "The process of measuring quantities of materials such as cables, panels, and fittings from drawings for estimation purposes.",
    function: "To determine the material quantities required to prepare an accurate cost estimate.",
    fact: "Quantity take-off is typically performed from approved-for-construction drawings to minimize estimation errors." },
  { term: "Electrical Item Rate Analysis", topic: "Electrical BOQ & Estimation", difficulty: "Intermediate", tags: ["estimation"],
    definition: "A detailed cost breakdown of an item covering material, labour, and overheads to establish its unit rate.",
    function: "To justify and validate the unit rate quoted for a BOQ item.",
    fact: "A typical rate analysis separates material cost, labour cost, and a percentage for overheads and profit." },
  { term: "Supply, Installation, Testing & Commissioning (SITC)", topic: "Electrical BOQ & Estimation", difficulty: "Basic", tags: ["estimation"],
    definition: "A contract scope term meaning the vendor is responsible for supplying, installing, and commissioning the specified item.",
    function: "To clearly define the vendor's scope boundaries in electrical works contracts.",
    fact: "SITC rates typically include material supply, labour for installation, and testing/commissioning activities together." },
  { term: "Provisional Sum (Electrical Contracts)", topic: "Electrical BOQ & Estimation", difficulty: "Intermediate", tags: ["estimation"],
    definition: "An estimated amount included in a BOQ for work that cannot be accurately detailed or priced at the time of tendering.",
    function: "To allow for items of uncertain scope while keeping the overall contract value structured.",
    fact: "Provisional sums are typically adjusted to actual value once the scope is finalized during execution." },
  { term: "Make/Model Approval", topic: "Electrical BOQ & Estimation", difficulty: "Basic", tags: ["estimation"],
    definition: "A process where a contractor submits proposed equipment makes for consultant or client approval against specified or approved-list brands.",
    function: "To ensure installed equipment matches the quality and specification intent of the design.",
    fact: "Make/model approval is usually required before procurement to avoid rejection of already-purchased material." },
  { term: "Technical Bid Evaluation", topic: "Electrical BOQ & Estimation", difficulty: "Intermediate", tags: ["estimation"],
    definition: "A comparison of bidders' technical submissions against specifications to confirm compliance before commercial evaluation.",
    function: "To ensure only technically compliant bids are considered for commercial comparison.",
    fact: "Technical bid evaluation is normally completed and finalized before commercial bids are opened, in a two-envelope tender system." },
  { term: "Deviation List", topic: "Electrical BOQ & Estimation", difficulty: "Intermediate", tags: ["estimation"],
    definition: "A document highlighting differences between a bidder's offer and the tender specification or BOQ.",
    function: "To transparently flag exclusions, substitutions, or technical deviations for client review before award.",
    fact: "A clear deviation list helps avoid disputes later by documenting agreed departures from the original specification." },
];

// ---------------------------------------------------------------------------
// Calculation templates
// ---------------------------------------------------------------------------
const SQ3 = Math.sqrt(3);
const rupee = (n) => `Rs ${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const num = (n, unit, decimals = 2) => `${Number(n.toFixed(decimals)).toLocaleString("en-IN")} ${unit}`;
const near = (v, pct, rng) => {
  const factor = 1 + (rng() * 2 - 1) * pct;
  return v * factor;
};

const CABLE_MV_TABLE = [
  { size: "4 sq.mm", mv: 11.0, capacity: 32 },
  { size: "6 sq.mm", mv: 7.3, capacity: 41 },
  { size: "10 sq.mm", mv: 4.4, capacity: 57 },
  { size: "16 sq.mm", mv: 2.8, capacity: 76 },
  { size: "25 sq.mm", mv: 1.75, capacity: 101 },
  { size: "35 sq.mm", mv: 1.25, capacity: 125 },
  { size: "50 sq.mm", mv: 0.93, capacity: 151 },
  { size: "70 sq.mm", mv: 0.63, capacity: 192 },
  { size: "95 sq.mm", mv: 0.47, capacity: 232 },
  { size: "120 sq.mm", mv: 0.38, capacity: 269 },
  { size: "150 sq.mm", mv: 0.31, capacity: 300 },
  { size: "185 sq.mm", mv: 0.25, capacity: 341 },
  { size: "240 sq.mm", mv: 0.2, capacity: 400 },
];

const TRANSFORMER_KVA = [25, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 750, 800, 1000, 1250, 1600, 2000, 2500];

const CALC_TEMPLATES = [
  {
    name: "three-phase-power",
    weight: 8,
    spec: {
      discipline: D, topic: "Electrical Fundamentals", subtopic: "Three-Phase Power",
      tags: ["calculation", "power"], difficulty: "Intermediate",
      gen: (rng) => ({
        v: pick(rng, [400, 415, 433]),
        i: randInt(rng, 15, 480),
        pf: randFloat(rng, 0.75, 0.98, 2),
      }),
      compute: ({ v, i, pf }) => {
        const p = (SQ3 * v * i * pf) / 1000;
        return { formatted: num(p, "kW", 1), value: p };
      },
      question: ({ v, i, pf }) =>
        `A balanced three-phase load draws ${i} A at ${v} V (line-to-line) with a power factor of ${pf}. What is the approximate active power drawn?`,
      explanation: ({ v, i, pf }, formatted) =>
        `Active power for a three-phase load is P = root3 x V(line) x I x cos(phi) = 1.732 x ${v} x ${i} x ${pf} / 1000 = ${formatted}.`,
      distractors: ({ v, i, pf }, result, rng) => {
        const wrong1 = num((v * i * pf) / 1000, "kW", 1); // forgot root-3
        const wrong2 = num(result.value / pf, "kW", 1); // used kVA as if kW
        const wrong3 = num(near(result.value, 0.35, rng), "kW", 1);
        return [wrong1, wrong2, wrong3];
      },
    },
  },
  {
    name: "three-phase-current",
    weight: 6,
    spec: {
      discipline: D, topic: "Electrical Fundamentals", subtopic: "Three-Phase Power",
      tags: ["calculation", "power"], difficulty: "Intermediate",
      gen: (rng) => ({
        v: pick(rng, [400, 415, 433]),
        p: randInt(rng, 10, 480),
        pf: randFloat(rng, 0.75, 0.98, 2),
      }),
      compute: ({ v, p, pf }) => {
        const i = (p * 1000) / (SQ3 * v * pf);
        return { formatted: num(i, "A", 1), value: i };
      },
      question: ({ v, p, pf }) =>
        `A balanced three-phase load consumes ${p} kW at ${v} V (line-to-line) with a power factor of ${pf}. What is the approximate line current drawn?`,
      explanation: ({ v, p, pf }, formatted) =>
        `Line current I = P x 1000 / (root3 x V x cos(phi)) = ${p} x 1000 / (1.732 x ${v} x ${pf}) = ${formatted}.`,
      distractors: ({ v, p, pf }, result, rng) => [
        num((p * 1000) / (v * pf), "A", 1),
        num(result.value * pf, "A", 1),
        num(near(result.value, 0.3, rng), "A", 1),
      ],
    },
  },
  {
    name: "single-phase-power",
    weight: 5,
    spec: {
      discipline: D, topic: "Electrical Fundamentals", subtopic: "Single-Phase Power",
      tags: ["calculation", "power"], difficulty: "Basic",
      gen: (rng) => ({
        v: pick(rng, [220, 230, 240]),
        i: randInt(rng, 2, 60),
        pf: randFloat(rng, 0.7, 1.0, 2),
      }),
      compute: ({ v, i, pf }) => {
        const p = (v * i * pf) / 1000;
        return { formatted: num(p, "kW", 2), value: p };
      },
      question: ({ v, i, pf }) =>
        `A single-phase load operates at ${v} V and draws ${i} A at a power factor of ${pf}. What is the active power consumed?`,
      explanation: ({ v, i, pf }, formatted) => `Single-phase power P = V x I x cos(phi) = ${v} x ${i} x ${pf} / 1000 = ${formatted}.`,
      distractors: ({ v, i, pf }, result, rng) => [
        num((v * i) / 1000, "kW", 2),
        num(result.value * 0.5, "kW", 2),
        num(near(result.value, 0.3, rng), "kW", 2),
      ],
    },
  },
  {
    name: "transformer-flc",
    weight: 7,
    spec: {
      discipline: D, topic: "Three-Phase Systems & Transformers", subtopic: "Transformer FLC",
      tags: ["calculation", "transformer"], difficulty: "Intermediate",
      gen: (rng) => ({ kva: pick(rng, TRANSFORMER_KVA), v: pick(rng, [400, 415, 433, 440]) }),
      compute: ({ kva, v }) => {
        const i = (kva * 1000) / (SQ3 * v);
        return { formatted: num(i, "A", 1), value: i };
      },
      question: ({ kva, v }) =>
        `What is the approximate full load secondary current of a ${kva} kVA, ${v} V three-phase distribution transformer?`,
      explanation: ({ kva, v }, formatted) => `FLC = kVA x 1000 / (root3 x V) = ${kva} x 1000 / (1.732 x ${v}) = ${formatted}.`,
      distractors: ({ kva, v }, result, rng) => [
        num((kva * 1000) / v, "A", 1),
        num(result.value / SQ3, "A", 1),
        num(near(result.value, 0.25, rng), "A", 1),
      ],
    },
  },
  {
    name: "kvar-pf-correction",
    weight: 7,
    spec: {
      discipline: D, topic: "Metering & Power Quality", subtopic: "Power Factor Correction",
      tags: ["calculation", "power-factor"], difficulty: "Advanced",
      gen: (rng) => ({
        kw: randInt(rng, 20, 900),
        pf1: randFloat(rng, 0.65, 0.85, 2),
        pf2: randFloat(rng, 0.95, 0.99, 2),
      }),
      compute: ({ kw, pf1, pf2 }) => {
        const tan1 = Math.tan(Math.acos(pf1));
        const tan2 = Math.tan(Math.acos(pf2));
        const kvar = kw * (tan1 - tan2);
        return { formatted: num(kvar, "kVAR", 1), value: kvar };
      },
      question: ({ kw, pf1, pf2 }) =>
        `A facility has a load of ${kw} kW at an existing power factor of ${pf1}. What capacitor bank rating (kVAR) is required to improve the power factor to ${pf2}?`,
      explanation: ({ kw, pf1, pf2 }, formatted) =>
        `Required kVAR = kW x (tan(cos^-1 ${pf1}) - tan(cos^-1 ${pf2})) = ${formatted}. This is the standard power-factor-correction capacitor sizing formula.`,
      distractors: ({ kw, pf1, pf2 }, result, rng) => [
        num(kw * Math.tan(Math.acos(pf1)), "kVAR", 1),
        num(result.value * 1.5, "kVAR", 1),
        num(near(result.value, 0.3, rng), "kVAR", 1),
      ],
    },
  },
  {
    name: "energy-cost",
    weight: 6,
    spec: {
      discipline: D, topic: "Electrical BOQ & Estimation", subtopic: "Energy Cost",
      tags: ["calculation", "estimation"], difficulty: "Basic",
      gen: (rng) => ({
        kw: randInt(rng, 2, 400),
        hours: randInt(rng, 2, 24),
        rate: randFloat(rng, 6, 11, 2),
      }),
      compute: ({ kw, hours, rate }) => {
        const cost = kw * hours * rate;
        return { formatted: rupee(cost), value: cost };
      },
      question: ({ kw, hours, rate }) =>
        `A load of ${kw} kW operates for ${hours} hours a day. At an electricity tariff of Rs ${rate} per kWh, what is the approximate daily energy cost?`,
      explanation: ({ kw, hours, rate }, formatted) => `Daily cost = kW x hours x rate = ${kw} x ${hours} x ${rate} = ${formatted}.`,
      distractors: ({ kw, hours, rate }, result, rng) => [
        rupee(kw * rate),
        rupee(result.value / 2),
        rupee(near(result.value, 0.3, rng)),
      ],
    },
  },
  {
    name: "motor-starting-current",
    weight: 5,
    spec: {
      discipline: D, topic: "Motors & Starters", subtopic: "DOL Starting",
      tags: ["calculation", "motors"], difficulty: "Intermediate",
      gen: (rng) => ({ flc: randInt(rng, 8, 220), multiple: randFloat(rng, 6, 8, 1) }),
      compute: ({ flc, multiple }) => {
        const istart = flc * multiple;
        return { formatted: num(istart, "A", 0), value: istart };
      },
      question: ({ flc, multiple }) =>
        `A motor has a full load current of ${flc} A. If it is started Direct-On-Line with a starting current multiple of ${multiple} times FLC, what is the approximate starting current?`,
      explanation: ({ flc, multiple }, formatted) => `DOL starting current = FLC x multiple = ${flc} x ${multiple} = ${formatted}.`,
      distractors: ({ flc, multiple }, result, rng) => [
        num(flc * (multiple - 2), "A", 0),
        num(result.value / 3, "A", 0),
        num(near(result.value, 0.25, rng), "A", 0),
      ],
    },
  },
  {
    name: "star-delta-reduction",
    weight: 4,
    spec: {
      discipline: D, topic: "Motors & Starters", subtopic: "Star-Delta Starting",
      tags: ["calculation", "motors"], difficulty: "Intermediate",
      gen: (rng) => ({ dolCurrent: randInt(rng, 60, 1200) }),
      compute: ({ dolCurrent }) => {
        const starCurrent = dolCurrent / 3;
        return { formatted: num(starCurrent, "A", 0), value: starCurrent };
      },
      question: ({ dolCurrent }) =>
        `A motor's Direct-On-Line starting current is approximately ${dolCurrent} A. What is the approximate line starting current if a star-delta starter is used instead?`,
      explanation: ({ dolCurrent }, formatted) =>
        `Star-delta starting reduces the line starting current to about one-third of the DOL value: ${dolCurrent} / 3 = ${formatted}.`,
      distractors: ({ dolCurrent }, result, rng) => [
        num(dolCurrent / 1.73, "A", 0),
        num(dolCurrent * 0.75, "A", 0),
        num(near(result.value, 0.3, rng), "A", 0),
      ],
    },
  },
  {
    name: "cable-voltage-drop",
    weight: 8,
    spec: {
      discipline: D, topic: "Cables & Conductors", subtopic: "Voltage Drop",
      tags: ["calculation", "cables"], difficulty: "Advanced",
      gen: (rng) => {
        const cable = pick(rng, CABLE_MV_TABLE);
        return {
          size: cable.size, mv: cable.mv,
          length: randInt(rng, 20, 280),
          current: randInt(rng, Math.round(cable.capacity * 0.3), Math.round(cable.capacity * 0.9)),
          voltage: pick(rng, [415, 433]),
        };
      },
      compute: ({ mv, length, current, voltage }) => {
        const vd = (mv * current * length) / 1000;
        const vdPct = (vd / voltage) * 100;
        return { formatted: `${vdPct.toFixed(2)} %`, value: vdPct };
      },
      question: ({ size, length, current, voltage }) =>
        `A three-phase circuit uses a ${size} XLPE/PVC cable of ${length} m length carrying ${current} A at ${voltage} V. Using a voltage-drop factor of the cable, what is the approximate percentage voltage drop?`,
      explanation: ({ mv, length, current, voltage }, formatted) =>
        `Voltage drop (V) = (mV/A/m x I x L) / 1000 = (${mv} x ${current} x ${length}) / 1000. As a percentage of ${voltage} V, this is approximately ${formatted}.`,
      distractors: ({ mv, length, current, voltage }, result, rng) => [
        `${(result.value * 2).toFixed(2)} %`,
        `${(result.value / 2).toFixed(2)} %`,
        `${Math.max(0.1, near(result.value, 0.4, rng)).toFixed(2)} %`,
      ],
    },
  },
  {
    name: "cable-size-selection",
    weight: 6,
    spec: {
      discipline: D, topic: "Cables & Conductors", subtopic: "Cable Sizing",
      tags: ["calculation", "cables"], difficulty: "Intermediate",
      gen: (rng) => {
        const idx = randInt(rng, 2, CABLE_MV_TABLE.length - 2);
        const requiredCurrent = randInt(rng, CABLE_MV_TABLE[idx - 1].capacity + 2, CABLE_MV_TABLE[idx].capacity - 1);
        return { idx, requiredCurrent };
      },
      compute: ({ idx }) => ({ formatted: CABLE_MV_TABLE[idx].size, value: idx }),
      question: ({ requiredCurrent }) =>
        `A feeder is required to carry a design current of ${requiredCurrent} A after applying all derating factors. Which of the following standard XLPE cable sizes is the smallest adequate choice, given rated current-carrying capacities of 4 sq.mm/32A, 6 sq.mm/41A, 10 sq.mm/57A, 16 sq.mm/76A, 25 sq.mm/101A, 35 sq.mm/125A, 50 sq.mm/151A, 70 sq.mm/192A, 95 sq.mm/232A, 120 sq.mm/269A?`,
      explanation: ({ idx, requiredCurrent }, formatted) =>
        `The selected cable's rated current-carrying capacity must be greater than or equal to the design current of ${requiredCurrent} A. ${formatted} is the smallest standard size meeting this requirement.`,
      distractors: ({ idx }) => {
        const opts = [];
        if (CABLE_MV_TABLE[idx - 1]) opts.push(CABLE_MV_TABLE[idx - 1].size);
        if (CABLE_MV_TABLE[idx + 1]) opts.push(CABLE_MV_TABLE[idx + 1].size);
        if (CABLE_MV_TABLE[idx + 2]) opts.push(CABLE_MV_TABLE[idx + 2].size);
        while (opts.length < 3) opts.push(pick(Math.random, CABLE_MV_TABLE).size);
        return opts.slice(0, 3);
      },
    },
  },
  {
    name: "short-circuit-fault-level",
    weight: 5,
    spec: {
      discipline: D, topic: "HT Systems & Switchgear", subtopic: "Short Circuit Level",
      tags: ["calculation", "protection"], difficulty: "Advanced",
      gen: (rng) => ({
        kva: pick(rng, TRANSFORMER_KVA),
        v: 415,
        impedance: randFloat(rng, 4.0, 6.5, 1),
      }),
      compute: ({ kva, v, impedance }) => {
        const flc = (kva * 1000) / (SQ3 * v);
        const isc = flc * (100 / impedance);
        return { formatted: num(isc / 1000, "kA", 2), value: isc };
      },
      question: ({ kva, v, impedance }) =>
        `A ${kva} kVA, ${v} V transformer has a percentage impedance of ${impedance}%. What is the approximate symmetrical fault current available at its secondary terminals?`,
      explanation: ({ kva, v, impedance }, formatted) =>
        `Full load current = kVA x 1000 / (root3 x V). Fault current Isc = FLC x (100 / %Z) = approximately ${formatted}.`,
      distractors: ({ kva, v, impedance }, result, rng) => [
        num((result.value * impedance) / 100000, "kA", 2),
        num(result.value / 2000, "kA", 2),
        num(near(result.value / 1000, 0.3, rng), "kA", 2),
      ],
    },
  },
  {
    name: "battery-backup-time",
    weight: 5,
    spec: {
      discipline: D, topic: "UPS & Batteries", subtopic: "Battery Backup Time",
      tags: ["calculation", "battery"], difficulty: "Intermediate",
      gen: (rng) => ({ ah: pick(rng, [20, 26, 40, 65, 100, 120, 150, 200]), load: randInt(rng, 3, 90) }),
      compute: ({ ah, load }) => {
        const t = (ah * 0.85) / load;
        return { formatted: num(t, "hours", 2), value: t };
      },
      question: ({ ah, load }) =>
        `A UPS battery bank rated at ${ah} Ah supplies a DC load current of ${load} A. Assuming an effective usable capacity factor of 0.85, what is the approximate backup time available?`,
      explanation: ({ ah, load }, formatted) => `Backup time = (Ah x usable factor) / load current = (${ah} x 0.85) / ${load} = ${formatted}.`,
      distractors: ({ ah, load }, result, rng) => [
        num(ah / load, "hours", 2),
        num(result.value * 2, "hours", 2),
        num(near(result.value, 0.3, rng), "hours", 2),
      ],
    },
  },
  {
    name: "dg-loading-percent",
    weight: 5,
    spec: {
      discipline: D, topic: "DG Sets & Standby Power", subtopic: "DG Loading",
      tags: ["calculation", "dg"], difficulty: "Intermediate",
      gen: (rng) => ({
        dgKva: pick(rng, [125, 160, 200, 250, 320, 380, 500, 625, 750, 1000]),
        loadKw: randInt(rng, 40, 700),
        pf: randFloat(rng, 0.8, 0.95, 2),
      }),
      compute: ({ dgKva, loadKw, pf }) => {
        const loadKva = loadKw / pf;
        const pct = (loadKva / dgKva) * 100;
        return { formatted: `${pct.toFixed(1)} %`, value: pct };
      },
      question: ({ dgKva, loadKw, pf }) =>
        `A ${dgKva} kVA DG set supplies a load of ${loadKw} kW at a power factor of ${pf}. What is the approximate loading percentage of the DG set?`,
      explanation: ({ dgKva, loadKw, pf }, formatted) =>
        `Load in kVA = kW / PF = ${loadKw} / ${pf}. Loading % = (Load kVA / DG rated kVA) x 100 = approximately ${formatted}.`,
      distractors: ({ loadKw, dgKva }, result, rng) => [
        `${((loadKw / dgKva) * 100).toFixed(1)} %`,
        `${Math.min(150, result.value * 1.4).toFixed(1)} %`,
        `${Math.max(1, near(result.value, 0.3, rng)).toFixed(1)} %`,
      ],
    },
  },
  {
    name: "illumination-lux",
    weight: 5,
    spec: {
      discipline: D, topic: "Electrical Fundamentals", subtopic: "Illumination Design",
      tags: ["calculation", "lighting"], difficulty: "Intermediate",
      gen: (rng) => ({
        lumens: pick(rng, [1200, 2000, 2800, 3500, 4500]),
        fittings: randInt(rng, 10, 120),
        area: randInt(rng, 50, 800),
        uf: randFloat(rng, 0.5, 0.7, 2),
        mf: randFloat(rng, 0.7, 0.9, 2),
      }),
      compute: ({ lumens, fittings, area, uf, mf }) => {
        const lux = (lumens * fittings * uf * mf) / area;
        return { formatted: num(lux, "lux", 0), value: lux };
      },
      question: ({ lumens, fittings, area, uf, mf }) =>
        `An area of ${area} sq.m is lit by ${fittings} luminaires each rated at ${lumens} lumens, with a utilization factor of ${uf} and a maintenance factor of ${mf}. What is the approximate average illumination level achieved?`,
      explanation: ({ lumens, fittings, area, uf, mf }, formatted) =>
        `Average lux = (Total lumens x UF x MF) / Area = (${lumens} x ${fittings} x ${uf} x ${mf}) / ${area} = approximately ${formatted}.`,
      distractors: ({ lumens, fittings, area }, result, rng) => [
        num((lumens * fittings) / area, "lux", 0),
        num(result.value / 2, "lux", 0),
        num(near(result.value, 0.3, rng), "lux", 0),
      ],
    },
  },
  {
    name: "transformer-efficiency",
    weight: 4,
    spec: {
      discipline: D, topic: "Three-Phase Systems & Transformers", subtopic: "Transformer Efficiency",
      tags: ["calculation", "transformer"], difficulty: "Advanced",
      gen: (rng) => ({
        inputKw: randInt(rng, 100, 1800),
        lossKw: randFloat(rng, 2, 35, 1),
      }),
      compute: ({ inputKw, lossKw }) => {
        const eff = ((inputKw - lossKw) / inputKw) * 100;
        return { formatted: `${eff.toFixed(2)} %`, value: eff };
      },
      question: ({ inputKw, lossKw }) =>
        `A transformer draws ${inputKw} kW of input power while supplying its connected load, with total losses of ${lossKw} kW. What is its approximate efficiency?`,
      explanation: ({ inputKw, lossKw }, formatted) =>
        `Efficiency = (Input - Losses) / Input x 100 = (${inputKw} - ${lossKw}) / ${inputKw} x 100 = approximately ${formatted}.`,
      distractors: ({ inputKw, lossKw }, result, rng) => [
        `${(((inputKw - lossKw * 2) / inputKw) * 100).toFixed(2)} %`,
        `${Math.min(99.99, result.value + 3).toFixed(2)} %`,
        `${Math.max(50, near(result.value, 0.05, rng)).toFixed(2)} %`,
      ],
    },
  },
  {
    name: "busbar-current-rating",
    weight: 3,
    spec: {
      discipline: D, topic: "Cable Containment Systems", subtopic: "Busbar Sizing",
      tags: ["calculation", "busbar"], difficulty: "Advanced",
      gen: (rng) => ({
        width: pick(rng, [40, 50, 60, 80, 100, 120]),
        thickness: pick(rng, [5, 6, 8, 10]),
        density: randFloat(rng, 1.2, 1.6, 2),
      }),
      compute: ({ width, thickness, density }) => {
        const area = width * thickness;
        const rating = area * density;
        return { formatted: num(rating, "A", 0), value: rating };
      },
      question: ({ width, thickness, density }) =>
        `A copper busbar has cross-section ${width} mm x ${thickness} mm and is rated for a current density of ${density} A per sq.mm. What is its approximate continuous current rating?`,
      explanation: ({ width, thickness, density }, formatted) =>
        `Rating = cross-sectional area x current density = (${width} x ${thickness}) x ${density} = approximately ${formatted}.`,
      distractors: ({ width, thickness, density }, result, rng) => [
        num(width * thickness * (density * 0.6), "A", 0),
        num(result.value * 1.5, "A", 0),
        num(near(result.value, 0.3, rng), "A", 0),
      ],
    },
  },
  {
    name: "capacitor-bank-selection",
    weight: 4,
    spec: {
      discipline: D, topic: "Metering & Power Quality", subtopic: "Capacitor Bank Selection",
      tags: ["calculation", "power-factor"], difficulty: "Intermediate",
      gen: (rng) => {
        const standardSteps = [5, 10, 12.5, 15, 20, 25, 30, 40, 50, 60, 75];
        const kw = randInt(rng, 15, 400);
        const pf1 = randFloat(rng, 0.65, 0.82, 2);
        const requiredKvar = kw * (Math.tan(Math.acos(pf1)) - Math.tan(Math.acos(0.97)));
        const idx = standardSteps.findIndex((s) => s >= requiredKvar);
        const chosenIdx = idx === -1 ? standardSteps.length - 1 : idx;
        return { kw, pf1, requiredKvar, standardSteps, chosenIdx };
      },
      compute: ({ standardSteps, chosenIdx }) => ({ formatted: `${standardSteps[chosenIdx]} kVAR`, value: chosenIdx }),
      question: ({ kw, pf1, requiredKvar }) =>
        `A ${kw} kW load operates at a power factor of ${pf1} and is to be corrected to 0.97. The calculated requirement is approximately ${requiredKvar.toFixed(1)} kVAR. Which standard capacitor bank step size should be selected to meet or exceed this requirement (5, 10, 12.5, 15, 20, 25, 30, 40, 50, 60, 75 kVAR)?`,
      explanation: ({ requiredKvar }, formatted) =>
        `The selected standard capacitor step must be the smallest available rating that is greater than or equal to the calculated requirement of approximately ${requiredKvar.toFixed(1)} kVAR, which is ${formatted}.`,
      distractors: ({ standardSteps, chosenIdx }) => {
        const opts = [];
        if (standardSteps[chosenIdx - 1] !== undefined) opts.push(`${standardSteps[chosenIdx - 1]} kVAR`);
        if (standardSteps[chosenIdx + 1] !== undefined) opts.push(`${standardSteps[chosenIdx + 1]} kVAR`);
        if (standardSteps[chosenIdx + 2] !== undefined) opts.push(`${standardSteps[chosenIdx + 2]} kVAR`);
        while (opts.length < 3) opts.push(`${standardSteps[Math.max(0, chosenIdx - opts.length - 1)]} kVAR`);
        return opts.slice(0, 3);
      },
    },
  },
  {
    name: "earth-electrode-resistance",
    weight: 3,
    spec: {
      discipline: D, topic: "Earthing & Lightning Protection", subtopic: "Earth Resistance Calculation",
      tags: ["calculation", "earthing"], difficulty: "Advanced",
      gen: (rng) => ({
        resistivity: randInt(rng, 50, 400),
        length: randFloat(rng, 2, 6, 1),
        diameter: randFloat(rng, 0.012, 0.025, 3),
      }),
      compute: ({ resistivity, length, diameter }) => {
        const r = (resistivity / (2 * Math.PI * length)) * (Math.log((4 * length) / diameter) - 1);
        return { formatted: num(r, "ohm", 2), value: r };
      },
      question: ({ resistivity, length, diameter }) =>
        `A single vertical earth rod of length ${length} m and diameter ${(diameter * 1000).toFixed(0)} mm is driven into soil with resistivity ${resistivity} ohm-m. Using the standard single-rod earth resistance formula, what is the approximate resistance to earth?`,
      explanation: ({ resistivity, length, diameter }, formatted) =>
        `Using R = (rho / (2 x pi x L)) x [ln(4L/d) - 1] with rho = ${resistivity}, L = ${length} m, d = ${diameter} m, the approximate resistance is ${formatted}.`,
      distractors: ({ resistivity, length }, result, rng) => [
        num(resistivity / length, "ohm", 2),
        num(result.value * 2, "ohm", 2),
        num(near(result.value, 0.3, rng), "ohm", 2),
      ],
    },
  },
  {
    name: "ct-secondary-current",
    weight: 3,
    spec: {
      discipline: D, topic: "HT Systems & Switchgear", subtopic: "CT Ratio",
      tags: ["calculation", "metering"], difficulty: "Basic",
      gen: (rng) => ({
        ctPrimary: pick(rng, [100, 150, 200, 300, 400, 600, 800, 1000, 1500]),
        faultCurrent: randInt(rng, 500, 15000),
      }),
      compute: ({ ctPrimary, faultCurrent }) => {
        const isec = (faultCurrent * 5) / ctPrimary;
        return { formatted: num(isec, "A", 2), value: isec };
      },
      question: ({ ctPrimary, faultCurrent }) =>
        `A current transformer has a ratio of ${ctPrimary}/5 A. If the primary fault current is ${faultCurrent} A, what is the corresponding secondary current seen by the relay?`,
      explanation: ({ ctPrimary, faultCurrent }, formatted) =>
        `Secondary current = Primary current x (5 / CT primary rating) = ${faultCurrent} x (5 / ${ctPrimary}) = ${formatted}.`,
      distractors: ({ ctPrimary, faultCurrent }, result, rng) => [
        num((faultCurrent * ctPrimary) / 5, "A", 2),
        num(result.value * 2, "A", 2),
        num(near(result.value, 0.3, rng), "A", 2),
      ],
    },
  },
];

export { CALC_TEMPLATES, FACTS };

export function generateElectrical() {
  const conceptual = roundRobinTrim(buildFromFactBank(FACTS, D), CONCEPTUAL_TARGET, (q) => q.topic);

  const calcTarget = TARGET - conceptual.length;
  const calc = buildCalcSet(CALC_TEMPLATES, calcTarget, "electrical");

  return [...conceptual, ...calc].slice(0, TARGET);
}
