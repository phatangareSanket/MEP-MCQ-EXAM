import { randInt, randFloat, pick } from "../lib/rng.mjs";
import { buildFromFactBank, buildCalcSet, roundRobinTrim } from "../lib/engine.mjs";

const D = "Fire Fighting";
const TARGET = 600;
const CONCEPTUAL_TARGET = 150;

const FACTS = [
  // Fire Protection Fundamentals
  { term: "Fire Triangle", topic: "Fire Protection Fundamentals", difficulty: "Basic", tags: ["fundamentals"],
    definition: "A model illustrating the three elements needed for fire to occur: heat, fuel, and oxygen.",
    function: "To explain the basic principle behind most fire extinguishing methods, which remove one of the three elements.",
    fact: "Removing any one side of the fire triangle - heat, fuel, or oxygen - will extinguish a fire." },
  { term: "Class A Fire", topic: "Fire Protection Fundamentals", difficulty: "Basic", tags: ["classification"],
    definition: "A fire involving ordinary combustible materials such as wood, paper, cloth, and most plastics.",
    function: "To classify fires by fuel type so an appropriate extinguishing agent can be selected.",
    fact: "Water and foam extinguishers are commonly effective on Class A fires." },
  { term: "Class B Fire", topic: "Fire Protection Fundamentals", difficulty: "Basic", tags: ["classification"],
    definition: "A fire involving flammable liquids or gases such as petrol, diesel, or LPG.",
    function: "To classify fires by fuel type so an appropriate extinguishing agent can be selected.",
    fact: "Water jets are generally unsuitable for Class B fires; foam, CO2, or dry powder are preferred." },
  { term: "Electrical Fire Hazard", topic: "Fire Protection Fundamentals", difficulty: "Basic", tags: ["classification"],
    definition: "A fire originating in or involving energized electrical equipment.",
    function: "To highlight the need for non-conductive extinguishing agents, such as CO2, near live electrical equipment.",
    fact: "Water-based extinguishers should not be used on fires involving live electrical equipment due to shock risk." },
  { term: "Fire Compartmentation", topic: "Fire Protection Fundamentals", difficulty: "Intermediate", tags: ["passive-fire-protection"],
    definition: "The division of a building into fire-resistant compartments to limit fire and smoke spread.",
    function: "To contain a fire within its area of origin for a defined period, protecting escape routes and adjacent areas.",
    fact: "Fire compartmentation relies on fire-rated walls, floors, doors, and properly sealed service penetrations." },
  { term: "Means of Escape", topic: "Fire Protection Fundamentals", difficulty: "Intermediate", tags: ["egress"],
    definition: "The route or routes provided in a building to allow occupants to reach a place of safety during a fire emergency.",
    function: "To ensure occupants can evacuate safely and within an acceptable time during a fire.",
    fact: "Means of escape design typically considers travel distance, exit width, and number of exits based on occupancy." },
  { term: "Fire Load", topic: "Fire Protection Fundamentals", difficulty: "Advanced", tags: ["fundamentals"],
    definition: "The total quantity of combustible material present in a space, expressed as potential heat release per unit area.",
    function: "To help estimate the potential severity and duration of a fire in a given occupancy.",
    fact: "Higher fire load occupancies, such as storage warehouses, generally require more robust fire protection measures." },

  // Fire Water Supply & Pumps
  { term: "Fire Water Storage Tank", topic: "Fire Water Supply & Pumps", difficulty: "Basic", tags: ["water-supply"],
    definition: "A dedicated tank storing water reserved exclusively for fire fighting use.",
    function: "To ensure a reliable, dedicated water supply is available for fire fighting systems independent of domestic water demand.",
    fact: "Fire water storage tank capacity is typically sized based on the expected duration and flow rate of fire fighting operations." },
  { term: "Main Fire Pump", topic: "Fire Water Supply & Pumps", difficulty: "Basic", tags: ["pumps"],
    definition: "The primary pump that pressurizes the fire fighting water distribution system during a fire.",
    function: "To supply the required flow and pressure to hydrant, sprinkler, and hose reel systems during a fire.",
    fact: "Main fire pumps are typically driven by either an electric motor or a diesel engine." },
  { term: "Diesel Fire Pump", topic: "Fire Water Supply & Pumps", difficulty: "Intermediate", tags: ["pumps"],
    definition: "A fire pump driven by a diesel engine, providing fire water supply independent of the electrical power supply.",
    function: "To ensure fire water supply remains available even during a total power failure.",
    fact: "Diesel fire pumps are commonly provided as a backup to the electric fire pump in critical installations." },
  { term: "Jockey Pump", topic: "Fire Water Supply & Pumps", difficulty: "Intermediate", tags: ["pumps"],
    definition: "A small-capacity pump that maintains system pressure in a fire fighting network, preventing nuisance starting of the main fire pump.",
    function: "To compensate for minor leakage and pressure fluctuations, avoiding unnecessary starts of the main fire pump.",
    fact: "A jockey pump is sized only to make up small leakage losses, not to supply actual fire fighting flow." },
  { term: "Fire Pump Controller", topic: "Fire Water Supply & Pumps", difficulty: "Intermediate", tags: ["pumps"],
    definition: "A control panel that automatically starts and monitors the fire pump based on system pressure signals.",
    function: "To ensure the fire pump starts automatically and reliably when system pressure drops due to fire fighting demand.",
    fact: "Fire pump controllers are typically required to start the pump automatically without requiring manual intervention." },
  { term: "Fire Pump Performance Curve", topic: "Fire Water Supply & Pumps", difficulty: "Advanced", tags: ["pumps"],
    definition: "A graph showing the relationship between flow rate and discharge pressure for a fire pump.",
    function: "To verify that a selected fire pump can deliver the required flow at the required pressure across its operating range.",
    fact: "Fire pump performance is typically verified at churn (no flow), rated, and overload flow conditions." },

  // Hydrant Systems
  { term: "Wet Riser", topic: "Hydrant Systems", difficulty: "Basic", tags: ["hydrant"],
    definition: "A vertical fire fighting pipe that remains permanently charged with water under pressure, ready for immediate use.",
    function: "To provide instant water availability at each floor landing valve for fire fighting in multi-storey buildings.",
    fact: "Wet risers are typically required in taller buildings where immediate water availability is critical for fire response time." },
  { term: "Down Comer System", topic: "Hydrant Systems", difficulty: "Intermediate", tags: ["hydrant"],
    definition: "A vertical fire fighting pipe, typically fed from a rooftop tank, used to convey water down to landing valves on each floor.",
    function: "To provide a fire fighting water supply path where a top-fed gravity or terrace-tank supply is used.",
    fact: "Down-comer systems are typically fed from a terrace-level tank and supply landing valves at each floor below." },
  { term: "Landing Valve", topic: "Hydrant Systems", difficulty: "Basic", tags: ["hydrant"],
    definition: "A valve outlet on a wet riser or down comer system where a fire hose is connected by fire fighters.",
    function: "To provide a controlled connection point for fire hoses at each floor during fire fighting operations.",
    fact: "Landing valves are typically provided at each floor level within the fire escape staircase or lobby." },
  { term: "Hose Reel", topic: "Hydrant Systems", difficulty: "Basic", tags: ["hydrant"],
    definition: "A fixed fire fighting installation with a rubber hose wound on a reel, connected to a pressurized water supply, for first-aid fire fighting.",
    function: "To allow building occupants to tackle a fire in its early stages before the fire brigade arrives.",
    fact: "Hose reels are intended for use by building occupants and are usually limited to a defined hose length and coverage radius." },
  { term: "Fire Brigade Breeching Inlet", topic: "Hydrant Systems", difficulty: "Intermediate", tags: ["hydrant"],
    definition: "An external connection point allowing the fire brigade to pump water into a building's fire fighting system from a fire tender.",
    function: "To allow the fire brigade to boost or supply the building's internal fire fighting system during a major fire.",
    fact: "Fire brigade breeching inlets are typically located at the building's accessible exterior for tender connection." },
  { term: "External Hydrant", topic: "Hydrant Systems", difficulty: "Basic", tags: ["hydrant"],
    definition: "A fire hydrant located outside a building, typically along access roads, connected to the fire water ring main.",
    function: "To provide a fire water source for fire brigade use around the perimeter of a building or site.",
    fact: "External hydrants are typically spaced at defined intervals along site access roads per fire safety norms." },

  // Sprinkler Systems
  { term: "Automatic Sprinkler System", topic: "Sprinkler Systems", difficulty: "Basic", tags: ["sprinkler"],
    definition: "A fixed fire protection system with a network of piping and sprinkler heads that automatically discharge water when triggered by heat.",
    function: "To automatically detect and suppress or control a fire at an early stage without requiring human intervention.",
    fact: "Sprinkler systems are widely recognized as one of the most effective automatic fire suppression measures." },
  { term: "Sprinkler Head", topic: "Sprinkler Systems", difficulty: "Basic", tags: ["sprinkler"],
    definition: "A heat-sensitive device that opens automatically at a set temperature to discharge water onto a fire.",
    function: "To automatically release water directly over the fire area once a preset temperature is reached.",
    fact: "Sprinkler heads are commonly color-coded and rated for different temperature activation thresholds." },
  { term: "Wet Pipe Sprinkler System", topic: "Sprinkler Systems", difficulty: "Intermediate", tags: ["sprinkler"],
    definition: "A sprinkler system where pipes are permanently filled with pressurized water, ready for immediate discharge.",
    function: "To provide the fastest sprinkler response since water is already present in the piping network.",
    fact: "Wet pipe systems are the most common sprinkler system type in buildings not subject to freezing conditions." },
  { term: "Sprinkler Alarm Valve", topic: "Sprinkler Systems", difficulty: "Intermediate", tags: ["sprinkler"],
    definition: "A valve in a sprinkler system that allows water flow to the sprinkler network and simultaneously triggers a fire alarm signal.",
    function: "To detect water flow caused by an activated sprinkler head and initiate an alarm notification.",
    fact: "An alarm valve typically incorporates a water motor gong or electronic flow switch to signal sprinkler activation." },
  { term: "Deluge System", topic: "Sprinkler Systems", difficulty: "Advanced", tags: ["sprinkler"],
    definition: "A sprinkler-type system with open nozzles where water is released simultaneously over an entire area upon detection of fire.",
    function: "To provide rapid, area-wide water application for high-hazard areas where fire can spread very quickly.",
    fact: "Deluge systems use open sprinkler or nozzle heads, unlike standard automatic sprinklers which have individually heat-activated heads." },
  { term: "Sprinkler Zone Control Valve", topic: "Sprinkler Systems", difficulty: "Intermediate", tags: ["sprinkler"],
    definition: "A valve that isolates and monitors water supply to a defined zone or floor of a sprinkler system.",
    function: "To allow individual zones to be isolated for maintenance while indicating zone status to the fire alarm system.",
    fact: "Zone control valves are typically supervised (monitored) to detect if they are inadvertently left closed." },

  // Special Suppression Systems
  { term: "Foam System", topic: "Special Suppression Systems", difficulty: "Intermediate", tags: ["suppression"],
    definition: "A fire suppression system that generates and applies foam to smother flammable liquid fires and prevent vapor release.",
    function: "To suppress and control fires involving flammable liquids by blanketing the fuel surface and excluding oxygen.",
    fact: "Foam systems are particularly effective for flammable liquid fires such as those involving diesel or petrol storage." },
  { term: "Clean Agent Suppression System", topic: "Special Suppression Systems", difficulty: "Advanced", tags: ["suppression"],
    definition: "A fire suppression system using a gaseous agent that extinguishes fire without leaving residue, suitable for sensitive equipment areas.",
    function: "To suppress fires in areas with sensitive electronic equipment without causing water or residue damage.",
    fact: "Clean agent systems are commonly used in data centers, server rooms, and electrical switchgear rooms." },
  { term: "CO2 Fire Suppression System", topic: "Special Suppression Systems", difficulty: "Advanced", tags: ["suppression"],
    definition: "A fire suppression system that discharges carbon dioxide gas to displace oxygen and extinguish fire.",
    function: "To suppress fires by reducing oxygen concentration below the level needed to sustain combustion.",
    fact: "CO2 suppression systems pose an asphyxiation risk to personnel and require strict safety precautions before discharge." },
  { term: "Gas Suppression Release Panel", topic: "Special Suppression Systems", difficulty: "Advanced", tags: ["suppression"],
    definition: "A control panel that monitors detectors in a protected area and initiates gas suppression discharge, usually after a time delay.",
    function: "To confirm a genuine fire condition and provide an evacuation delay before releasing suppression gas.",
    fact: "Gas suppression panels typically use cross-zoned detection to reduce the risk of false discharge." },
  { term: "Kitchen Wet Chemical Suppression System", topic: "Special Suppression Systems", difficulty: "Intermediate", tags: ["suppression"],
    definition: "A fire suppression system using a wet chemical agent specifically designed for commercial kitchen cooking equipment fires.",
    function: "To suppress grease and cooking oil fires in commercial kitchen exhaust hoods and cooking equipment.",
    fact: "Wet chemical kitchen suppression systems are specifically designed for the high-temperature, deep-fat-fire hazards of commercial cooking." },

  // Fire Extinguishers & Portable Equipment
  { term: "Portable Fire Extinguisher", topic: "Fire Extinguishers & Portable Equipment", difficulty: "Basic", tags: ["extinguisher"],
    definition: "A hand-held device containing an extinguishing agent, used for manually fighting small fires in their early stages.",
    function: "To allow immediate action against a small fire before it grows beyond control.",
    fact: "Fire extinguishers are typically classified and color-coded based on the type of extinguishing agent they contain." },
  { term: "CO2 Extinguisher", topic: "Fire Extinguishers & Portable Equipment", difficulty: "Basic", tags: ["extinguisher"],
    definition: "A portable extinguisher discharging carbon dioxide gas, effective on electrical and flammable liquid fires.",
    function: "To provide a clean, non-conductive extinguishing option suitable for use on live electrical equipment.",
    fact: "CO2 extinguishers leave no residue, making them suitable for use around sensitive electrical and electronic equipment." },
  { term: "Dry Chemical Powder (DCP) Extinguisher", topic: "Fire Extinguishers & Portable Equipment", difficulty: "Basic", tags: ["extinguisher"],
    definition: "A portable extinguisher discharging a dry chemical powder effective on multiple fire classes.",
    function: "To provide a versatile extinguishing option suitable for Class A, B, and C fires depending on formulation.",
    fact: "DCP extinguishers are commonly provided in vehicle areas, generator rooms, and general industrial spaces." },
  { term: "Foam Type Extinguisher", topic: "Fire Extinguishers & Portable Equipment", difficulty: "Basic", tags: ["extinguisher"],
    definition: "A portable extinguisher discharging foam, effective mainly on Class A and Class B fires.",
    function: "To suppress fires involving ordinary combustibles and flammable liquids by smothering the fuel.",
    fact: "Foam extinguishers are not suitable for use on live electrical equipment due to their water content." },
  { term: "Fire Extinguisher Inspection", topic: "Fire Extinguishers & Portable Equipment", difficulty: "Intermediate", tags: ["extinguisher"],
    definition: "A periodic check of fire extinguishers to confirm they are correctly located, charged, and in serviceable condition.",
    function: "To ensure fire extinguishers remain ready for immediate effective use in an emergency.",
    fact: "Fire extinguishers are typically inspected periodically and refilled or serviced per manufacturer or code requirements." },
  { term: "Fire Blanket", topic: "Fire Extinguishers & Portable Equipment", difficulty: "Basic", tags: ["extinguisher"],
    definition: "A sheet of fire-resistant material used to smother small fires or wrap around a person whose clothing has caught fire.",
    function: "To provide a simple, immediate means of smothering small fires, particularly in kitchens.",
    fact: "Fire blankets are commonly provided in kitchens as a quick response tool for small pan or clothing fires." },

  // Fire-Rated Piping & Fire Stopping
  { term: "Fire-Rated Pipe", topic: "Fire-Rated Piping & Fire Stopping", difficulty: "Intermediate", tags: ["fire-stopping"],
    definition: "Piping used in fire fighting systems, rated to withstand the pressures associated with fire fighting service.",
    function: "To reliably convey fire fighting water under system pressure without failure during a fire emergency.",
    fact: "Fire fighting pipework is typically specified with a minimum pressure rating well above the system's expected working pressure." },
  { term: "Fire Stopping", topic: "Fire-Rated Piping & Fire Stopping", difficulty: "Intermediate", tags: ["fire-stopping"],
    definition: "Sealing materials and systems used to maintain the fire rating of a wall or floor at service penetrations, such as pipes, cables, or ducts.",
    function: "To prevent fire and smoke from spreading through gaps created by service penetrations in fire-rated construction.",
    fact: "Fire stopping materials are selected and tested to match the fire rating of the wall or floor they penetrate." },
  { term: "Fire-Rated Door", topic: "Fire-Rated Piping & Fire Stopping", difficulty: "Basic", tags: ["fire-stopping"],
    definition: "A door assembly, including frame and hardware, tested and rated to resist fire spread for a specified duration.",
    function: "To maintain compartmentation at doorways within fire-rated walls, limiting fire and smoke spread.",
    fact: "Fire-rated doors are typically fitted with self-closing devices to ensure they remain closed during a fire." },
  { term: "Intumescent Sealant", topic: "Fire-Rated Piping & Fire Stopping", difficulty: "Advanced", tags: ["fire-stopping"],
    definition: "A sealant that expands when exposed to heat, sealing gaps and maintaining fire resistance at penetrations and joints.",
    function: "To close small gaps and openings under fire conditions, restoring the fire barrier's integrity.",
    fact: "Intumescent sealants are commonly used around cable and pipe penetrations through fire-rated walls and floors." },
  { term: "Fire Collar", topic: "Fire-Rated Piping & Fire Stopping", difficulty: "Advanced", tags: ["fire-stopping"],
    definition: "A device fitted around a plastic pipe penetration through a fire-rated wall or floor that closes the opening if the pipe melts in a fire.",
    function: "To prevent fire spread through a penetration after a combustible pipe is destroyed by fire.",
    fact: "Fire collars are commonly used where plastic pipes, such as PVC, pass through fire-rated construction." },

  // Hydraulic Calculations & Pump Sizing
  { term: "Fire Pump Rated Duty Point", topic: "Hydraulic Calculations & Pump Sizing", difficulty: "Advanced", tags: ["hydraulics"],
    definition: "The design flow rate and discharge pressure a fire pump must deliver to meet the hydraulic demand of the fire fighting system.",
    function: "To ensure the fire pump can meet the combined flow and pressure requirements of hydrants, sprinklers, and hose reels operating together.",
    fact: "Fire pump sizing is based on the hydraulically most demanding scenario, considering simultaneous operation of specified outlets." },
  { term: "Friction Loss (Fire Fighting Pipework)", topic: "Hydraulic Calculations & Pump Sizing", difficulty: "Advanced", tags: ["hydraulics"],
    definition: "The pressure loss that occurs as water flows through pipes, fittings, and valves in a fire fighting system.",
    function: "To account for pressure loss along the pipe route when calculating the required fire pump discharge pressure.",
    fact: "Friction loss increases with flow rate, pipe roughness, and pipe length, and decreases with larger pipe diameter." },
  { term: "Residual Pressure (Hydrant)", topic: "Hydraulic Calculations & Pump Sizing", difficulty: "Advanced", tags: ["hydraulics"],
    definition: "The remaining water pressure available at a hydrant outlet while water is flowing, as opposed to static (no-flow) pressure.",
    function: "To confirm that adequate pressure remains available at the farthest or most demanding outlet under flow conditions.",
    fact: "Residual pressure at the hydraulically most remote hydrant is a key check in fire fighting system design." },
  { term: "Total Dynamic Head (Fire Pump)", topic: "Hydraulic Calculations & Pump Sizing", difficulty: "Advanced", tags: ["hydraulics"],
    definition: "The total head a fire pump must develop, accounting for elevation, friction losses, and required residual pressure at the outlet.",
    function: "To determine the discharge pressure rating required for the fire pump to meet system demand.",
    fact: "Total dynamic head calculations typically sum static elevation head, pipe friction losses, and minimum required outlet pressure." },

  // Fire Fighting BOQ & Estimation
  { term: "Fire Fighting BOQ", topic: "Fire Fighting BOQ & Estimation", difficulty: "Basic", tags: ["estimation"],
    definition: "A bill of quantities listing pipes, valves, pumps, sprinklers, and other fire fighting materials with quantities for pricing.",
    function: "To provide a standardized basis for pricing and comparing fire fighting works packages.",
    fact: "Fire fighting BOQs are typically prepared based on hydraulically designed drawings to ensure accurate quantities." },
  { term: "Fire Fighting Rate Analysis", topic: "Fire Fighting BOQ & Estimation", difficulty: "Intermediate", tags: ["estimation"],
    definition: "A detailed cost breakdown for fire fighting items covering pipe, fittings, valves, labour, and testing.",
    function: "To establish and justify unit rates quoted for fire fighting BOQ items.",
    fact: "Fire fighting rate analysis typically accounts for hydro-testing and flushing activities in addition to material and installation costs." },
  { term: "Fire Fighting SITC Scope", topic: "Fire Fighting BOQ & Estimation", difficulty: "Basic", tags: ["estimation"],
    definition: "A contract scope covering supply, installation, testing, and commissioning of a complete fire fighting system.",
    function: "To clearly define the contractor's responsibility for delivering a fully functional and tested fire fighting system.",
    fact: "Fire fighting SITC scope typically includes statutory testing and liaison with fire authorities for approval." },
  { term: "Third-Party Inspection (Fire Systems)", topic: "Fire Fighting BOQ & Estimation", difficulty: "Intermediate", tags: ["estimation"],
    definition: "An independent inspection and certification of a fire fighting system's compliance with design and code requirements.",
    function: "To provide independent verification and assurance of a fire fighting system's compliance before handover.",
    fact: "Third-party inspection certificates are often required by insurance providers or local fire authorities before occupancy." },

  // Fire Codes, Testing & Commissioning
  { term: "Fire NOC", topic: "Fire Codes, Testing & Commissioning", difficulty: "Basic", tags: ["codes"],
    definition: "An approval issued by local fire authorities confirming a building's fire protection systems comply with applicable fire safety requirements.",
    function: "To provide statutory confirmation that a building meets fire safety norms before occupancy is permitted.",
    fact: "A fire NOC is typically a mandatory requirement before a building can be legally occupied in many jurisdictions." },
  { term: "Hydrostatic Pressure Test", topic: "Fire Codes, Testing & Commissioning", difficulty: "Intermediate", tags: ["testing"],
    definition: "A test in which a fire fighting pipeline is pressurized with water above its normal working pressure to check for leaks or weaknesses.",
    function: "To verify the mechanical integrity of fire fighting pipework before it is put into service.",
    fact: "Hydrostatic testing is typically performed and the pressure held for a specified duration to confirm no drop occurs." },
  { term: "Fire Drill", topic: "Fire Codes, Testing & Commissioning", difficulty: "Basic", tags: ["testing"],
    definition: "A rehearsed evacuation exercise conducted periodically to train building occupants in emergency evacuation procedures.",
    function: "To ensure building occupants and staff know evacuation routes and procedures in advance of a real emergency.",
    fact: "Fire drills are typically conducted periodically and their results are documented for review and improvement." },
  { term: "Fire System Commissioning", topic: "Fire Codes, Testing & Commissioning", difficulty: "Intermediate", tags: ["commissioning"],
    definition: "The process of testing and verifying that all fire protection systems function correctly and meet design intent before handover.",
    function: "To confirm the complete fire protection system operates as an integrated whole prior to occupancy.",
    fact: "Fire system commissioning typically includes integrated testing of detection, alarm, suppression, and pump systems together." },
];

