import { randInt, randFloat, pick } from "../lib/rng.mjs";
import { buildFromFactBank, buildCalcSet, roundRobinTrim } from "../lib/engine.mjs";

const D = "Solar";
const TARGET = 150;
const CONCEPTUAL_TARGET = 70;

const FACTS = [
  // Solar PV Fundamentals
  { term: "Photovoltaic (PV) Effect", topic: "Solar PV Fundamentals", difficulty: "Basic", tags: ["pv-fundamentals"],
    definition: "The physical phenomenon where certain semiconductor materials generate electric current when exposed to sunlight.",
    function: "To provide the fundamental principle by which solar panels convert sunlight directly into electricity.",
    fact: "The photovoltaic effect was first observed in the 19th century but only became practically significant with the development of semiconductor technology." },
  { term: "Solar Irradiance", topic: "Solar PV Fundamentals", difficulty: "Basic", tags: ["pv-fundamentals"],
    definition: "The power of solar radiation received per unit area, typically measured in W/sq.m.",
    function: "To quantify the amount of sunlight available at a location and time, directly affecting solar PV output.",
    fact: "Solar irradiance varies with time of day, season, weather, and geographic location, directly affecting daily energy yield." },
  { term: "Peak Sun Hours", topic: "Solar PV Fundamentals", difficulty: "Intermediate", tags: ["pv-fundamentals"],
    definition: "The equivalent number of hours per day during which solar irradiance averages 1000 W/sq.m, used to estimate daily energy yield.",
    function: "To provide a simplified basis for estimating a solar PV system's expected daily energy generation for a given location.",
    fact: "Locations with higher average peak sun hours generally yield more energy from an identically sized solar PV system." },
  { term: "Solar Cell", topic: "Solar PV Fundamentals", difficulty: "Basic", tags: ["pv-fundamentals"],
    definition: "The basic semiconductor unit within a solar panel that converts sunlight directly into DC electricity.",
    function: "To generate DC electric current when exposed to sunlight, forming the fundamental building block of a solar panel.",
    fact: "Multiple solar cells are connected in series and parallel within a panel to achieve the desired voltage and current output." },
  { term: "Standard Test Conditions (STC)", topic: "Solar PV Fundamentals", difficulty: "Intermediate", tags: ["pv-fundamentals"],
    definition: "A standardized set of conditions, 1000 W/sq.m irradiance and 25 degrees C cell temperature, used to rate solar panel power output.",
    function: "To provide a consistent basis for comparing the rated power output of solar panels from different manufacturers.",
    fact: "Actual solar panel output in the field is typically lower than its STC rating due to real-world temperature and irradiance conditions." },

  // Solar Panel Types & Technology
  { term: "Monocrystalline Solar Panel", topic: "Solar Panel Types & Technology", difficulty: "Basic", tags: ["panel-types"],
    definition: "A solar panel made from single-crystal silicon cells, typically offering higher efficiency than polycrystalline panels.",
    function: "To convert sunlight to electricity with relatively higher efficiency, suitable for space-constrained installations.",
    fact: "Monocrystalline panels are generally more efficient but also more expensive per watt than polycrystalline panels." },
  { term: "Polycrystalline Solar Panel", topic: "Solar Panel Types & Technology", difficulty: "Basic", tags: ["panel-types"],
    definition: "A solar panel made from multiple silicon crystal fragments melted together, typically offering slightly lower efficiency at a lower cost.",
    function: "To provide a cost-effective solar panel option where available roof or ground area is not severely constrained.",
    fact: "Polycrystalline panels are generally less expensive but slightly less efficient than monocrystalline panels of the same physical size." },
  { term: "Thin-Film Solar Panel", topic: "Solar Panel Types & Technology", difficulty: "Intermediate", tags: ["panel-types"],
    definition: "A solar panel made by depositing thin layers of photovoltaic material on a substrate, generally lighter and more flexible than crystalline panels.",
    function: "To provide a lightweight, sometimes flexible solar option, often at lower efficiency than crystalline silicon panels.",
    fact: "Thin-film panels generally require more area per watt than crystalline panels due to their lower efficiency." },
  { term: "Panel Degradation Rate", topic: "Solar Panel Types & Technology", difficulty: "Intermediate", tags: ["panel-types"],
    definition: "The gradual reduction in a solar panel's power output over its operational lifetime, typically expressed as a percentage per year.",
    function: "To account for the expected long-term reduction in energy yield when estimating a solar system's performance over its lifetime.",
    fact: "Most crystalline silicon solar panels are warranted to retain a large majority of their original output after 25 years, with a small annual degradation rate." },
  { term: "Bifacial Solar Panel", topic: "Solar Panel Types & Technology", difficulty: "Advanced", tags: ["panel-types"],
    definition: "A solar panel capable of generating electricity from both its front and rear sides, capturing reflected light from the rear.",
    function: "To increase energy yield from a given panel area by capturing additional reflected and diffuse light on the rear surface.",
    fact: "Bifacial panels typically show the greatest yield benefit when mounted with a reflective surface, such as light-colored roofing, beneath them." },

  // Inverters & Balance of System
  { term: "Solar Inverter", topic: "Inverters & Balance of System", difficulty: "Basic", tags: ["inverters"],
    definition: "A device that converts DC electricity generated by solar panels into AC electricity suitable for use or grid export.",
    function: "To convert the DC output of a solar array into usable AC power compatible with building loads or the utility grid.",
    fact: "Solar inverters typically include maximum power point tracking (MPPT) to optimize energy extraction from the solar array." },
  { term: "String Inverter", topic: "Inverters & Balance of System", difficulty: "Intermediate", tags: ["inverters"],
    definition: "A solar inverter that connects to a series-connected string, or several strings, of solar panels, converting their combined DC output to AC.",
    function: "To provide a cost-effective, centralized DC-to-AC conversion solution for a group of panels connected in series.",
    fact: "String inverters are widely used in both residential and commercial rooftop solar installations." },
  { term: "Microinverter", topic: "Inverters & Balance of System", difficulty: "Advanced", tags: ["inverters"],
    definition: "A small inverter installed at each individual solar panel, converting that panel's DC output to AC independently.",
    function: "To optimize energy harvest at the individual panel level and reduce the impact of partial shading on overall system output.",
    fact: "Microinverters can improve overall system performance in installations with partial shading or panels facing different orientations." },
  { term: "Maximum Power Point Tracking (MPPT)", topic: "Inverters & Balance of System", difficulty: "Intermediate", tags: ["inverters"],
    definition: "A technique used by solar inverters and charge controllers to continuously adjust operating conditions to extract maximum available power.",
    function: "To maximize energy harvest from a solar array as sunlight conditions and panel characteristics change throughout the day.",
    fact: "MPPT technology significantly improves solar system energy yield compared to fixed-operating-point systems." },
  { term: "Solar Charge Controller", topic: "Inverters & Balance of System", difficulty: "Intermediate", tags: ["inverters"],
    definition: "A device used in off-grid or battery-backed solar systems to regulate the charging of batteries from the solar array.",
    function: "To protect batteries from overcharging and optimize energy transfer from the solar array to the battery bank.",
    fact: "Charge controllers are available in simpler PWM (pulse width modulation) type or more efficient MPPT type." },
  { term: "Battery Storage (Solar)", topic: "Inverters & Balance of System", difficulty: "Intermediate", tags: ["inverters"],
    definition: "Batteries used in a solar PV system to store excess generated energy for use during periods without sunlight.",
    function: "To allow solar energy generated during the day to be used at night or during grid outages, in off-grid or hybrid systems.",
    fact: "Battery storage significantly increases the cost of a solar PV system but provides energy availability independent of sunlight hours." },

  // Solar System Sizing & Design
  { term: "Solar Array Sizing", topic: "Solar System Sizing & Design", difficulty: "Intermediate", tags: ["sizing"],
    definition: "The process of determining the number and configuration of solar panels required to meet a target energy generation requirement.",
    function: "To ensure a solar PV system is appropriately sized to meet the intended energy generation or offset requirement.",
    fact: "Solar array sizing typically considers available roof area, orientation, shading, and the target energy generation." },
  { term: "Tilt Angle (Solar Panel)", topic: "Solar System Sizing & Design", difficulty: "Intermediate", tags: ["sizing"],
    definition: "The angle at which a solar panel is mounted relative to horizontal, affecting the amount of solar irradiance it receives.",
    function: "To optimize the amount of solar energy captured based on the installation's geographic latitude and seasonal energy priorities.",
    fact: "An optimal tilt angle is often close to the site's latitude, though it may be adjusted to favor summer or winter generation." },
  { term: "Shading Analysis (Solar)", topic: "Solar System Sizing & Design", difficulty: "Intermediate", tags: ["sizing"],
    definition: "An assessment of potential obstructions, such as nearby buildings or trees, that could cast shadows on a solar array and reduce output.",
    function: "To identify and, where possible, avoid or mitigate shading that would otherwise significantly reduce solar system energy yield.",
    fact: "Even partial shading on a portion of a solar array can disproportionately reduce the output of an entire series string." },
  { term: "Performance Ratio (Solar)", topic: "Solar System Sizing & Design", difficulty: "Advanced", tags: ["sizing"],
    definition: "A measure of a solar PV system's actual energy output compared to its theoretical output under ideal conditions, expressed as a percentage.",
    function: "To indicate how effectively a solar PV system converts available solar irradiance into usable energy after accounting for real-world losses.",
    fact: "A higher performance ratio indicates a solar system is operating closer to its theoretical maximum potential, accounting for losses." },
  { term: "DC/AC Ratio (Solar)", topic: "Solar System Sizing & Design", difficulty: "Advanced", tags: ["sizing"],
    definition: "The ratio of a solar array's total DC rated capacity to the inverter's AC rated output capacity.",
    function: "To optimize inverter utilization and system economics, since inverters are often intentionally undersized relative to peak DC capacity.",
    fact: "A DC/AC ratio greater than 1.0 is common practice, since solar arrays rarely produce their full rated DC output simultaneously." },

  // Grid-Tied & Off-Grid Systems
  { term: "Grid-Tied Solar System", topic: "Grid-Tied & Off-Grid Systems", difficulty: "Basic", tags: ["system-types"],
    definition: "A solar PV system connected to the utility grid, allowing excess generation to be exported and grid power to be drawn when needed.",
    function: "To allow a building to use solar energy when available while relying on grid power at other times, without requiring battery storage.",
    fact: "Grid-tied solar systems typically require an approved grid-interactive inverter and utility approval for interconnection." },
  { term: "Off-Grid Solar System", topic: "Grid-Tied & Off-Grid Systems", difficulty: "Intermediate", tags: ["system-types"],
    definition: "A standalone solar PV system, typically including battery storage, that operates independently without a connection to the utility grid.",
    function: "To provide electricity in locations without access to grid power, relying entirely on solar generation and stored energy.",
    fact: "Off-grid solar systems must be sized to meet all energy needs from solar and battery storage alone, without grid backup." },
  { term: "Hybrid Solar System", topic: "Grid-Tied & Off-Grid Systems", difficulty: "Intermediate", tags: ["system-types"],
    definition: "A solar PV system that combines grid connection with battery storage, providing backup power during outages while remaining grid-connected.",
    function: "To provide the benefits of grid connection along with backup power availability during grid outages.",
    fact: "Hybrid solar systems are increasingly popular where grid reliability is inconsistent, providing both bill savings and backup power." },
  { term: "Net Metering", topic: "Grid-Tied & Off-Grid Systems", difficulty: "Basic", tags: ["net-metering"],
    definition: "A billing arrangement allowing a grid-tied solar system owner to receive credit for excess solar energy exported to the grid.",
    function: "To fairly compensate solar system owners for excess energy they contribute to the grid, improving system economics.",
    fact: "Net metering policies and export compensation rates vary significantly between different utilities and regulatory jurisdictions." },
  { term: "Anti-Islanding Protection", topic: "Grid-Tied & Off-Grid Systems", difficulty: "Advanced", tags: ["system-types"],
    definition: "A safety feature in grid-tied solar inverters that automatically disconnects the system from the grid during a utility power outage.",
    function: "To protect utility workers from the hazard of a solar system continuing to energize grid lines during a power outage.",
    fact: "Anti-islanding protection is a mandatory safety feature required in virtually all grid-tied solar inverters." },

  // Solar Codes & Net Metering
  { term: "Solar Interconnection Standards", topic: "Solar Codes & Net Metering", difficulty: "Intermediate", tags: ["solar-codes"],
    definition: "Technical standards and utility requirements governing how a grid-tied solar system may be connected to the distribution network.",
    function: "To ensure grid-tied solar installations do not adversely affect the safety or stability of the utility distribution network.",
    fact: "Interconnection approval from the local utility is typically required before a grid-tied solar system can be commissioned and used." },
  { term: "Net Metering Policy", topic: "Solar Codes & Net Metering", difficulty: "Intermediate", tags: ["solar-codes"],
    definition: "A regulatory framework defining the terms under which solar system owners are credited for excess energy exported to the grid.",
    function: "To establish clear, consistent rules for solar energy compensation, supporting the financial viability of grid-tied solar installations.",
    fact: "Net metering policies can change over time, affecting the economics of both new and existing solar installations." },
  { term: "Solar PV Installation Standard", topic: "Solar Codes & Net Metering", difficulty: "Intermediate", tags: ["solar-codes"],
    definition: "Technical standards specifying safe design, installation, and testing practices for solar PV systems.",
    function: "To ensure solar PV installations are performed safely and meet minimum technical quality and safety requirements.",
    fact: "Solar PV installation standards typically address aspects such as DC wiring, earthing, and fire safety considerations for rooftop systems." },
  { term: "Solar Rooftop Policy (India)", topic: "Solar Codes & Net Metering", difficulty: "Basic", tags: ["solar-codes"],
    definition: "Government policies and incentive schemes promoting the adoption of rooftop solar PV systems in India.",
    function: "To encourage wider adoption of rooftop solar through incentives, subsidies, or simplified regulatory processes.",
    fact: "Solar rooftop policies in India have evolved over time, including subsidy schemes and simplified net metering procedures for residential systems." },
  { term: "Solar PV Fire Safety Considerations", topic: "Solar Codes & Net Metering", difficulty: "Advanced", tags: ["solar-codes"],
    definition: "Design and installation measures addressing fire risks associated with rooftop solar PV systems, including rapid shutdown provisions.",
    function: "To reduce fire risk associated with solar PV installations and to protect fire fighters accessing a roof during a fire.",
    fact: "Rapid shutdown provisions allow fire fighters to quickly de-energize rooftop solar DC wiring during emergency response." },
];

