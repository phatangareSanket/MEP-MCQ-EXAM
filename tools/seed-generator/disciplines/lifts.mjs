import { randInt, randFloat, pick } from "../lib/rng.mjs";
import { buildFromFactBank, buildCalcSet, roundRobinTrim } from "../lib/engine.mjs";

const D = "Lifts";
const TARGET = 150;
const CONCEPTUAL_TARGET = 90;

const FACTS = [
  // Lift Fundamentals & Types
  { term: "Traction Lift", topic: "Lift Fundamentals & Types", difficulty: "Basic", tags: ["lift-types"],
    definition: "A lift that moves via steel ropes running over a motor-driven sheave, using traction (friction) between rope and sheave groove.",
    function: "To vertically transport passengers or goods using an efficient, widely used rope-and-sheave lifting mechanism.",
    fact: "Traction lifts are the most common lift type used in mid-rise and high-rise buildings due to their efficiency and speed range." },
  { term: "Hydraulic Lift", topic: "Lift Fundamentals & Types", difficulty: "Basic", tags: ["lift-types"],
    definition: "A lift that is raised and lowered by a hydraulic piston powered by an electric pump, typically used for lower-rise applications.",
    function: "To provide vertical transportation for low-rise buildings where a traction lift machine room is not justified.",
    fact: "Hydraulic lifts are typically limited to lower travel heights and speeds compared to traction lifts." },
  { term: "Machine Room-Less (MRL) Lift", topic: "Lift Fundamentals & Types", difficulty: "Intermediate", tags: ["lift-types"],
    definition: "A traction lift design where the drive machine is located within the lift shaft rather than in a separate machine room.",
    function: "To save building space by eliminating the need for a dedicated machine room above or beside the lift shaft.",
    fact: "MRL lifts have become increasingly popular in mid-rise buildings due to their space-saving design." },
  { term: "Passenger Lift", topic: "Lift Fundamentals & Types", difficulty: "Basic", tags: ["lift-types"],
    definition: "A lift primarily designed and certified for the safe transportation of building occupants.",
    function: "To provide safe, code-compliant vertical transportation for people within a building.",
    fact: "Passenger lifts are subject to stricter safety and comfort requirements than goods-only lifts." },
  { term: "Goods/Freight Lift", topic: "Lift Fundamentals & Types", difficulty: "Basic", tags: ["lift-types"],
    definition: "A lift primarily designed for transporting goods, materials, or equipment, sometimes with reduced passenger provisions.",
    function: "To provide vertical transportation for goods and materials, often with a larger car size and higher load capacity than passenger lifts.",
    fact: "Goods lifts are typically designed for higher load capacities but may have lower travel speeds than passenger lifts." },
  { term: "Lift Car", topic: "Lift Fundamentals & Types", difficulty: "Basic", tags: ["lift-types"],
    definition: "The enclosed cabin of a lift that carries passengers or goods between floors.",
    function: "To provide a safe, enclosed space for passengers or goods during vertical transportation.",
    fact: "Lift car size and capacity are typically selected based on expected passenger traffic or goods handling requirements." },
  { term: "Counterweight", topic: "Lift Fundamentals & Types", difficulty: "Intermediate", tags: ["lift-types"],
    definition: "A weight connected to the lift car via ropes, balancing the car's weight to reduce the motor power required for operation.",
    function: "To reduce the net load the lift machine must lift, improving energy efficiency and reducing motor size.",
    fact: "Counterweights are typically sized to balance the car weight plus approximately 40-50% of its rated load." },

  // Traction & Machine Room Systems
  { term: "Gearless Traction Machine", topic: "Traction & Machine Room Systems", difficulty: "Intermediate", tags: ["traction"],
    definition: "A lift drive machine where the motor directly drives the sheave without a reduction gearbox, commonly used for higher-speed lifts.",
    function: "To provide smooth, efficient, and quiet operation, particularly suited to higher speed and higher rise lift applications.",
    fact: "Gearless traction machines are commonly used in high-speed, high-rise lift installations due to their efficiency and low maintenance." },
  { term: "Geared Traction Machine", topic: "Traction & Machine Room Systems", difficulty: "Intermediate", tags: ["traction"],
    definition: "A lift drive machine that uses a gearbox to reduce motor speed before driving the sheave, commonly used for lower and medium-speed lifts.",
    function: "To provide a cost-effective drive solution for lower and medium-speed lift applications.",
    fact: "Geared traction machines are generally used for lower-speed lift applications compared to gearless machines." },
  { term: "Sheave", topic: "Traction & Machine Room Systems", difficulty: "Basic", tags: ["traction"],
    definition: "A grooved pulley wheel over which lift ropes pass, driven by the lift machine to raise and lower the car.",
    function: "To transmit the driving force from the lift machine to the suspension ropes via friction (traction).",
    fact: "The grooves on a traction sheave are designed to provide sufficient friction to prevent rope slippage under normal loads." },
  { term: "Governor (Lift)", topic: "Traction & Machine Room Systems", difficulty: "Advanced", tags: ["traction", "safety"],
    definition: "A safety device that monitors car speed and triggers the safety gear if the car exceeds a preset overspeed limit.",
    function: "To detect dangerous overspeed conditions and activate the car's mechanical safety gear to stop the car.",
    fact: "Lift governors are typically tested periodically to confirm they trip at the correct overspeed setting." },
  { term: "Lift Buffer", topic: "Traction & Machine Room Systems", difficulty: "Intermediate", tags: ["traction", "safety"],
    definition: "A shock-absorbing device installed at the bottom of a lift shaft to safely stop the car or counterweight in case of an overtravel.",
    function: "To absorb impact energy and limit deceleration forces if a car or counterweight travels beyond its normal lowest position.",
    fact: "Lift buffers can be spring type or oil (hydraulic) type, depending on the lift's rated speed." },
  { term: "Lift Guide Rails", topic: "Traction & Machine Room Systems", difficulty: "Basic", tags: ["traction"],
    definition: "Vertical rails fixed within the lift shaft that guide the car and counterweight along their travel path.",
    function: "To maintain accurate alignment of the car and counterweight throughout their travel and support safety gear operation.",
    fact: "Guide rails also provide the reaction surface against which the car's safety gear grips during an emergency stop." },

  // Lift Safety Systems
  { term: "Safety Gear (Lift)", topic: "Lift Safety Systems", difficulty: "Advanced", tags: ["lift-safety"],
    definition: "A mechanical device attached to the lift car that grips the guide rails to stop the car if an overspeed condition is detected.",
    function: "To provide a mechanical fail-safe stop for the lift car in the event of rope failure or overspeed.",
    fact: "Safety gear is activated by the governor rope when car speed exceeds a preset overspeed threshold." },
  { term: "Door Interlock (Lift)", topic: "Lift Safety Systems", difficulty: "Basic", tags: ["lift-safety"],
    definition: "A safety device that prevents lift movement unless all landing and car doors are fully closed and locked.",
    function: "To prevent the lift from moving with an open door, protecting passengers from falling into the shaft.",
    fact: "Door interlocks are among the most critical safety devices in a lift installation, directly preventing shaft falls." },
  { term: "Final Limit Switch", topic: "Lift Safety Systems", difficulty: "Intermediate", tags: ["lift-safety"],
    definition: "A safety switch that cuts power to the lift machine if the car travels beyond its normal top or bottom limit.",
    function: "To provide a backup safety stop if the normal floor-leveling and limit controls fail to stop the car appropriately.",
    fact: "Final limit switches are intended as a last-resort safety measure, separate from normal operational limit switches." },
  { term: "Lift Alarm Button", topic: "Lift Safety Systems", difficulty: "Basic", tags: ["lift-safety"],
    definition: "An emergency button within the lift car that alerts building staff or a remote monitoring service if a passenger is trapped.",
    function: "To allow trapped passengers to summon assistance during a lift malfunction or power failure.",
    fact: "Lift alarm systems are increasingly connected to remote monitoring services for faster emergency response." },
  { term: "Automatic Rescue Device (ARD)", topic: "Lift Safety Systems", difficulty: "Intermediate", tags: ["lift-safety"],
    definition: "A device that automatically moves a stalled lift car to the nearest floor and opens its doors during a power failure.",
    function: "To prevent passengers from being trapped in a lift car during a power outage by automatically returning it to a floor.",
    fact: "ARDs typically use a battery backup to move the car to the nearest floor before doors are opened automatically." },
  { term: "Fireman's Lift", topic: "Lift Safety Systems", difficulty: "Advanced", tags: ["lift-safety"],
    definition: "A designated lift and control switch allowing fire fighters to take manual control of a lift during a fire emergency.",
    function: "To provide fire fighters with a controlled, prioritized lift for fire fighting and rescue operations during a fire.",
    fact: "Fireman's lifts typically have additional protection, such as fire-rated shaft construction and water protection, per applicable codes." },

  // Lift Electrical & Control Systems
  { term: "Lift Controller", topic: "Lift Electrical & Control Systems", difficulty: "Intermediate", tags: ["lift-control"],
    definition: "An electronic control panel that manages lift car movement, door operation, and floor calls based on programmed logic.",
    function: "To coordinate all lift operations, including call registration, car dispatch, and safety interlocks.",
    fact: "Modern lift controllers are typically microprocessor-based, replacing older relay-based control systems." },
  { term: "VVVF Drive (Lift)", topic: "Lift Electrical & Control Systems", difficulty: "Intermediate", tags: ["lift-control"],
    definition: "A Variable Voltage Variable Frequency drive used to control lift motor speed, providing smooth acceleration and deceleration.",
    function: "To provide smooth, energy-efficient, and precise speed control of the lift motor throughout its travel.",
    fact: "VVVF drives have largely replaced older AC two-speed and DC drive systems in modern lift installations." },
  { term: "Landing Call Button", topic: "Lift Electrical & Control Systems", difficulty: "Basic", tags: ["lift-control"],
    definition: "A button at each floor landing that allows a waiting passenger to summon the lift.",
    function: "To allow passengers to request lift service from a specific floor landing.",
    fact: "Landing call buttons are typically provided for both up and down directions at intermediate floors." },
  { term: "Destination Control System", topic: "Lift Electrical & Control Systems", difficulty: "Advanced", tags: ["lift-control"],
    definition: "A lift dispatch system where passengers select their destination floor before boarding, allowing optimized car assignment.",
    function: "To improve traffic handling efficiency by grouping passengers with similar destinations into the same car.",
    fact: "Destination control systems are commonly used in high-traffic buildings to reduce overall passenger waiting and travel time." },
  { term: "Group Control System (Lifts)", topic: "Lift Electrical & Control Systems", difficulty: "Advanced", tags: ["lift-control"],
    definition: "A control system that coordinates multiple lifts serving the same floors to optimize response time and traffic handling.",
    function: "To ensure multiple lifts operate efficiently together rather than independently, reducing overall passenger wait times.",
    fact: "Group control systems typically assign the nearest suitable available car to each new landing call." },

  // Lift Selection & Traffic Analysis
  { term: "Lift Traffic Analysis", topic: "Lift Selection & Traffic Analysis", difficulty: "Advanced", tags: ["traffic-analysis"],
    definition: "A study of a building's expected passenger flow patterns used to determine the required number, capacity, and speed of lifts.",
    function: "To ensure the lift system provides adequate service quality, such as acceptable waiting times, during peak traffic periods.",
    fact: "Lift traffic analysis commonly considers up-peak, down-peak, and lunchtime two-way traffic patterns in office buildings." },
  { term: "Handling Capacity (Lift)", topic: "Lift Selection & Traffic Analysis", difficulty: "Advanced", tags: ["traffic-analysis"],
    definition: "The percentage of a building's population that a lift system can transport within a specified period, typically five minutes during peak traffic.",
    function: "To provide a key performance metric used to evaluate whether a proposed lift system is adequately sized for a building's population.",
    fact: "Handling capacity is one of the primary criteria, along with waiting time, used in lift system sizing." },
  { term: "Interval (Lift Traffic)", topic: "Lift Selection & Traffic Analysis", difficulty: "Intermediate", tags: ["traffic-analysis"],
    definition: "The average time between successive lift car arrivals at the main entrance floor during peak traffic conditions.",
    function: "To provide a key performance metric indicating expected passenger waiting time for lift service.",
    fact: "A shorter interval generally indicates better lift service quality, though very short intervals can require more lifts than economically justified." },
  { term: "Rated Speed (Lift)", topic: "Lift Selection & Traffic Analysis", difficulty: "Basic", tags: ["traffic-analysis"],
    definition: "The maximum design speed at which a lift car travels, typically expressed in metres per second.",
    function: "To match a lift's travel speed to the building height and traffic demand, balancing speed against comfort and cost.",
    fact: "Higher-rise buildings generally require higher rated lift speeds to keep travel times and waiting times acceptable." },
  { term: "Rated Load (Lift)", topic: "Lift Selection & Traffic Analysis", difficulty: "Basic", tags: ["traffic-analysis"],
    definition: "The maximum load, typically expressed in kg or number of passengers, that a lift is designed and certified to carry safely.",
    function: "To define the safe carrying capacity of a lift car for both structural and traffic-handling purposes.",
    fact: "Lift rated load is typically converted to an equivalent passenger count using a standard average passenger weight assumption." },

  // Lift Codes & Commissioning
  { term: "Lift Code of Practice", topic: "Lift Codes & Commissioning", difficulty: "Basic", tags: ["lift-codes"],
    definition: "A code of practice specifying design, installation, and safety requirements for lifts, escalators, and related equipment.",
    function: "To ensure lifts are designed, installed, and maintained to a consistent minimum safety and performance standard.",
    fact: "Lift codes of practice typically address aspects such as shaft dimensions, safety devices, and periodic inspection requirements." },
  { term: "Lift Shaft (Hoistway)", topic: "Lift Codes & Commissioning", difficulty: "Basic", tags: ["lift-codes"],
    definition: "The vertical enclosed space within which a lift car and counterweight travel.",
    function: "To provide a protected, dimensionally accurate space for safe lift car and counterweight travel.",
    fact: "Lift shafts are typically required to be fire-rated to prevent fire and smoke spread between floors." },
  { term: "Lift Machine Room", topic: "Lift Codes & Commissioning", difficulty: "Basic", tags: ["lift-codes"],
    definition: "A room, typically located above or beside the lift shaft, housing the lift drive machine and controller for traditional traction lifts.",
    function: "To house and protect the lift machine and control equipment, providing safe access for maintenance.",
    fact: "Machine room-less lift designs eliminate the need for this dedicated room by relocating equipment into the shaft or a compact cabinet." },
  { term: "Periodic Lift Inspection", topic: "Lift Codes & Commissioning", difficulty: "Intermediate", tags: ["lift-codes"],
    definition: "Scheduled statutory or maintenance inspections verifying continued safe operation of an installed lift.",
    function: "To ensure lifts remain safe to use throughout their service life, identifying wear or faults before they cause failures.",
    fact: "Periodic lift inspection typically includes testing of safety devices such as governors, safety gear, and door interlocks." },
  { term: "Lift Commissioning", topic: "Lift Codes & Commissioning", difficulty: "Intermediate", tags: ["lift-codes"],
    definition: "The process of testing and verifying a newly installed lift meets design, safety, and code requirements before handover for use.",
    function: "To confirm a newly installed lift operates safely and correctly before it is put into passenger or goods service.",
    fact: "Lift commissioning typically includes load testing, safety device testing, and verification of ride comfort parameters." },
];

