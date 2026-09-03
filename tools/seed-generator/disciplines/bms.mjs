import { randInt, randFloat, pick } from "../lib/rng.mjs";
import { buildFromFactBank, buildCalcSet, roundRobinTrim } from "../lib/engine.mjs";

const D = "BMS";
const TARGET = 300;
const CONCEPTUAL_TARGET = 150;

const FACTS = [
  // BMS Fundamentals & Architecture
  { term: "Building Management System (BMS)", topic: "BMS Fundamentals & Architecture", difficulty: "Basic", tags: ["fundamentals"],
    definition: "A centralized computer-based system that monitors and controls a building's mechanical and electrical equipment.",
    function: "To provide centralized monitoring, control, and optimization of building services such as HVAC, lighting, and power.",
    fact: "A BMS typically integrates multiple building systems into a single monitoring and control platform for facility operators." },
  { term: "Supervisory Level (BMS)", topic: "BMS Fundamentals & Architecture", difficulty: "Intermediate", tags: ["architecture"],
    definition: "The top layer of a BMS architecture, comprising servers and workstations used for monitoring, control, and reporting.",
    function: "To provide a central point for operators to view system status, issue commands, and generate reports.",
    fact: "The supervisory level typically hosts the graphical user interface used by building operators to monitor the entire facility." },
  { term: "Field Level (BMS)", topic: "BMS Fundamentals & Architecture", difficulty: "Basic", tags: ["architecture"],
    definition: "The lowest layer of a BMS architecture, comprising sensors and actuators that directly interact with the physical environment.",
    function: "To gather real-world data and physically actuate equipment based on commands from the control level.",
    fact: "Field level devices, such as sensors and actuators, provide the raw inputs and outputs that a BMS relies upon." },
  { term: "Automation Level (BMS)", topic: "BMS Fundamentals & Architecture", difficulty: "Intermediate", tags: ["architecture"],
    definition: "The middle layer of a BMS architecture, comprising DDC controllers that execute control logic based on field inputs.",
    function: "To execute control algorithms that translate sensor readings into appropriate equipment commands.",
    fact: "The automation level is where control logic, such as PID loops and scheduling, is actually executed." },
  { term: "Open Protocol BMS", topic: "BMS Fundamentals & Architecture", difficulty: "Intermediate", tags: ["architecture"],
    definition: "A BMS architecture using standardized, non-proprietary communication protocols such as BACnet or Modbus.",
    function: "To allow devices and software from different manufacturers to interoperate within the same BMS.",
    fact: "Open protocol BMS architectures generally provide greater flexibility in equipment and vendor selection than proprietary systems." },
  { term: "Proprietary BMS", topic: "BMS Fundamentals & Architecture", difficulty: "Intermediate", tags: ["architecture"],
    definition: "A BMS architecture using a manufacturer-specific communication protocol not openly published for third-party use.",
    function: "To provide a tightly integrated single-vendor solution, often at the cost of future flexibility.",
    fact: "Proprietary BMS systems can make future expansion or equipment replacement more dependent on a single vendor." },

  // Controllers & Field Devices
  { term: "DDC Controller", topic: "Controllers & Field Devices", difficulty: "Basic", tags: ["controllers"],
    definition: "A Direct Digital Controller: an electronic device that executes control logic and directly manages connected sensors and actuators.",
    function: "To execute the programmed control sequences for HVAC or other building equipment based on sensor input.",
    fact: "DDC controllers have largely replaced older pneumatic control systems in modern building automation." },
  { term: "PLC (Programmable Logic Controller)", topic: "Controllers & Field Devices", difficulty: "Intermediate", tags: ["controllers"],
    definition: "An industrial digital computer used to control machinery or processes through programmable logic.",
    function: "To provide robust, programmable control, often used for more complex or industrial-type applications within a BMS.",
    fact: "PLCs are often chosen for BMS applications requiring high reliability or complex sequencing, such as central plant control." },
  { term: "Temperature Sensor (BMS)", topic: "Controllers & Field Devices", difficulty: "Basic", tags: ["sensors"],
    definition: "A field device that measures temperature and sends a corresponding signal to a BMS controller.",
    function: "To provide temperature feedback used by the BMS to control HVAC equipment such as AHUs and chillers.",
    fact: "Temperature sensors are among the most common field devices used throughout a BMS-controlled building." },
  { term: "Humidity Sensor", topic: "Controllers & Field Devices", difficulty: "Basic", tags: ["sensors"],
    definition: "A field device that measures relative humidity and sends a corresponding signal to a BMS controller.",
    function: "To provide humidity feedback used by the BMS to control humidification or dehumidification equipment.",
    fact: "Humidity sensors are particularly important in spaces with strict humidity requirements, such as data centers or hospitals." },
  { term: "Differential Pressure Sensor", topic: "Controllers & Field Devices", difficulty: "Intermediate", tags: ["sensors"],
    definition: "A sensor that measures the pressure difference between two points, commonly used to monitor filter condition or airflow/water flow.",
    function: "To provide feedback used to detect dirty filters, verify fan/pump operation, or control variable systems.",
    fact: "Differential pressure sensors are commonly used across air filters to signal when replacement is due." },
  { term: "Flow Meter (BMS)", topic: "Controllers & Field Devices", difficulty: "Intermediate", tags: ["sensors"],
    definition: "A device that measures the rate of fluid flow, such as chilled water or fuel, and sends a signal to the BMS.",
    function: "To provide flow data used for monitoring, energy metering, or control of pumping systems.",
    fact: "Flow meters are commonly used in chilled water systems to calculate delivered cooling energy, often called BTU metering." },
  { term: "Actuator (BMS)", topic: "Controllers & Field Devices", difficulty: "Basic", tags: ["actuators"],
    definition: "A device that converts a control signal into physical motion, such as opening a valve or damper.",
    function: "To physically operate valves, dampers, or other mechanical elements in response to BMS control commands.",
    fact: "Actuators can be designed to fail in a safe position, such as open or closed, upon loss of control signal or power." },
  { term: "Control Valve (BMS)", topic: "Controllers & Field Devices", difficulty: "Intermediate", tags: ["actuators"],
    definition: "A valve with an actuator that modulates fluid flow through a coil or system in response to a BMS control signal.",
    function: "To regulate heating or cooling capacity by controlling water flow through a coil based on demand.",
    fact: "Control valves are commonly specified with an equal-percentage or linear flow characteristic depending on the application." },

  // HVAC & Lighting Control Integration
  { term: "AHU Control Sequence", topic: "HVAC & Lighting Control Integration", difficulty: "Advanced", tags: ["hvac-control"],
    definition: "A programmed set of control logic that governs an AHU's fan, dampers, and coil valves to maintain supply air conditions.",
    function: "To automatically maintain desired supply air temperature and flow while optimizing energy use.",
    fact: "AHU control sequences typically include interlocks, such as preventing the fan from running with the fresh air damper closed." },
  { term: "Chiller Plant Control", topic: "HVAC & Lighting Control Integration", difficulty: "Advanced", tags: ["hvac-control"],
    definition: "BMS logic that sequences chillers, pumps, and cooling towers to meet cooling demand efficiently.",
    function: "To optimize chiller plant operation, staging equipment on and off based on load to maximize efficiency.",
    fact: "Chiller plant control sequences commonly stage additional chillers on only when existing units approach full capacity." },
  { term: "Lighting Control System", topic: "HVAC & Lighting Control Integration", difficulty: "Basic", tags: ["lighting-control"],
    definition: "A system that automates lighting operation based on schedules, occupancy, or daylight levels.",
    function: "To reduce energy consumption and improve convenience by automatically controlling lighting based on need.",
    fact: "Lighting control systems commonly use occupancy sensors and daylight sensors to reduce unnecessary lighting energy use." },
  { term: "Occupancy Sensor (Lighting)", topic: "HVAC & Lighting Control Integration", difficulty: "Basic", tags: ["lighting-control"],
    definition: "A sensor that detects the presence of people in a space to automatically control lighting or HVAC operation.",
    function: "To automatically switch off lighting or reduce HVAC operation in unoccupied spaces, saving energy.",
    fact: "Occupancy sensors are commonly used in meeting rooms, restrooms, and corridors to reduce unnecessary energy use." },
  { term: "VFD Integration with BMS", topic: "HVAC & Lighting Control Integration", difficulty: "Advanced", tags: ["hvac-control"],
    definition: "The connection of a variable frequency drive to a BMS, allowing remote speed control and status monitoring of the driven motor.",
    function: "To allow the BMS to automatically adjust motor speed, such as for pumps and fans, based on system demand.",
    fact: "VFD integration with a BMS commonly enables demand-based speed control, improving energy efficiency compared to fixed-speed operation." },

  // Communication Protocols
  { term: "BACnet", topic: "Communication Protocols", difficulty: "Intermediate", tags: ["protocols"],
    definition: "A standardized, open communication protocol widely used for building automation and control networks.",
    function: "To enable interoperability between building automation devices and systems from different manufacturers.",
    fact: "BACnet is one of the most widely adopted open protocols in building automation systems worldwide." },
  { term: "Modbus", topic: "Communication Protocols", difficulty: "Basic", tags: ["protocols"],
    definition: "A serial or network communication protocol widely used for connecting industrial and building automation devices.",
    function: "To provide a simple, widely supported communication method between controllers, meters, and other field devices.",
    fact: "Modbus is commonly used to integrate meters, VFDs, and other devices with a BMS due to its wide industry support." },
  { term: "LonWorks", topic: "Communication Protocols", difficulty: "Advanced", tags: ["protocols"],
    definition: "A networking platform and protocol historically used in building automation for peer-to-peer device communication.",
    function: "To enable distributed, peer-to-peer communication among building automation devices without a central controller.",
    fact: "LonWorks was historically popular in building automation before BACnet became more dominant in many markets." },
  { term: "KNX", topic: "Communication Protocols", difficulty: "Intermediate", tags: ["protocols"],
    definition: "A standardized protocol commonly used for home and building automation, particularly for lighting, blinds, and HVAC control.",
    function: "To provide a standardized communication method for automation of lighting, shading, and other building functions.",
    fact: "KNX is widely used in residential and light commercial building automation applications, particularly in Europe." },
  { term: "BMS Gateway", topic: "Communication Protocols", difficulty: "Intermediate", tags: ["protocols"],
    definition: "A device that translates communication between two different protocols, allowing devices using different standards to communicate.",
    function: "To enable integration between systems using different, otherwise incompatible communication protocols.",
    fact: "Gateways are commonly used to integrate legacy or proprietary equipment into an open-protocol BMS network." },

  // BMS Graphics, Alarms & Trends
  { term: "BMS Graphic Screen", topic: "BMS Graphics, Alarms & Trends", difficulty: "Basic", tags: ["graphics"],
    definition: "A graphical representation of a building system, such as an AHU schematic, displayed on the BMS operator workstation.",
    function: "To provide operators with an intuitive visual representation of system status and enable interaction with equipment.",
    fact: "BMS graphic screens typically display live values, such as temperatures and statuses, overlaid on a system schematic." },
  { term: "BMS Alarm", topic: "BMS Graphics, Alarms & Trends", difficulty: "Basic", tags: ["alarms"],
    definition: "A notification generated by the BMS when a monitored parameter exceeds a defined limit or a fault condition occurs.",
    function: "To alert operators to abnormal conditions requiring attention or corrective action.",
    fact: "BMS alarms are typically prioritized, so critical alarms can be distinguished from routine or informational notifications." },
  { term: "Trend Log", topic: "BMS Graphics, Alarms & Trends", difficulty: "Intermediate", tags: ["trends"],
    definition: "A recorded history of a monitored point's value over time, used for analysis and troubleshooting.",
    function: "To allow operators to review historical performance and diagnose issues by analyzing data trends over time.",
    fact: "Trend logs are commonly used to verify that equipment is performing efficiently and to diagnose intermittent problems." },
  { term: "Alarm Prioritization", topic: "BMS Graphics, Alarms & Trends", difficulty: "Intermediate", tags: ["alarms"],
    definition: "The classification of BMS alarms into different severity levels to help operators respond appropriately.",
    function: "To ensure critical alarms receive immediate attention while lower-priority alarms are handled in due course.",
    fact: "Alarm prioritization helps prevent alarm fatigue by distinguishing critical safety alarms from minor informational events." },

  // Points Lists & I/O Calculations
  { term: "BMS Points List", topic: "Points Lists & I/O Calculations", difficulty: "Basic", tags: ["points-list"],
    definition: "A document listing all input and output points to be monitored or controlled by a BMS for a given project.",
    function: "To define the complete scope of monitoring and control points required for BMS integration on a project.",
    fact: "A points list typically categorizes each point as analog or digital, and as an input or output (AI, AO, DI, DO)." },
  { term: "Analog Input (AI)", topic: "Points Lists & I/O Calculations", difficulty: "Basic", tags: ["points-list"],
    definition: "A BMS input point that receives a continuously variable signal, such as temperature or pressure, from a sensor.",
    function: "To provide the BMS with continuously variable measured data from field sensors.",
    fact: "Analog inputs are commonly used for temperature, humidity, and pressure sensor signals in a BMS." },
  { term: "Analog Output (AO)", topic: "Points Lists & I/O Calculations", difficulty: "Basic", tags: ["points-list"],
    definition: "A BMS output point that sends a continuously variable control signal, such as to a valve or damper actuator.",
    function: "To allow the BMS to modulate equipment, such as valves and dampers, to a variable position.",
    fact: "Analog outputs are commonly used to modulate control valves and dampers to intermediate positions, not just fully open or closed." },
  { term: "Digital Input (DI)", topic: "Points Lists & I/O Calculations", difficulty: "Basic", tags: ["points-list"],
    definition: "A BMS input point that receives a simple two-state (on/off) signal, such as a pump run status or fault contact.",
    function: "To provide the BMS with on/off status information from field equipment.",
    fact: "Digital inputs are commonly used to monitor equipment run/stop status and fault or trip conditions." },
  { term: "Digital Output (DO)", topic: "Points Lists & I/O Calculations", difficulty: "Basic", tags: ["points-list"],
    definition: "A BMS output point that sends a simple two-state (on/off) command, such as to start or stop a pump.",
    function: "To allow the BMS to start, stop, or otherwise switch equipment on or off.",
    fact: "Digital outputs are commonly used to start and stop equipment such as pumps, fans, and lighting contactors." },

  // BMS BOQ & Estimation
  { term: "BMS BOQ", topic: "BMS BOQ & Estimation", difficulty: "Basic", tags: ["estimation"],
    definition: "A bill of quantities listing controllers, sensors, actuators, and other BMS materials with quantities for pricing.",
    function: "To provide a standardized basis for pricing and comparing BMS works packages.",
    fact: "BMS BOQs are typically prepared based on a finalized points list and system architecture." },
  { term: "BMS Rate Analysis", topic: "BMS BOQ & Estimation", difficulty: "Intermediate", tags: ["estimation"],
    definition: "A detailed cost breakdown for BMS items covering hardware, software licensing, cabling, and installation labour.",
    function: "To establish and justify unit rates quoted for BMS BOQ items.",
    fact: "BMS rate analysis often separates hardware cost, software or licensing cost, and installation/commissioning labour cost." },
  { term: "BMS Integration Scope", topic: "BMS BOQ & Estimation", difficulty: "Advanced", tags: ["estimation"],
    definition: "The defined scope of third-party systems, such as chillers, DG sets, or energy meters, to be integrated into the BMS.",
    function: "To clearly define which systems must communicate with the BMS and via which protocol or interface.",
    fact: "BMS integration scope should clearly specify the protocol, point count, and responsibility for each third-party system interface." },
];