const num = (n, unit, decimals = 2) => `${Number(n.toFixed(decimals)).toLocaleString("en-IN")} ${unit}`;
const near = (v, pct, rng) => v * (1 + (rng() * 2 - 1) * pct);

const CALC_TEMPLATES = [
  {
    name: "hydrant-simultaneous-demand",
    weight: 6,
    spec: {
      discipline: D, topic: "Hydraulic Calculations & Pump Sizing", subtopic: "Hydrant Demand", tags: ["calculation"], difficulty: "Intermediate",
      gen: (rng) => ({ hydrants: randInt(rng, 2, 9), flowEach: pick(rng, [900, 950, 1000, 1100, 1150, 1200]) }),
      compute: ({ hydrants, flowEach }) => ({ formatted: num(hydrants * flowEach, "lpm", 0), value: hydrants * flowEach }),
      question: ({ hydrants, flowEach }) =>
        `A hydrant system design requires ${hydrants} hydrants to operate simultaneously, each with a design flow of ${flowEach} litres per minute. What is the total design flow demand for the fire pump?`,
      explanation: ({ hydrants, flowEach }, formatted) =>
        `Total demand = Number of simultaneous hydrants x Flow per hydrant = ${hydrants} x ${flowEach} = ${formatted}.`,
      distractors: ({ hydrants, flowEach }, result, rng) => [
        num(flowEach, "lpm", 0),
        num(result.value * 1.5, "lpm", 0),
        num(near(result.value, 0.25, rng), "lpm", 0),
      ],
    },
  },
  {
    name: "sprinkler-density-demand",
    weight: 6,
    spec: {
      discipline: D, topic: "Sprinkler Systems", subtopic: "Design Density", tags: ["calculation"], difficulty: "Advanced",
      gen: (rng) => ({ area: randInt(rng, 80, 400), density: randFloat(rng, 5, 12.5, 1) }),
      compute: ({ area, density }) => ({ formatted: num(area * density, "lpm", 0), value: area * density }),
      question: ({ area, density }) =>
        `A sprinkler system is designed for a hydraulically most demanding area of ${area} sq.m at a design density of ${density} mm/min (litres per minute per sq.m). What is the required water flow rate for this design area?`,
      explanation: ({ area, density }, formatted) =>
        `Required flow = Design area x Design density = ${area} x ${density} = ${formatted}.`,
      distractors: ({ area, density }, result, rng) => [
        num(area / density, "lpm", 0),
        num(result.value * 1.6, "lpm", 0),
        num(near(result.value, 0.25, rng), "lpm", 0),
      ],
    },
  },
  {
    name: "tank-capacity-duration",
    weight: 6,
    spec: {
      discipline: D, topic: "Fire Water Supply & Pumps", subtopic: "Tank Sizing", tags: ["calculation"], difficulty: "Intermediate",
      gen: (rng) => ({ flow: randInt(rng, 1500, 6000), durationMin: pick(rng, [60, 90, 120, 180]) }),
      compute: ({ flow, durationMin }) => ({ formatted: num((flow * durationMin) / 1000, "cu.m", 1), value: (flow * durationMin) / 1000 }),
      question: ({ flow, durationMin }) =>
        `A fire water storage tank must supply a design flow of ${flow} litres per minute for a minimum duration of ${durationMin} minutes. What is the minimum required tank capacity?`,
      explanation: ({ flow, durationMin }, formatted) =>
        `Minimum capacity (cu.m) = (Flow(lpm) x Duration(min)) / 1000 = (${flow} x ${durationMin}) / 1000 = ${formatted}.`,
      distractors: ({ flow, durationMin }, result, rng) => [
        num(result.value / 2, "cu.m", 1),
        num(result.value * 1.5, "cu.m", 1),
        num(near(result.value, 0.25, rng), "cu.m", 1),
      ],
    },
  },
  {
    name: "fire-pump-total-dynamic-head",
    weight: 6,
    spec: {
      discipline: D, topic: "Hydraulic Calculations & Pump Sizing", subtopic: "Total Dynamic Head", tags: ["calculation"], difficulty: "Advanced",
      gen: (rng) => ({
        staticHead: randInt(rng, 15, 90),
        frictionLoss: randInt(rng, 8, 40),
        residualPressureM: pick(rng, [35, 32, 30]),
      }),
      compute: ({ staticHead, frictionLoss, residualPressureM }) => ({
        formatted: num(staticHead + frictionLoss + residualPressureM, "m", 0),
        value: staticHead + frictionLoss + residualPressureM,
      }),
      question: ({ staticHead, frictionLoss, residualPressureM }) =>
        `A fire pump must overcome a static elevation head of ${staticHead} m, a total friction loss of ${frictionLoss} m, and deliver a minimum residual pressure equivalent to ${residualPressureM} m at the most remote outlet. What is the minimum total dynamic head (discharge head) required for the fire pump?`,
      explanation: ({ staticHead, frictionLoss, residualPressureM }, formatted) =>
        `Total dynamic head = Static head + Friction loss + Required residual head = ${staticHead} + ${frictionLoss} + ${residualPressureM} = ${formatted}.`,
      distractors: ({ staticHead, frictionLoss, residualPressureM }, result, rng) => [
        num(staticHead + frictionLoss, "m", 0),
        num(result.value * 1.4, "m", 0),
        num(near(result.value, 0.2, rng), "m", 0),
      ],
    },
  },
  {
    name: "extinguisher-count",
    weight: 5,
    spec: {
      discipline: D, topic: "Fire Extinguishers & Portable Equipment", subtopic: "Extinguisher Coverage", tags: ["calculation"], difficulty: "Basic",
      gen: (rng) => ({ area: randInt(rng, 300, 5000), coveragePerUnit: pick(rng, [100, 150, 200, 250]) }),
      compute: ({ area, coveragePerUnit }) => ({ formatted: `${Math.ceil(area / coveragePerUnit)} extinguishers`, value: Math.ceil(area / coveragePerUnit) }),
      question: ({ area, coveragePerUnit }) =>
        `A floor has a total area of ${area} sq.m. If each portable fire extinguisher is assumed to protect a coverage area of ${coveragePerUnit} sq.m, what is the minimum number of extinguishers required for this floor?`,
      explanation: ({ area, coveragePerUnit }, formatted) =>
        `Minimum number = Area / Coverage per unit, rounded up = ${area} / ${coveragePerUnit} rounded up to ${formatted}.`,
      distractors: ({ area, coveragePerUnit }, result, rng) => [
        `${Math.max(1, result.value - 2)} extinguishers`,
        `${result.value + 3} extinguishers`,
        `${Math.max(1, Math.round(near(result.value, 0.3, rng)))} extinguishers`,
      ],
    },
  },
  {
    name: "jockey-pump-capacity",
    weight: 3,
    spec: {
      discipline: D, topic: "Fire Water Supply & Pumps", subtopic: "Jockey Pump Sizing", tags: ["calculation"], difficulty: "Intermediate",
      gen: (rng) => ({ mainPumpFlow: pick(rng, [1620, 2280, 2850, 4100, 4550]), pct: randFloat(rng, 0.01, 0.03, 3) }),
      compute: ({ mainPumpFlow, pct }) => ({ formatted: num(mainPumpFlow * pct, "lpm", 1), value: mainPumpFlow * pct }),
      question: ({ mainPumpFlow, pct }) =>
        `A main fire pump is rated for ${mainPumpFlow} lpm. If the jockey pump is sized at approximately ${(pct * 100).toFixed(1)}% of the main pump's rated flow to compensate for system leakage, what is the approximate jockey pump capacity?`,
      explanation: ({ mainPumpFlow, pct }, formatted) =>
        `Jockey pump capacity = Main pump flow x leakage compensation percentage = ${mainPumpFlow} x ${(pct * 100).toFixed(1)}% = approximately ${formatted}.`,
      distractors: ({ mainPumpFlow, pct }, result, rng) => [
        num(mainPumpFlow * pct * 5, "lpm", 1),
        num(result.value * 3, "lpm", 1),
        num(near(result.value, 0.3, rng), "lpm", 1),
      ],
    },
  },
  {
    name: "foam-concentrate-quantity",
    weight: 4,
    spec: {
      discipline: D, topic: "Special Suppression Systems", subtopic: "Foam Quantity", tags: ["calculation"], difficulty: "Advanced",
      gen: (rng) => ({
        tankArea: randInt(rng, 20, 300),
        applicationRate: randFloat(rng, 4, 10, 1),
        concentration: pick(rng, [3, 6]),
        durationMin: pick(rng, [10, 15, 20]),
      }),
      compute: ({ tankArea, applicationRate, concentration, durationMin }) => {
        const solutionRate = tankArea * applicationRate; // lpm of foam solution
        const concentrateLpm = solutionRate * (concentration / 100);
        const totalConcentrate = concentrateLpm * durationMin;
        return { formatted: num(totalConcentrate, "litres", 0), value: totalConcentrate };
      },
      question: ({ tankArea, applicationRate, concentration, durationMin }) =>
        `A foam system protects a storage tank of surface area ${tankArea} sq.m at an application rate of ${applicationRate} lpm/sq.m, using ${concentration}% foam concentrate, for a discharge duration of ${durationMin} minutes. What is the approximate total foam concentrate quantity required?`,
      explanation: ({ tankArea, applicationRate, concentration, durationMin }, formatted) =>
        `Foam solution flow = Area x Application rate. Concentrate flow = Solution flow x concentration%. Total concentrate = Concentrate flow x duration = ${tankArea} x ${applicationRate} x ${concentration}% x ${durationMin} = approximately ${formatted}.`,
      distractors: ({ tankArea, applicationRate, concentration, durationMin }, result, rng) => [
        num(result.value * 2, "litres", 0),
        num(result.value / 2, "litres", 0),
        num(near(result.value, 0.3, rng), "litres", 0),
      ],
    },
  },
  {
    name: "fire-pump-shaft-power",
    weight: 5,
    spec: {
      discipline: D, topic: "Hydraulic Calculations & Pump Sizing", subtopic: "Fire Pump Power", tags: ["calculation"], difficulty: "Advanced",
      gen: (rng) => ({ flowLps: randInt(rng, 15, 90), head: randInt(rng, 60, 130), eff: randFloat(rng, 0.6, 0.75, 2) }),
      compute: ({ flowLps, head, eff }) => {
        const kw = (flowLps * head * 9.81) / (1000 * eff);
        return { formatted: num(kw, "kW", 1), value: kw };
      },
      question: ({ flowLps, head, eff }) =>
        `A fire pump delivers ${flowLps} l/s against a total head of ${head} m, with a pump efficiency of ${eff}. What is the approximate shaft power required to drive the pump?`,
      explanation: ({ flowLps, head, eff }, formatted) =>
        `Power (kW) = (Flow(l/s) x Head(m) x 9.81) / (1000 x efficiency) = (${flowLps} x ${head} x 9.81) / (1000 x ${eff}) = approximately ${formatted}.`,
      distractors: ({ flowLps, head, eff }, result, rng) => [
        num(result.value * 1.7, "kW", 1),
        num(result.value / 2, "kW", 1),
        num(near(result.value, 0.3, rng), "kW", 1),
      ],
    },
  },
  {
    name: "hydrant-spacing-count",
    weight: 4,
    spec: {
      discipline: D, topic: "Hydrant Systems", subtopic: "Hydrant Spacing", tags: ["calculation"], difficulty: "Intermediate",
      gen: (rng) => ({ perimeter: randInt(rng, 150, 1200), spacing: pick(rng, [45, 60, 90]) }),
      compute: ({ perimeter, spacing }) => ({ formatted: `${Math.ceil(perimeter / spacing)} hydrants`, value: Math.ceil(perimeter / spacing) }),
      question: ({ perimeter, spacing }) =>
        `A building has an access road perimeter of ${perimeter} m requiring external hydrant protection. If external hydrants must be spaced no more than ${spacing} m apart, what is the minimum number of external hydrants required around the perimeter?`,
      explanation: ({ perimeter, spacing }, formatted) =>
        `Minimum hydrants = Perimeter / Maximum spacing, rounded up = ${perimeter} / ${spacing} rounded up to ${formatted}.`,
      distractors: ({ perimeter, spacing }, result, rng) => [
        `${Math.max(1, result.value - 2)} hydrants`,
        `${result.value + 3} hydrants`,
        `${Math.max(1, Math.round(near(result.value, 0.3, rng)))} hydrants`,
      ],
    },
  },
  {
    name: "sprinkler-head-count",
    weight: 5,
    spec: {
      discipline: D, topic: "Sprinkler Systems", subtopic: "Sprinkler Head Count", tags: ["calculation"], difficulty: "Intermediate",
      gen: (rng) => ({ area: randInt(rng, 100, 3000), coveragePerHead: pick(rng, [9, 12, 16, 20]) }),
      compute: ({ area, coveragePerHead }) => ({ formatted: `${Math.ceil(area / coveragePerHead)} heads`, value: Math.ceil(area / coveragePerHead) }),
      question: ({ area, coveragePerHead }) =>
        `A floor area of ${area} sq.m is to be protected by sprinklers, with each sprinkler head covering a maximum of ${coveragePerHead} sq.m per the hazard classification. What is the minimum number of sprinkler heads required?`,
      explanation: ({ area, coveragePerHead }, formatted) =>
        `Minimum heads = Area / Maximum coverage per head, rounded up = ${area} / ${coveragePerHead} rounded up to ${formatted}.`,
      distractors: ({ area, coveragePerHead }, result, rng) => [
        `${Math.max(1, Math.round(result.value / 2))} heads`,
        `${Math.round(result.value * 1.6)} heads`,
        `${Math.max(1, Math.round(near(result.value, 0.25, rng)))} heads`,
      ],
    },
  },
  {
    name: "fire-fighting-boq-cost",
    weight: 5,
    spec: {
      discipline: D, topic: "Fire Fighting BOQ & Estimation", subtopic: "Rate Analysis", tags: ["calculation", "estimation"], difficulty: "Basic",
      gen: (rng) => ({ qty: randInt(rng, 20, 800), rate: randInt(rng, 350, 4500), unit: pick(rng, ["m", "nos", "kg"]) }),
      compute: ({ qty, rate }) => ({ formatted: `Rs ${(qty * rate).toLocaleString("en-IN")}`, value: qty * rate }),
      question: ({ qty, rate, unit }) =>
        `A fire fighting BOQ item has a measured quantity of ${qty} ${unit} at a finalized rate of Rs ${rate} per ${unit}. What is the total cost for this BOQ item?`,
      explanation: ({ qty, rate }, formatted) => `Total cost = Quantity x Rate = ${qty} x ${rate} = ${formatted}.`,
      distractors: ({ qty, rate }, result, rng) => [
        `Rs ${Math.round(result.value / 2).toLocaleString("en-IN")}`,
        `Rs ${Math.round(result.value * 1.5).toLocaleString("en-IN")}`,
        `Rs ${Math.round(near(result.value, 0.25, rng)).toLocaleString("en-IN")}`,
      ],
    },
  },
  {
    name: "co2-quantity-for-room",
    weight: 3,
    spec: {
      discipline: D, topic: "Special Suppression Systems", subtopic: "CO2 System Sizing", tags: ["calculation"], difficulty: "Advanced",
      gen: (rng) => ({ volume: randInt(rng, 30, 1200), designFactor: randFloat(rng, 0.65, 0.9, 2) }),
      compute: ({ volume, designFactor }) => ({ formatted: num(volume * designFactor, "kg", 1), value: volume * designFactor }),
      question: ({ volume, designFactor }) =>
        `A protected electrical room has a net volume of ${volume} cu.m. Using a simplified CO2 design factor of ${designFactor} kg per cu.m to achieve the required flooding concentration, what is the approximate quantity of CO2 required?`,
      explanation: ({ volume, designFactor }, formatted) =>
        `Approximate CO2 quantity = Room volume x design factor = ${volume} x ${designFactor} = approximately ${formatted}.`,
      distractors: ({ volume, designFactor }, result, rng) => [
        num(result.value * 2, "kg", 1),
        num(result.value / 2, "kg", 1),
        num(near(result.value, 0.3, rng), "kg", 1),
      ],
    },
  },
  {
    name: "diesel-pump-fuel-consumption",
    weight: 3,
    spec: {
      discipline: D, topic: "Fire Water Supply & Pumps", subtopic: "Diesel Pump Fuel", tags: ["calculation"], difficulty: "Intermediate",
      gen: (rng) => ({ power: randInt(rng, 30, 300), specificConsumption: randFloat(rng, 0.2, 0.28, 2), hours: randInt(rng, 1, 6) }),
      compute: ({ power, specificConsumption, hours }) => ({
        formatted: num(power * specificConsumption * hours, "litres", 1),
        value: power * specificConsumption * hours,
      }),
      question: ({ power, specificConsumption, hours }) =>
        `A diesel fire pump engine develops ${power} kW and has a specific fuel consumption of ${specificConsumption} litres per kWh. What is the approximate fuel consumption for ${hours} hour(s) of continuous running?`,
      explanation: ({ power, specificConsumption, hours }, formatted) =>
        `Fuel consumed = Power x Specific fuel consumption x Running hours = ${power} x ${specificConsumption} x ${hours} = approximately ${formatted}.`,
      distractors: ({ power, specificConsumption, hours }, result, rng) => [
        num(result.value * 2, "litres", 1),
        num(result.value / 2, "litres", 1),
        num(near(result.value, 0.3, rng), "litres", 1),
      ],
    },
  },
];

export { CALC_TEMPLATES };

export function generateFire() {
  const conceptual = roundRobinTrim(buildFromFactBank(FACTS, D), CONCEPTUAL_TARGET, (q) => q.topic);
  const calcTarget = TARGET - conceptual.length;
  const calc = buildCalcSet(CALC_TEMPLATES, calcTarget, "fire");
  return [...conceptual, ...calc].slice(0, TARGET);
}