const num = (n, unit, decimals = 2) => `${Number(n.toFixed(decimals)).toLocaleString("en-IN")} ${unit}`;
const rupee = (n) => `Rs ${Math.round(n).toLocaleString("en-IN")}`;
const near = (v, pct, rng) => v * (1 + (rng() * 2 - 1) * pct);

const CALC_TEMPLATES = [
  {
    name: "panel-count-for-target",
    weight: 7,
    spec: {
      discipline: D, topic: "Solar System Sizing & Design", subtopic: "Array Sizing", tags: ["calculation"], difficulty: "Intermediate",
      gen: (rng) => ({ dailyTargetKwh: randInt(rng, 5, 500), panelWatt: pick(rng, [330, 400, 450, 540, 550]), peakSunHours: randFloat(rng, 3.5, 5.5, 1), derate: randFloat(rng, 0.75, 0.85, 2) }),
      compute: ({ dailyTargetKwh, panelWatt, peakSunHours, derate }) => {
        const dailyEnergyPerPanelKwh = (panelWatt * peakSunHours * derate) / 1000;
        const panels = Math.ceil(dailyTargetKwh / dailyEnergyPerPanelKwh);
        return { formatted: `${panels} panels`, value: panels };
      },
      question: ({ dailyTargetKwh, panelWatt, peakSunHours, derate }) =>
        `A solar system must generate approximately ${dailyTargetKwh} kWh per day at a site with ${peakSunHours} peak sun hours, using ${panelWatt} Wp panels and an overall system derate factor of ${derate} (accounting for temperature, wiring, and inverter losses). How many panels are approximately required?`,
      explanation: ({ dailyTargetKwh, panelWatt, peakSunHours, derate }, formatted) =>
        `Daily energy per panel = (Panel Wp x Peak sun hours x Derate) / 1000. Panels required = Daily target / Daily energy per panel, rounded up = approximately ${formatted}.`,
      distractors: ({ dailyTargetKwh, panelWatt, peakSunHours, derate }, result, rng) => [
        `${Math.max(1, Math.round(result.value / 2))} panels`,
        `${Math.round(result.value * 1.6)} panels`,
        `${Math.max(1, Math.round(near(result.value, 0.3, rng)))} panels`,
      ],
    },
  },
  {
    name: "annual-energy-yield",
    weight: 7,
    spec: {
      discipline: D, topic: "Solar System Sizing & Design", subtopic: "Annual Energy Yield", tags: ["calculation"], difficulty: "Advanced",
      gen: (rng) => ({ systemKw: randFloat(rng, 1, 500, 1), peakSunHours: randFloat(rng, 3.5, 5.5, 1), performanceRatio: randFloat(rng, 0.75, 0.85, 2) }),
      compute: ({ systemKw, peakSunHours, performanceRatio }) => {
        const annualKwh = systemKw * peakSunHours * 365 * performanceRatio;
        return { formatted: num(annualKwh, "kWh/year", 0), value: annualKwh };
      },
      question: ({ systemKw, peakSunHours, performanceRatio }) =>
        `A ${systemKw} kWp solar PV system is installed at a site with ${peakSunHours} average peak sun hours per day and an overall performance ratio of ${performanceRatio}. What is the approximate expected annual energy yield?`,
      explanation: ({ systemKw, peakSunHours, performanceRatio }, formatted) =>
        `Annual yield = System capacity(kWp) x Peak sun hours x 365 days x Performance ratio = ${systemKw} x ${peakSunHours} x 365 x ${performanceRatio} = approximately ${formatted}.`,
      distractors: ({ systemKw, peakSunHours, performanceRatio }, result, rng) => [
        num(result.value * 1.5, "kWh/year", 0),
        num(result.value / 2, "kWh/year", 0),
        num(near(result.value, 0.25, rng), "kWh/year", 0),
      ],
    },
  },
  {
    name: "roof-area-required",
    weight: 5,
    spec: {
      discipline: D, topic: "Solar System Sizing & Design", subtopic: "Roof Area Requirement", tags: ["calculation"], difficulty: "Intermediate",
      gen: (rng) => ({ systemKw: randFloat(rng, 1, 500, 1), areaPerKw: randFloat(rng, 6, 10, 1) }),
      compute: ({ systemKw, areaPerKw }) => ({ formatted: num(systemKw * areaPerKw, "sq.m", 1), value: systemKw * areaPerKw }),
      question: ({ systemKw, areaPerKw }) =>
        `A solar installer estimates that approximately ${areaPerKw} sq.m of roof area is required per kWp of solar panels, including spacing for maintenance access and row shading avoidance. For a planned ${systemKw} kWp system, what is the approximate roof area required?`,
      explanation: ({ systemKw, areaPerKw }, formatted) =>
        `Roof area required = System capacity(kWp) x Area per kWp = ${systemKw} x ${areaPerKw} = approximately ${formatted}.`,
      distractors: ({ systemKw, areaPerKw }, result, rng) => [
        num(result.value * 2, "sq.m", 1),
        num(result.value / 2, "sq.m", 1),
        num(near(result.value, 0.25, rng), "sq.m", 1),
      ],
    },
  },
  {
    name: "payback-period",
    weight: 6,
    spec: {
      discipline: D, topic: "Grid-Tied & Off-Grid Systems", subtopic: "Payback Period", tags: ["calculation", "estimation"], difficulty: "Intermediate",
      gen: (rng) => ({ systemCost: randInt(rng, 100000, 5000000), annualSavings: randInt(rng, 20000, 800000) }),
      compute: ({ systemCost, annualSavings }) => ({ formatted: num(systemCost / annualSavings, "years", 1), value: systemCost / annualSavings }),
      question: ({ systemCost, annualSavings }) =>
        `A rooftop solar system costs Rs ${systemCost.toLocaleString("en-IN")} to install and is expected to generate annual electricity bill savings of Rs ${annualSavings.toLocaleString("en-IN")}. What is the approximate simple payback period?`,
      explanation: ({ systemCost, annualSavings }, formatted) =>
        `Simple payback period = System cost / Annual savings = ${systemCost.toLocaleString("en-IN")} / ${annualSavings.toLocaleString("en-IN")} = approximately ${formatted}.`,
      distractors: ({ systemCost, annualSavings }, result, rng) => [
        num(result.value * 2, "years", 1),
        num(result.value / 2, "years", 1),
        num(near(result.value, 0.25, rng), "years", 1),
      ],
    },
  },
  {
    name: "co2-offset",
    weight: 4,
    spec: {
      discipline: D, topic: "Solar System Sizing & Design", subtopic: "Environmental Impact", tags: ["calculation"], difficulty: "Basic",
      gen: (rng) => ({ annualKwh: randInt(rng, 2000, 800000), emissionFactor: randFloat(rng, 0.7, 0.9, 2) }),
      compute: ({ annualKwh, emissionFactor }) => ({ formatted: num((annualKwh * emissionFactor) / 1000, "tonnes CO2/year", 2), value: (annualKwh * emissionFactor) / 1000 }),
      question: ({ annualKwh, emissionFactor }) =>
        `A solar system generates ${annualKwh} kWh per year, offsetting grid electricity with a grid emission factor of ${emissionFactor} kg CO2 per kWh. What is the approximate annual CO2 emissions offset?`,
      explanation: ({ annualKwh, emissionFactor }, formatted) =>
        `CO2 offset = Annual generation(kWh) x Emission factor(kg/kWh), converted to tonnes = (${annualKwh} x ${emissionFactor}) / 1000 = approximately ${formatted}.`,
      distractors: ({ annualKwh, emissionFactor }, result, rng) => [
        num(result.value * 2, "tonnes CO2/year", 2),
        num(result.value / 2, "tonnes CO2/year", 2),
        num(near(result.value, 0.3, rng), "tonnes CO2/year", 2),
      ],
    },
  },
  {
    name: "inverter-dc-ac-sizing",
    weight: 5,
    spec: {
      discipline: D, topic: "Solar System Sizing & Design", subtopic: "DC/AC Ratio", tags: ["calculation"], difficulty: "Intermediate",
      gen: (rng) => ({ acRatingKw: randFloat(rng, 3, 200, 1), ratio: randFloat(rng, 1.1, 1.3, 2) }),
      compute: ({ acRatingKw, ratio }) => ({ formatted: num(acRatingKw * ratio, "kWp", 1), value: acRatingKw * ratio }),
      question: ({ acRatingKw, ratio }) =>
        `A solar inverter has an AC output rating of ${acRatingKw} kW. If the system is designed with a DC/AC ratio of ${ratio}, what is the approximate DC solar array capacity that should be connected to this inverter?`,
      explanation: ({ acRatingKw, ratio }, formatted) =>
        `DC array capacity = Inverter AC rating x DC/AC ratio = ${acRatingKw} x ${ratio} = approximately ${formatted}.`,
      distractors: ({ acRatingKw, ratio }, result, rng) => [
        num(acRatingKw / ratio, "kWp", 1),
        num(result.value * 1.5, "kWp", 1),
        num(near(result.value, 0.2, rng), "kWp", 1),
      ],
    },
  },
  {
    name: "off-grid-battery-sizing",
    weight: 6,
    spec: {
      discipline: D, topic: "Inverters & Balance of System", subtopic: "Battery Sizing", tags: ["calculation"], difficulty: "Advanced",
      gen: (rng) => ({ dailyLoadKwh: randFloat(rng, 2, 80, 1), autonomyDays: pick(rng, [1, 1.5, 2, 3]), dod: pick(rng, [0.5, 0.6, 0.8]), systemVoltage: pick(rng, [12, 24, 48]) }),
      compute: ({ dailyLoadKwh, autonomyDays, dod, systemVoltage }) => {
        const requiredWh = (dailyLoadKwh * 1000 * autonomyDays) / dod;
        const requiredAh = requiredWh / systemVoltage;
        return { formatted: num(requiredAh, "Ah", 0), value: requiredAh };
      },
      question: ({ dailyLoadKwh, autonomyDays, dod, systemVoltage }) =>
        `An off-grid solar system must supply a daily load of ${dailyLoadKwh} kWh with ${autonomyDays} day(s) of battery autonomy, using batteries with a maximum allowable depth of discharge (DoD) of ${dod} at a system voltage of ${systemVoltage} V. What is the approximate required battery bank capacity in Ah?`,
      explanation: ({ dailyLoadKwh, autonomyDays, dod, systemVoltage }, formatted) =>
        `Required Wh = (Daily load x Autonomy days x 1000) / DoD. Required Ah = Required Wh / System voltage = approximately ${formatted}.`,
      distractors: ({ dailyLoadKwh, autonomyDays, dod, systemVoltage }, result, rng) => [
        num(result.value * 2, "Ah", 0),
        num(result.value / 2, "Ah", 0),
        num(near(result.value, 0.3, rng), "Ah", 0),
      ],
    },
  },
  {
    name: "net-metering-savings",
    weight: 5,
    spec: {
      discipline: D, topic: "Grid-Tied & Off-Grid Systems", subtopic: "Net Metering Savings", tags: ["calculation", "estimation"], difficulty: "Intermediate",
      gen: (rng) => ({ exportedKwh: randInt(rng, 200, 20000), rate: randFloat(rng, 3, 9, 1) }),
      compute: ({ exportedKwh, rate }) => ({ formatted: rupee(exportedKwh * rate), value: exportedKwh * rate }),
      question: ({ exportedKwh, rate }) =>
        `A grid-tied solar system exports ${exportedKwh} kWh of surplus energy to the grid in a billing period under a net metering arrangement, credited at Rs ${rate} per kWh. What is the approximate credit value for this exported energy?`,
      explanation: ({ exportedKwh, rate }, formatted) => `Credit value = Exported energy x Net metering rate = ${exportedKwh} x ${rate} = approximately ${formatted}.`,
      distractors: ({ exportedKwh, rate }, result, rng) => [
        rupee(result.value / 2),
        rupee(result.value * 1.6),
        rupee(near(result.value, 0.25, rng)),
      ],
    },
  },
  {
    name: "string-voltage-check",
    weight: 5,
    spec: {
      discipline: D, topic: "Inverters & Balance of System", subtopic: "String Sizing", tags: ["calculation"], difficulty: "Advanced",
      gen: (rng) => ({ panelVoc: randFloat(rng, 37, 50, 1), panelsInSeries: randInt(rng, 8, 24), inverterMaxVoltage: pick(rng, [600, 1000, 1100, 1500]) }),
      compute: ({ panelVoc, panelsInSeries, inverterMaxVoltage }) => {
        const stringVoltage = panelVoc * panelsInSeries;
        return { formatted: stringVoltage <= inverterMaxVoltage ? "Within limit - acceptable" : "Exceeds limit - not acceptable", value: stringVoltage <= inverterMaxVoltage, stringVoltage };
      },
      question: ({ panelVoc, panelsInSeries, inverterMaxVoltage }) =>
        `A solar panel has an open-circuit voltage (Voc) of ${panelVoc} V. If ${panelsInSeries} panels are connected in series to form one string, and the inverter's maximum input voltage rating is ${inverterMaxVoltage} V, is this string configuration within the inverter's voltage limit (accounting for cold-weather Voc rise is ignored here for simplicity)?`,
      explanation: ({ panelVoc, panelsInSeries, inverterMaxVoltage }, formatted) => {
        const stringVoltage = panelVoc * panelsInSeries;
        return `String voltage = Panel Voc x Panels in series = ${panelVoc} x ${panelsInSeries} = ${stringVoltage.toFixed(1)} V. Compared to the inverter limit of ${inverterMaxVoltage} V, the result is: ${formatted}.`;
      },
      distractors: ({ panelVoc, panelsInSeries, inverterMaxVoltage }, result) => {
        const opposite = result.value ? "Exceeds limit - not acceptable" : "Within limit - acceptable";
        return [opposite, "Cannot be determined without temperature data", "Acceptable only in parallel, not series"];
      },
    },
  },
];

export function generateSolar() {
  const conceptual = roundRobinTrim(buildFromFactBank(FACTS, D), CONCEPTUAL_TARGET, (q) => q.topic);
  const calcTarget = TARGET - conceptual.length;
  const calc = buildCalcSet(CALC_TEMPLATES, calcTarget, "solar");
  return [...conceptual, ...calc].slice(0, TARGET);
}