const num = (n, unit, decimals = 2) => `${Number(n.toFixed(decimals)).toLocaleString("en-IN")} ${unit}`;
const near = (v, pct, rng) => v * (1 + (rng() * 2 - 1) * pct);

const CALC_TEMPLATES = [
  {
    name: "lift-speed-from-travel-time",
    weight: 6,
    spec: {
      discipline: D, topic: "Lift Selection & Traffic Analysis", subtopic: "Rated Speed", tags: ["calculation"], difficulty: "Basic",
      gen: (rng) => ({ height: randInt(rng, 15, 200), timeSec: randFloat(rng, 10, 60, 1) }),
      compute: ({ height, timeSec }) => ({ formatted: num(height / timeSec, "m/s", 2), value: height / timeSec }),
      question: ({ height, timeSec }) =>
        `A lift travels a total height of ${height} m in ${timeSec} seconds at its rated speed (ignoring acceleration/deceleration effects). What is the approximate rated speed of the lift?`,
      explanation: ({ height, timeSec }, formatted) => `Rated speed = Height / Time = ${height} / ${timeSec} = approximately ${formatted}.`,
      distractors: ({ height, timeSec }, result, rng) => [
        num(result.value * 2, "m/s", 2),
        num(result.value / 2, "m/s", 2),
        num(near(result.value, 0.3, rng), "m/s", 2),
      ],
    },
  },
  {
    name: "counterweight-sizing",
    weight: 6,
    spec: {
      discipline: D, topic: "Lift Fundamentals & Types", subtopic: "Counterweight Sizing", tags: ["calculation"], difficulty: "Intermediate",
      gen: (rng) => ({ carWeight: randInt(rng, 800, 2500), ratedLoad: pick(rng, [408, 544, 680, 816, 1000, 1275, 1600]), balanceFactor: pick(rng, [0.4, 0.45, 0.5]) }),
      compute: ({ carWeight, ratedLoad, balanceFactor }) => ({
        formatted: num(carWeight + ratedLoad * balanceFactor, "kg", 0),
        value: carWeight + ratedLoad * balanceFactor,
      }),
      question: ({ carWeight, ratedLoad, balanceFactor }) =>
        `A lift car weighs ${carWeight} kg and has a rated load of ${ratedLoad} kg. Using a standard counterweight balance factor of ${balanceFactor}, what is the approximate counterweight mass required?`,
      explanation: ({ carWeight, ratedLoad, balanceFactor }, formatted) =>
        `Counterweight = Car weight + (Balance factor x Rated load) = ${carWeight} + (${balanceFactor} x ${ratedLoad}) = approximately ${formatted}.`,
      distractors: ({ carWeight, ratedLoad, balanceFactor }, result, rng) => [
        num(carWeight + ratedLoad, "kg", 0),
        num(result.value * 1.4, "kg", 0),
        num(near(result.value, 0.2, rng), "kg", 0),
      ],
    },
  },
  {
    name: "lift-motor-power",
    weight: 6,
    spec: {
      discipline: D, topic: "Traction & Machine Room Systems", subtopic: "Lift Motor Power", tags: ["calculation"], difficulty: "Advanced",
      gen: (rng) => ({
        ratedLoad: pick(rng, [408, 544, 680, 816, 1000, 1275]),
        balanceFactor: pick(rng, [0.4, 0.45, 0.5]),
        speed: randFloat(rng, 0.75, 2.5, 2),
        eff: randFloat(rng, 0.65, 0.8, 2),
      }),
      compute: ({ ratedLoad, balanceFactor, speed, eff }) => {
        const netLoad = ratedLoad * (1 - balanceFactor);
        const kw = (netLoad * 9.81 * speed) / (1000 * eff);
        return { formatted: num(kw, "kW", 2), value: kw };
      },
      question: ({ ratedLoad, balanceFactor, speed, eff }) =>
        `A traction lift has a rated load of ${ratedLoad} kg, a counterweight balance factor of ${balanceFactor}, and travels at a rated speed of ${speed} m/s. Assuming a drive efficiency of ${eff}, what is the approximate motor power required?`,
      explanation: ({ ratedLoad, balanceFactor, speed, eff }, formatted) =>
        `Net unbalanced load = Rated load x (1 - Balance factor). Motor power (kW) = (Net load x 9.81 x Speed) / (1000 x Efficiency) = approximately ${formatted}.`,
      distractors: ({ ratedLoad, balanceFactor, speed, eff }, result, rng) => [
        num((ratedLoad * 9.81 * speed) / (1000 * eff), "kW", 2),
        num(result.value * 1.6, "kW", 2),
        num(near(result.value, 0.25, rng), "kW", 2),
      ],
    },
  },
  {
    name: "handling-capacity",
    weight: 6,
    spec: {
      discipline: D, topic: "Lift Selection & Traffic Analysis", subtopic: "Handling Capacity", tags: ["calculation"], difficulty: "Advanced",
      gen: (rng) => ({
        numLifts: randInt(rng, 2, 8),
        carCapacityPersons: pick(rng, [8, 10, 13, 16, 20]),
        roundTripTimeSec: randInt(rng, 90, 220),
        population: randInt(rng, 300, 3000),
      }),
      compute: ({ numLifts, carCapacityPersons, roundTripTimeSec, population }) => {
        const tripsPer5Min = (5 * 60) / roundTripTimeSec;
        const passengersPer5Min = numLifts * carCapacityPersons * 0.8 * tripsPer5Min;
        const pct = (passengersPer5Min / population) * 100;
        return { formatted: `${pct.toFixed(1)}%`, value: pct };
      },
      question: ({ numLifts, carCapacityPersons, roundTripTimeSec, population }) =>
        `A building with a population of ${population} persons is served by ${numLifts} lifts, each with a capacity of ${carCapacityPersons} persons, an average round trip time of ${roundTripTimeSec} seconds, and an assumed 80% average car loading. What is the approximate five-minute handling capacity as a percentage of building population?`,
      explanation: ({ numLifts, carCapacityPersons, roundTripTimeSec, population }, formatted) =>
        `Trips in 5 min = 300 / round trip time. Passengers moved = Lifts x Capacity x 0.8 x Trips. Handling capacity % = (Passengers moved / Population) x 100 = approximately ${formatted}.`,
      distractors: ({ numLifts, carCapacityPersons, roundTripTimeSec, population }, result, rng) => [
        `${(result.value * 2).toFixed(1)}%`,
        `${(result.value / 2).toFixed(1)}%`,
        `${Math.max(1, near(result.value, 0.3, rng)).toFixed(1)}%`,
      ],
    },
  },
  {
    name: "lift-interval",
    weight: 5,
    spec: {
      discipline: D, topic: "Lift Selection & Traffic Analysis", subtopic: "Interval", tags: ["calculation"], difficulty: "Intermediate",
      gen: (rng) => ({ roundTripTimeSec: randInt(rng, 90, 240), numLifts: randInt(rng, 2, 8) }),
      compute: ({ roundTripTimeSec, numLifts }) => ({ formatted: num(roundTripTimeSec / numLifts, "seconds", 1), value: roundTripTimeSec / numLifts }),
      question: ({ roundTripTimeSec, numLifts }) =>
        `A group of ${numLifts} lifts has an average round trip time of ${roundTripTimeSec} seconds. What is the approximate interval (average time between successive car arrivals) at the main floor?`,
      explanation: ({ roundTripTimeSec, numLifts }, formatted) =>
        `Interval = Round trip time / Number of lifts = ${roundTripTimeSec} / ${numLifts} = approximately ${formatted}.`,
      distractors: ({ roundTripTimeSec, numLifts }, result, rng) => [
        num(roundTripTimeSec * numLifts, "seconds", 1),
        num(result.value * 2, "seconds", 1),
        num(near(result.value, 0.3, rng), "seconds", 1),
      ],
    },
  },
  {
    name: "number-of-lifts-estimate",
    weight: 5,
    spec: {
      discipline: D, topic: "Lift Selection & Traffic Analysis", subtopic: "Preliminary Lift Count", tags: ["calculation"], difficulty: "Intermediate",
      gen: (rng) => ({ floors: randInt(rng, 6, 40), unitsPerFloor: randInt(rng, 2, 12), personsPerUnit: pick(rng, [3, 4, 5]), personsPerLift: pick(rng, [100, 130, 150]) }),
      compute: ({ floors, unitsPerFloor, personsPerUnit, personsPerLift }) => {
        const population = floors * unitsPerFloor * personsPerUnit;
        return { formatted: `${Math.max(1, Math.ceil(population / personsPerLift))} lifts`, value: Math.max(1, Math.ceil(population / personsPerLift)) };
      },
      question: ({ floors, unitsPerFloor, personsPerUnit, personsPerLift }) =>
        `A residential tower has ${floors} floors with ${unitsPerFloor} units per floor and an assumed occupancy of ${personsPerUnit} persons per unit. Using a preliminary planning guideline of one lift per ${personsPerLift} occupants, what is the approximate minimum number of lifts required?`,
      explanation: ({ floors, unitsPerFloor, personsPerUnit, personsPerLift }, formatted) =>
        `Estimated population = Floors x Units per floor x Persons per unit. Lifts required = Population / Persons per lift, rounded up = approximately ${formatted}.`,
      distractors: ({ floors, unitsPerFloor, personsPerUnit, personsPerLift }, result, rng) => [
        `${Math.max(1, result.value - 1)} lifts`,
        `${result.value + 2} lifts`,
        `${Math.max(1, Math.round(near(result.value, 0.3, rng)))} lifts`,
      ],
    },
  },
  {
    name: "lift-energy-consumption",
    weight: 4,
    spec: {
      discipline: D, topic: "Lift Electrical & Control Systems", subtopic: "Energy Consumption", tags: ["calculation", "estimation"], difficulty: "Intermediate",
      gen: (rng) => ({ avgPowerKw: randFloat(rng, 2, 15, 1), runHoursPerDay: randFloat(rng, 2, 10, 1), rate: randFloat(rng, 6, 11, 1) }),
      compute: ({ avgPowerKw, runHoursPerDay, rate }) => ({
        formatted: `Rs ${Math.round(avgPowerKw * runHoursPerDay * rate * 30).toLocaleString("en-IN")} / month`,
        value: avgPowerKw * runHoursPerDay * rate * 30,
      }),
      question: ({ avgPowerKw, runHoursPerDay, rate }) =>
        `A lift draws an average running power of ${avgPowerKw} kW and operates for approximately ${runHoursPerDay} hours per day (cumulative running time). At an electricity tariff of Rs ${rate} per kWh, what is the approximate monthly (30-day) energy cost of the lift?`,
      explanation: ({ avgPowerKw, runHoursPerDay, rate }, formatted) =>
        `Monthly cost = Average power x Running hours per day x Tariff x 30 = ${avgPowerKw} x ${runHoursPerDay} x ${rate} x 30 = approximately ${formatted}.`,
      distractors: ({ avgPowerKw, runHoursPerDay, rate }, result, rng) => [
        `Rs ${Math.round(result.value / 2).toLocaleString("en-IN")} / month`,
        `Rs ${Math.round(result.value * 1.6).toLocaleString("en-IN")} / month`,
        `Rs ${Math.round(near(result.value, 0.25, rng)).toLocaleString("en-IN")} / month`,
      ],
    },
  },
];

export function generateLifts() {
  const conceptual = roundRobinTrim(buildFromFactBank(FACTS, D), CONCEPTUAL_TARGET, (q) => q.topic);
  const calcTarget = TARGET - conceptual.length;
  const calc = buildCalcSet(CALC_TEMPLATES, calcTarget, "lifts");
  return [...conceptual, ...calc].slice(0, TARGET);
}