const num = (n, unit, decimals = 2) => `${Number(n.toFixed(decimals)).toLocaleString("en-IN")} ${unit}`;
const near = (v, pct, rng) => v * (1 + (rng() * 2 - 1) * pct);

const CALC_TEMPLATES = [
  {
    name: "total-io-points",
    weight: 6,
    spec: {
      discipline: D, topic: "Points Lists & I/O Calculations", subtopic: "Total Points Count", tags: ["calculation"], difficulty: "Intermediate",
      gen: (rng) => ({ ahus: randInt(rng, 2, 40), pointsPerAhu: pick(rng, [8, 10, 12, 14, 16]) }),
      compute: ({ ahus, pointsPerAhu }) => ({ formatted: `${ahus * pointsPerAhu} points`, value: ahus * pointsPerAhu }),
      question: ({ ahus, pointsPerAhu }) =>
        `A project has ${ahus} AHUs, each requiring ${pointsPerAhu} BMS I/O points (combined AI, AO, DI, DO) for full monitoring and control. What is the total number of I/O points required for all AHUs?`,
      explanation: ({ ahus, pointsPerAhu }, formatted) => `Total points = Number of AHUs x Points per AHU = ${ahus} x ${pointsPerAhu} = ${formatted}.`,
      distractors: ({ ahus, pointsPerAhu }, result, rng) => [
        `${Math.round(result.value / 2)} points`,
        `${Math.round(result.value * 1.5)} points`,
        `${Math.max(1, Math.round(near(result.value, 0.25, rng)))} points`,
      ],
    },
  },
  {
    name: "controller-count-from-points",
    weight: 6,
    spec: {
      discipline: D, topic: "Controllers & Field Devices", subtopic: "Controller Sizing", tags: ["calculation"], difficulty: "Intermediate",
      gen: (rng) => ({ totalPoints: randInt(rng, 40, 2000), pointsPerController: pick(rng, [16, 24, 32, 48]) }),
      compute: ({ totalPoints, pointsPerController }) => ({
        formatted: `${Math.ceil(totalPoints / pointsPerController)} controllers`,
        value: Math.ceil(totalPoints / pointsPerController),
      }),
      question: ({ totalPoints, pointsPerController }) =>
        `A BMS project has a total of ${totalPoints} I/O points to be managed. If each DDC controller supports up to ${pointsPerController} points, what is the minimum number of controllers required?`,
      explanation: ({ totalPoints, pointsPerController }, formatted) =>
        `Minimum controllers = Total points / Points per controller, rounded up = ${totalPoints} / ${pointsPerController} rounded up to ${formatted}.`,
      distractors: ({ totalPoints, pointsPerController }, result, rng) => [
        `${Math.max(1, Math.round(result.value / 2))} controllers`,
        `${Math.round(result.value * 1.6)} controllers`,
        `${Math.max(1, Math.round(near(result.value, 0.3, rng)))} controllers`,
      ],
    },
  },
  {
    name: "trend-storage-sizing",
    weight: 5,
    spec: {
      discipline: D, topic: "BMS Graphics, Alarms & Trends", subtopic: "Trend Storage", tags: ["calculation"], difficulty: "Advanced",
      gen: (rng) => ({
        points: randInt(rng, 50, 3000),
        samplesPerDay: pick(rng, [96, 144, 288, 1440]),
        bytesPerSample: 8,
        days: pick(rng, [30, 90, 180, 365]),
      }),
      compute: ({ points, samplesPerDay, bytesPerSample, days }) => {
        const totalBytes = points * samplesPerDay * bytesPerSample * days;
        return { formatted: num(totalBytes / 1e9, "GB", 2), value: totalBytes / 1e9 };
      },
      question: ({ points, samplesPerDay, days }) =>
        `A BMS trend database logs ${points} points, each sampled ${samplesPerDay} times per day, with each sample requiring approximately 8 bytes of storage, retained for ${days} days. What is the approximate total trend storage required?`,
      explanation: ({ points, samplesPerDay, days }, formatted) =>
        `Storage = Points x Samples per day x Bytes per sample x Retention days, converted to GB = approximately ${formatted}.`,
      distractors: ({ points, samplesPerDay, days }, result, rng) => [
        num(result.value * 2, "GB", 2),
        num(result.value / 2, "GB", 2),
        num(near(result.value, 0.3, rng), "GB", 2),
      ],
    },
  },
  {
    name: "vfd-energy-savings",
    weight: 6,
    spec: {
      discipline: D, topic: "HVAC & Lighting Control Integration", subtopic: "VFD Energy Savings", tags: ["calculation"], difficulty: "Advanced",
      gen: (rng) => ({ ratedPowerKw: randFloat(rng, 5, 200, 1), speedPct: pick(rng, [60, 65, 70, 75, 80, 85]) }),
      compute: ({ ratedPowerKw, speedPct }) => {
        const reducedPower = ratedPowerKw * Math.pow(speedPct / 100, 3);
        return { formatted: num(reducedPower, "kW", 2), value: reducedPower };
      },
      question: ({ ratedPowerKw, speedPct }) =>
        `A pump motor rated at ${ratedPowerKw} kW at full speed is run at ${speedPct}% speed using a VFD. Using the fan/pump affinity law that power varies with the cube of speed, what is the approximate power drawn at this reduced speed?`,
      explanation: ({ ratedPowerKw, speedPct }, formatted) =>
        `Reduced power = Rated power x (Speed ratio)^3 = ${ratedPowerKw} x (${speedPct}/100)^3 = approximately ${formatted}.`,
      distractors: ({ ratedPowerKw, speedPct }, result, rng) => [
        num(ratedPowerKw * (speedPct / 100), "kW", 2),
        num(result.value * 2, "kW", 2),
        num(near(result.value, 0.3, rng), "kW", 2),
      ],
    },
  },
  {
    name: "lighting-schedule-energy-savings",
    weight: 5,
    spec: {
      discipline: D, topic: "HVAC & Lighting Control Integration", subtopic: "Scheduling Savings", tags: ["calculation", "estimation"], difficulty: "Intermediate",
      gen: (rng) => ({ loadKw: randFloat(rng, 5, 150, 1), hoursSaved: randInt(rng, 1, 6), rate: randFloat(rng, 6, 11, 1) }),
      compute: ({ loadKw, hoursSaved, rate }) => ({
        formatted: `Rs ${Math.round(loadKw * hoursSaved * rate * 30).toLocaleString("en-IN")} / month`,
        value: loadKw * hoursSaved * rate * 30,
      }),
      question: ({ loadKw, hoursSaved, rate }) =>
        `An occupancy-based lighting/HVAC schedule implemented via the BMS reduces run time by ${hoursSaved} hours per day for a connected load of ${loadKw} kW, at an electricity tariff of Rs ${rate} per kWh. What is the approximate monthly (30-day) cost saving?`,
      explanation: ({ loadKw, hoursSaved, rate }, formatted) =>
        `Monthly saving = Load x Hours saved per day x Tariff x 30 days = ${loadKw} x ${hoursSaved} x ${rate} x 30 = approximately ${formatted}.`,
      distractors: ({ loadKw, hoursSaved, rate }, result, rng) => [
        `Rs ${Math.round(result.value / 2).toLocaleString("en-IN")} / month`,
        `Rs ${Math.round(result.value * 1.6).toLocaleString("en-IN")} / month`,
        `Rs ${Math.round(near(result.value, 0.25, rng)).toLocaleString("en-IN")} / month`,
      ],
    },
  },
  {
    name: "bms-boq-cost",
    weight: 5,
    spec: {
      discipline: D, topic: "BMS BOQ & Estimation", subtopic: "Rate Analysis", tags: ["calculation", "estimation"], difficulty: "Basic",
      gen: (rng) => ({ qty: randInt(rng, 5, 400), rate: randInt(rng, 1200, 45000), unit: pick(rng, ["point", "nos", "m"]) }),
      compute: ({ qty, rate }) => ({ formatted: `Rs ${(qty * rate).toLocaleString("en-IN")}`, value: qty * rate }),
      question: ({ qty, rate, unit }) =>
        `A BMS BOQ item has a measured quantity of ${qty} ${unit} at a finalized rate of Rs ${rate} per ${unit}. What is the total cost for this BOQ item?`,
      explanation: ({ qty, rate }, formatted) => `Total cost = Quantity x Rate = ${qty} x ${rate} = ${formatted}.`,
      distractors: ({ qty, rate }, result, rng) => [
        `Rs ${Math.round(result.value / 2).toLocaleString("en-IN")}`,
        `Rs ${Math.round(result.value * 1.5).toLocaleString("en-IN")}`,
        `Rs ${Math.round(near(result.value, 0.25, rng)).toLocaleString("en-IN")}`,
      ],
    },
  },
  {
    name: "sensor-count-from-zones",
    weight: 4,
    spec: {
      discipline: D, topic: "Controllers & Field Devices", subtopic: "Sensor Planning", tags: ["calculation"], difficulty: "Basic",
      gen: (rng) => ({ floors: randInt(rng, 2, 40), zonesPerFloor: randInt(rng, 2, 10) }),
      compute: ({ floors, zonesPerFloor }) => ({ formatted: `${floors * zonesPerFloor} sensors`, value: floors * zonesPerFloor }),
      question: ({ floors, zonesPerFloor }) =>
        `A building has ${floors} floors, each divided into ${zonesPerFloor} HVAC control zones, with one temperature sensor required per zone. How many temperature sensors are needed in total?`,
      explanation: ({ floors, zonesPerFloor }, formatted) => `Total sensors = Floors x Zones per floor = ${floors} x ${zonesPerFloor} = ${formatted}.`,
      distractors: ({ floors, zonesPerFloor }, result, rng) => [
        `${Math.max(1, Math.round(result.value / 2))} sensors`,
        `${Math.round(result.value * 1.6)} sensors`,
        `${Math.max(1, Math.round(near(result.value, 0.3, rng)))} sensors`,
      ],
    },
  },
  {
    name: "gateway-point-capacity-check",
    weight: 4,
    spec: {
      discipline: D, topic: "Communication Protocols", subtopic: "Gateway Sizing", tags: ["calculation"], difficulty: "Intermediate",
      gen: (rng) => ({ requiredPoints: randInt(rng, 20, 900), gatewayCapacity: pick(rng, [128, 256, 512, 1000]) }),
      compute: ({ requiredPoints, gatewayCapacity }) => ({
        formatted: requiredPoints <= gatewayCapacity ? "Sufficient - single gateway adequate" : "Not sufficient - additional gateway(s) required",
        value: requiredPoints <= gatewayCapacity,
      }),
      question: ({ requiredPoints, gatewayCapacity }) =>
        `A third-party chiller plant requires integration of ${requiredPoints} data points into the BMS via a Modbus-to-BACnet gateway rated for a maximum capacity of ${gatewayCapacity} points. Is a single gateway sufficient for this integration?`,
      explanation: ({ requiredPoints, gatewayCapacity }, formatted) =>
        `Compare required points (${requiredPoints}) against gateway capacity (${gatewayCapacity}). Since ${requiredPoints} ${requiredPoints <= gatewayCapacity ? "does not exceed" : "exceeds"} ${gatewayCapacity}, the answer is: ${formatted}.`,
      distractors: ({ requiredPoints, gatewayCapacity }, result) => {
        const opposite = result.value ? "Not sufficient - additional gateway(s) required" : "Sufficient - single gateway adequate";
        return [opposite, "Cannot be determined without knowing the protocol", "Sufficient, but only for read-only points"];
      },
    },
  },
];

export function generateBMS() {
  const conceptual = roundRobinTrim(buildFromFactBank(FACTS, D), CONCEPTUAL_TARGET, (q) => q.topic);
  const calcTarget = TARGET - conceptual.length;
  const calc = buildCalcSet(CALC_TEMPLATES, calcTarget, "bms");
  return [...conceptual, ...calc].slice(0, TARGET);
}
