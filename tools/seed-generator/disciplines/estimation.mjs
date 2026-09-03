import { randInt, randFloat, pick } from "../lib/rng.mjs";
import { buildFromFactBank, buildCalcSet, roundRobinTrim } from "../lib/engine.mjs";

const D = "MEP Estimation";
const TARGET = 400;
const CONCEPTUAL_TARGET = 120;

const FACTS = [
  // BOQ & Quantity Take-off Fundamentals
  { term: "Bill of Quantities (BOQ)", topic: "BOQ & Quantity Take-off Fundamentals", difficulty: "Basic", tags: ["boq"],
    definition: "A document listing construction or MEP work items with quantities, used as a basis for pricing and payment.",
    function: "To provide a standardized basis for contractors to price work and for owners to compare bids and manage payments.",
    fact: "A BOQ is typically prepared from detailed drawings and specifications to ensure quantities accurately reflect the design." },
  { term: "Quantity Take-off (QTO)", topic: "BOQ & Quantity Take-off Fundamentals", difficulty: "Basic", tags: ["boq"],
    definition: "The process of measuring and listing material quantities from drawings for estimation purposes.",
    function: "To convert design drawings into measurable quantities that form the basis of a cost estimate or BOQ.",
    fact: "Quantity take-off accuracy directly affects the reliability of the resulting cost estimate." },
  { term: "Provisional Quantity", topic: "BOQ & Quantity Take-off Fundamentals", difficulty: "Intermediate", tags: ["boq"],
    definition: "An estimated quantity included in a BOQ for an item whose exact quantity cannot be finalized before construction.",
    function: "To allow pricing of an item at a unit rate while its final quantity is confirmed during execution and remeasured.",
    fact: "Provisional quantities are typically remeasured against actual as-built quantities for final payment." },
  { term: "Provisional Sum", topic: "BOQ & Quantity Take-off Fundamentals", difficulty: "Intermediate", tags: ["boq"],
    definition: "A lump sum amount included in a BOQ for work that cannot be sufficiently detailed or priced at tender stage.",
    function: "To reserve budget for undefined or uncertain scope items while keeping the overall BOQ structured.",
    fact: "Provisional sums are typically expended based on actual instructions and are adjusted at final account stage." },
  { term: "As-Built Drawings", topic: "BOQ & Quantity Take-off Fundamentals", difficulty: "Basic", tags: ["boq"],
    definition: "Drawings revised to reflect the actual installed condition of the work, as opposed to the original design intent.",
    function: "To provide an accurate record of what was actually constructed, which may differ from original design drawings.",
    fact: "As-built drawings are typically required for final measurement, handover documentation, and facility management use." },

  // Rate Analysis & Costing
  { term: "Rate Analysis", topic: "Rate Analysis & Costing", difficulty: "Intermediate", tags: ["rate-analysis"],
    definition: "A detailed breakdown of the cost components - material, labour, and overheads - that make up a unit rate for a BOQ item.",
    function: "To justify and validate a quoted unit rate and understand its cost composition.",
    fact: "A typical rate analysis separates material cost, labour cost, and a percentage markup for overheads and profit." },
  { term: "Unit Rate", topic: "Rate Analysis & Costing", difficulty: "Basic", tags: ["rate-analysis"],
    definition: "The price for one unit of measurement of a specific BOQ item, such as per metre, per kg, or per number.",
    function: "To provide a standardized basis for pricing and comparing quantities of the same item across bids.",
    fact: "Unit rates are typically multiplied by measured quantities to calculate the total price for a BOQ item." },
  { term: "Overheads (Estimation)", topic: "Rate Analysis & Costing", difficulty: "Intermediate", tags: ["rate-analysis"],
    definition: "Indirect costs of running a project or business that cannot be directly attributed to a specific work item, such as site establishment.",
    function: "To ensure indirect costs of executing the work are recovered within the overall pricing.",
    fact: "Overheads are commonly expressed as a percentage addition on top of direct material and labour costs." },
  { term: "Contractor's Profit Margin", topic: "Rate Analysis & Costing", difficulty: "Basic", tags: ["rate-analysis"],
    definition: "The percentage markup a contractor adds to their costs to earn a return on the work performed.",
    function: "To ensure the contractor earns a reasonable return for undertaking the risk and effort of executing the work.",
    fact: "Profit margin is typically added as a percentage on top of the total direct and indirect cost of an item." },
  { term: "Wastage Factor", topic: "Rate Analysis & Costing", difficulty: "Intermediate", tags: ["rate-analysis"],
    definition: "An allowance added to material quantities in an estimate to account for cutting losses, breakage, and installation wastage.",
    function: "To ensure the estimated material quantity is sufficient to complete the work after accounting for practical losses.",
    fact: "Wastage factors vary by material type, with items like cable and sheet metal often carrying different standard allowances." },
  { term: "Supply-Only Rate", topic: "Rate Analysis & Costing", difficulty: "Basic", tags: ["rate-analysis"],
    definition: "A unit rate covering only the cost of material supply, excluding installation, testing, and commissioning.",
    function: "To separately identify material cost when installation is provided by a different party or under a different scope.",
    fact: "Supply-only rates are commonly used when free-issue material arrangements or split scopes are part of a contract." },

  // Electrical Estimation
  { term: "Electrical Rate Analysis", topic: "Electrical Estimation", difficulty: "Intermediate", tags: ["electrical-estimation"],
    definition: "A cost breakdown for electrical BOQ items covering cable, panels, fittings, labour, and testing.",
    function: "To establish and justify unit rates for electrical works BOQ items.",
    fact: "Electrical rate analysis typically separates cable supply cost from laying, termination, and testing labour cost." },
  { term: "Cable Schedule", topic: "Electrical Estimation", difficulty: "Basic", tags: ["electrical-estimation"],
    definition: "A document listing all cables in a project with details such as size, length, route, and connected equipment.",
    function: "To provide a clear reference for cable procurement, installation, and verification against design.",
    fact: "A cable schedule is commonly cross-checked against single line diagrams to ensure all feeders are accounted for." },
  { term: "Panel Pricing (Estimation)", topic: "Electrical Estimation", difficulty: "Intermediate", tags: ["electrical-estimation"],
    definition: "The process of estimating the cost of an electrical panel based on its bill of components, busbar rating, and form of construction.",
    function: "To establish an accurate budget or quoted price for a custom-built electrical panel.",
    fact: "Panel pricing typically includes the enclosure, busbars, breakers, and internal wiring as separate cost components." },

  // HVAC Estimation
  { term: "Ducting Take-off (Estimation)", topic: "HVAC Estimation", difficulty: "Intermediate", tags: ["hvac-estimation"],
    definition: "The measurement of ductwork surface area or fabricated weight from drawings for HVAC estimation purposes.",
    function: "To determine sheet metal and insulation quantities required for pricing an HVAC ducting package.",
    fact: "Ducting take-off may be measured either by surface area (sq.m) or fabricated weight (kg), depending on the estimation convention used." },
  { term: "HVAC Equipment Pricing", topic: "HVAC Estimation", difficulty: "Basic", tags: ["hvac-estimation"],
    definition: "The process of estimating or quoting the cost of HVAC equipment such as chillers, AHUs, and pumps based on technical specifications.",
    function: "To establish a budget or quoted price for HVAC equipment matching the specified capacity and features.",
    fact: "HVAC equipment pricing is typically obtained from vendor quotations based on a detailed technical data sheet." },
  { term: "Insulation Estimation (HVAC)", topic: "HVAC Estimation", difficulty: "Intermediate", tags: ["hvac-estimation"],
    definition: "The process of estimating the quantity and cost of thermal insulation required for ductwork and piping.",
    function: "To ensure adequate budget is allocated for insulation material and application labour in an HVAC estimate.",
    fact: "Insulation estimation typically considers surface area, thickness, and material type specified for each service." },

  // Fire Fighting Estimation
  { term: "Fire Fighting Pricing", topic: "Fire Fighting Estimation", difficulty: "Intermediate", tags: ["fire-estimation"],
    definition: "The process of estimating the cost of fire fighting pipework, pumps, sprinklers, and hydrants based on a hydraulically designed layout.",
    function: "To establish an accurate budget or quoted price for a complete fire fighting works package.",
    fact: "Fire fighting pricing typically requires a hydraulically calculated design to ensure pump and pipe sizes, and hence costs, are accurate." },
  { term: "Sprinkler Estimation", topic: "Fire Fighting Estimation", difficulty: "Intermediate", tags: ["fire-estimation"],
    definition: "The process of estimating quantities and costs for sprinkler heads, pipework, and valves based on hazard classification and layout.",
    function: "To ensure adequate budget is allocated for a complete, code-compliant sprinkler installation.",
    fact: "Sprinkler estimation quantities depend heavily on the hazard classification, which determines head spacing and density requirements." },

  // Plumbing Estimation
  { term: "Plumbing Fixture Pricing", topic: "Plumbing Estimation", difficulty: "Basic", tags: ["plumbing-estimation"],
    definition: "The process of estimating the cost of plumbing fixtures, such as WCs, wash basins, and faucets, based on specified models and finishes.",
    function: "To establish an accurate budget or quoted price for plumbing fixtures matching the specified quality and brand.",
    fact: "Plumbing fixture pricing can vary significantly based on brand, finish, and model even for functionally similar items." },
  { term: "Drainage Pipe Estimation", topic: "Plumbing Estimation", difficulty: "Intermediate", tags: ["plumbing-estimation"],
    definition: "The process of estimating quantities and costs of drainage pipework based on layout, gradient, and pipe material.",
    function: "To ensure adequate budget is allocated for a complete drainage installation matching the design layout.",
    fact: "Drainage pipe estimation typically accounts for fittings such as bends, tees, and access points in addition to straight pipe lengths." },

  // ELV & BMS Estimation
  { term: "ELV System Pricing", topic: "ELV & BMS Estimation", difficulty: "Intermediate", tags: ["elv-estimation"],
    definition: "The process of estimating the cost of ELV systems such as CCTV, access control, and fire alarm based on point counts and equipment specifications.",
    function: "To establish an accurate budget or quoted price for a complete ELV system installation.",
    fact: "ELV system pricing typically separates equipment cost, such as cameras and panels, from cabling and installation labour cost." },
  { term: "BMS Points-Based Pricing", topic: "ELV & BMS Estimation", difficulty: "Intermediate", tags: ["bms-estimation"],
    definition: "A method of estimating BMS cost based on the total number of I/O points multiplied by an average cost per point.",
    function: "To provide a quick preliminary cost estimate for BMS scope before detailed engineering is complete.",
    fact: "Points-based BMS pricing is typically used for preliminary budgeting, with detailed rate analysis following after the final points list is confirmed." },

  // Drawing & Specification Interpretation
  { term: "Order of Precedence", topic: "Drawing & Specification Interpretation", difficulty: "Advanced", tags: ["contracts"],
    definition: "A contractually defined hierarchy determining which document governs in case of a conflict, such as specification over drawing.",
    function: "To resolve conflicts between different contract documents in a consistent, pre-agreed manner.",
    fact: "Order of precedence is typically defined explicitly in the contract conditions to avoid disputes over conflicting documents." },
  { term: "Scope Gap", topic: "Drawing & Specification Interpretation", difficulty: "Intermediate", tags: ["contracts"],
    definition: "An item of work that is not clearly assigned to any contractor's scope, falling between different trade packages.",
    function: "To highlight coordination risks where work might be omitted if not clearly assigned to a responsible party.",
    fact: "Scope gaps are commonly identified during tender clarification or coordination meetings between MEP disciplines." },
  { term: "Technical Specification", topic: "Drawing & Specification Interpretation", difficulty: "Basic", tags: ["contracts"],
    definition: "A document describing the required quality, performance, and standards for materials and workmanship in a project.",
    function: "To define the qualitative requirements that BOQ quantities alone cannot capture, ensuring appropriate quality of execution.",
    fact: "A specification is typically read together with the BOQ and drawings, since quantities alone do not define material quality." },
  { term: "Deviation/Exclusion List", topic: "Drawing & Specification Interpretation", difficulty: "Intermediate", tags: ["contracts"],
    definition: "A document listing items or requirements a bidder has deviated from or excluded from their offer, relative to the tender documents.",
    function: "To transparently disclose gaps between an offer and the tender requirements for client evaluation before award.",
    fact: "An undisclosed deviation discovered after contract award can lead to disputes over scope and additional costs." },

  // Tendering, Queries & Scope Management
  { term: "Pre-Bid Query", topic: "Tendering, Queries & Scope Management", difficulty: "Basic", tags: ["tendering"],
    definition: "A clarification question raised by a bidder before tender submission regarding ambiguous or incomplete tender documents.",
    function: "To resolve ambiguities before bid submission, ensuring bids are prepared on a common, clear understanding of scope.",
    fact: "Pre-bid query responses are typically issued to all bidders to maintain a fair and transparent tendering process." },
  { term: "Post-Bid Query", topic: "Tendering, Queries & Scope Management", difficulty: "Intermediate", tags: ["tendering"],
    definition: "A clarification question raised after bid submission, typically during technical or commercial evaluation.",
    function: "To resolve ambiguities or seek additional information from a specific bidder during the evaluation process.",
    fact: "Post-bid queries should be handled carefully to avoid giving any bidder an unfair advantage during evaluation." },
  { term: "Technical Bid Evaluation (Estimation)", topic: "Tendering, Queries & Scope Management", difficulty: "Intermediate", tags: ["tendering"],
    definition: "The process of comparing bidders' technical submissions against specifications to confirm compliance before commercial comparison.",
    function: "To ensure only technically compliant bids proceed to commercial evaluation and final award.",
    fact: "In a two-envelope tender system, technical evaluation is typically completed before commercial bids are opened." },
  { term: "Letter of Intent (LOI)", topic: "Tendering, Queries & Scope Management", difficulty: "Basic", tags: ["tendering"],
    definition: "A document issued to a selected bidder indicating the intent to award a contract, often pending finalization of formal contract terms.",
    function: "To allow project mobilization to begin while formal contract documentation is being finalized.",
    fact: "An LOI typically precedes the formal contract agreement but may itself carry contractual weight depending on its wording." },

  // Measurement Principles
  { term: "Net Measurement", topic: "Measurement Principles", difficulty: "Intermediate", tags: ["measurement"],
    definition: "A measurement method that records only the actual, net quantity of work executed, without allowances for laps or wastage.",
    function: "To ensure payment is based strictly on the actual quantity of work in place, per agreed measurement rules.",
    fact: "Net measurement principles are commonly defined in the method of measurement referenced by the contract." },
  { term: "Method of Measurement", topic: "Measurement Principles", difficulty: "Basic", tags: ["measurement"],
    definition: "A standardized set of rules defining how different types of work should be measured for BOQ and payment purposes.",
    function: "To ensure consistent, unambiguous measurement of quantities between the contractor and the client or consultant.",
    fact: "Using a standardized method of measurement helps avoid disputes over how a particular item should be measured." },
  { term: "Running Account (RA) Bill", topic: "Measurement Principles", difficulty: "Basic", tags: ["measurement"],
    definition: "An interim payment claim submitted by a contractor for work completed up to a certain date, subject to certification.",
    function: "To allow contractors to receive periodic payment for work progressively completed during the course of a project.",
    fact: "RA bills are typically certified by the consultant based on measured work-in-place before payment is released." },
  { term: "Final Bill", topic: "Measurement Principles", difficulty: "Intermediate", tags: ["measurement"],
    definition: "The final measurement and payment claim submitted by a contractor at the completion of a project, incorporating all variations.",
    function: "To settle the total value of work executed, including all approved variations, at project completion.",
    fact: "A final bill typically requires reconciliation of all provisional quantities and sums against actual measured work." },
];

const num = (n, unit, decimals = 2) => `${Number(n.toFixed(decimals)).toLocaleString("en-IN")} ${unit}`;
const rupee = (n) => `Rs ${Math.round(n).toLocaleString("en-IN")}`;
const near = (v, pct, rng) => v * (1 + (rng() * 2 - 1) * pct);

const CALC_TEMPLATES = [
  {
    name: "material-cost-with-wastage",
    weight: 7,
    spec: {
      discipline: D, topic: "Rate Analysis & Costing", subtopic: "Wastage Allowance", tags: ["calculation"], difficulty: "Intermediate",
      gen: (rng) => ({ qty: randInt(rng, 50, 3000), wastagePct: pick(rng, [2, 3, 5, 7, 10]), rate: randInt(rng, 40, 2000) }),
      compute: ({ qty, wastagePct, rate }) => {
        const total = qty * (1 + wastagePct / 100) * rate;
        return { formatted: rupee(total), value: total };
      },
      question: ({ qty, wastagePct, rate }) =>
        `A material take-off shows a net requirement of ${qty} units. Applying a standard wastage allowance of ${wastagePct}% and a unit rate of Rs ${rate}, what is the approximate total material cost to be estimated?`,
      explanation: ({ qty, wastagePct, rate }, formatted) =>
        `Total cost = Net quantity x (1 + wastage%) x Rate = ${qty} x (1 + ${wastagePct}%) x ${rate} = approximately ${formatted}.`,
      distractors: ({ qty, rate }, result, rng) => [
        rupee(qty * rate),
        rupee(result.value * 1.5),
        rupee(near(result.value, 0.25, rng)),
      ],
    },
  },
  {
    name: "labour-cost-estimate",
    weight: 5,
    spec: {
      discipline: D, topic: "Rate Analysis & Costing", subtopic: "Labour Cost", tags: ["calculation"], difficulty: "Intermediate",
      gen: (rng) => ({ manDays: randInt(rng, 10, 800), ratePerDay: randInt(rng, 500, 1800) }),
      compute: ({ manDays, ratePerDay }) => ({ formatted: rupee(manDays * ratePerDay), value: manDays * ratePerDay }),
      question: ({ manDays, ratePerDay }) =>
        `An installation activity is estimated to require ${manDays} man-days of labour at a rate of Rs ${ratePerDay} per man-day. What is the total estimated labour cost?`,
      explanation: ({ manDays, ratePerDay }, formatted) => `Total labour cost = Man-days x Rate per man-day = ${manDays} x ${ratePerDay} = ${formatted}.`,
      distractors: ({ manDays, ratePerDay }, result, rng) => [
        rupee(result.value / 2),
        rupee(result.value * 1.6),
        rupee(near(result.value, 0.25, rng)),
      ],
    },
  },
  {
    name: "overhead-profit-addition",
    weight: 6,
    spec: {
      discipline: D, topic: "Rate Analysis & Costing", subtopic: "Overheads and Profit", tags: ["calculation"], difficulty: "Advanced",
      gen: (rng) => ({ baseCost: randInt(rng, 5000, 500000), overheadPct: pick(rng, [8, 10, 12, 15]), profitPct: pick(rng, [8, 10, 12]) }),
      compute: ({ baseCost, overheadPct, profitPct }) => {
        const total = baseCost * (1 + overheadPct / 100) * (1 + profitPct / 100);
        return { formatted: rupee(total), value: total };
      },
      question: ({ baseCost, overheadPct, profitPct }) =>
        `An item's direct cost (material plus labour) is Rs ${baseCost.toLocaleString("en-IN")}. Applying ${overheadPct}% overheads and then ${profitPct}% profit margin on the resulting cost, what is the approximate final quoted price?`,
      explanation: ({ baseCost, overheadPct, profitPct }, formatted) =>
        `Final price = Base cost x (1 + overhead%) x (1 + profit%) = ${baseCost.toLocaleString("en-IN")} x (1 + ${overheadPct}%) x (1 + ${profitPct}%) = approximately ${formatted}.`,
      distractors: ({ baseCost, overheadPct, profitPct }, result, rng) => [
        rupee(baseCost * (1 + (overheadPct + profitPct) / 100)),
        rupee(result.value * 1.4),
        rupee(near(result.value, 0.2, rng)),
      ],
    },
  },
  {
    name: "quantity-variance-percent",
    weight: 5,
    spec: {
      discipline: D, topic: "Measurement Principles", subtopic: "Quantity Variance", tags: ["calculation"], difficulty: "Intermediate",
      gen: (rng) => ({ estimated: randInt(rng, 100, 5000), actual: randInt(rng, 100, 5000) }),
      compute: ({ estimated, actual }) => {
        const variance = ((actual - estimated) / estimated) * 100;
        return { formatted: `${variance >= 0 ? "+" : ""}${variance.toFixed(1)}%`, value: variance };
      },
      question: ({ estimated, actual }) =>
        `A BOQ item had an estimated quantity of ${estimated} units, but the actual measured quantity upon completion was ${actual} units. What is the percentage variance between actual and estimated quantity?`,
      explanation: ({ estimated, actual }, formatted) =>
        `Variance % = ((Actual - Estimated) / Estimated) x 100 = ((${actual} - ${estimated}) / ${estimated}) x 100 = ${formatted}.`,
      distractors: ({ estimated, actual }, result, rng) => [
        `${(((actual - estimated) / actual) * 100).toFixed(1)}%`,
        `${(result.value * 2).toFixed(1)}%`,
        `${near(result.value === 0 ? 5 : result.value, 0.3, rng).toFixed(1)}%`,
      ],
    },
  },
  {
    name: "escalation-cost",
    weight: 4,
    spec: {
      discipline: D, topic: "Rate Analysis & Costing", subtopic: "Price Escalation", tags: ["calculation"], difficulty: "Intermediate",
      gen: (rng) => ({ baseCost: randInt(rng, 50000, 2000000), escalationPct: randFloat(rng, 2, 12, 1) }),
      compute: ({ baseCost, escalationPct }) => ({ formatted: rupee(baseCost * (escalationPct / 100)), value: baseCost * (escalationPct / 100) }),
      question: ({ baseCost, escalationPct }) =>
        `A material's base cost in a BOQ was Rs ${baseCost.toLocaleString("en-IN")}. Due to market conditions, a price escalation of ${escalationPct}% is applicable. What is the approximate additional cost due to escalation?`,
      explanation: ({ baseCost, escalationPct }, formatted) =>
        `Escalation amount = Base cost x Escalation% = ${baseCost.toLocaleString("en-IN")} x ${escalationPct}% = approximately ${formatted}.`,
      distractors: ({ baseCost, escalationPct }, result, rng) => [
        rupee(baseCost * (1 + escalationPct / 100)),
        rupee(result.value * 2),
        rupee(near(result.value, 0.3, rng)),
      ],
    },
  },
  {
    name: "boq-item-total-with-tax",
    weight: 6,
    spec: {
      discipline: D, topic: "BOQ & Quantity Take-off Fundamentals", subtopic: "BOQ Total with Tax", tags: ["calculation"], difficulty: "Basic",
      gen: (rng) => ({ qty: randInt(rng, 10, 900), rate: randInt(rng, 200, 8000), gst: pick(rng, [5, 12, 18]) }),
      compute: ({ qty, rate, gst }) => {
        const base = qty * rate;
        const total = base * (1 + gst / 100);
        return { formatted: rupee(total), value: total };
      },
      question: ({ qty, rate, gst }) =>
        `A BOQ item has a quantity of ${qty} units at a rate of Rs ${rate} per unit, excluding tax. Including GST at ${gst}%, what is the approximate total payable amount for this item?`,
      explanation: ({ qty, rate, gst }, formatted) =>
        `Total payable = (Quantity x Rate) x (1 + GST%) = (${qty} x ${rate}) x (1 + ${gst}%) = approximately ${formatted}.`,
      distractors: ({ qty, rate, gst }, result, rng) => [
        rupee(qty * rate),
        rupee(result.value * 1.3),
        rupee(near(result.value, 0.2, rng)),
      ],
    },
  },
  {
    name: "contingency-allowance",
    weight: 4,
    spec: {
      discipline: D, topic: "Rate Analysis & Costing", subtopic: "Contingency", tags: ["calculation"], difficulty: "Basic",
      gen: (rng) => ({ totalCost: randInt(rng, 100000, 5000000), contingencyPct: pick(rng, [3, 5, 7, 10]) }),
      compute: ({ totalCost, contingencyPct }) => ({ formatted: rupee(totalCost * (contingencyPct / 100)), value: totalCost * (contingencyPct / 100) }),
      question: ({ totalCost, contingencyPct }) =>
        `A project's estimated MEP cost is Rs ${totalCost.toLocaleString("en-IN")}. If a contingency allowance of ${contingencyPct}% is included, what is the approximate contingency amount?`,
      explanation: ({ totalCost, contingencyPct }, formatted) =>
        `Contingency amount = Total estimated cost x Contingency% = ${totalCost.toLocaleString("en-IN")} x ${contingencyPct}% = approximately ${formatted}.`,
      distractors: ({ totalCost, contingencyPct }, result, rng) => [
        rupee(totalCost * (1 + contingencyPct / 100)),
        rupee(result.value * 2),
        rupee(near(result.value, 0.3, rng)),
      ],
    },
  },
  {
    name: "ra-bill-payment-value",
    weight: 5,
    spec: {
      discipline: D, topic: "Measurement Principles", subtopic: "RA Bill Calculation", tags: ["calculation"], difficulty: "Advanced",
      gen: (rng) => ({ contractValue: randInt(rng, 500000, 30000000), workDonePct: pick(rng, [10, 20, 30, 40, 50, 60, 75]), retentionPct: pick(rng, [5, 10]) }),
      compute: ({ contractValue, workDonePct, retentionPct }) => {
        const workValue = contractValue * (workDonePct / 100);
        const payable = workValue * (1 - retentionPct / 100);
        return { formatted: rupee(payable), value: payable };
      },
      question: ({ contractValue, workDonePct, retentionPct }) =>
        `A contract is valued at Rs ${contractValue.toLocaleString("en-IN")}. The contractor has completed ${workDonePct}% of the work, and a retention of ${retentionPct}% is deducted from each running account bill. What is the approximate net RA bill payment due?`,
      explanation: ({ contractValue, workDonePct, retentionPct }, formatted) =>
        `Work value = Contract value x Work done% = ${contractValue.toLocaleString("en-IN")} x ${workDonePct}%. Net payable = Work value x (1 - Retention%) = approximately ${formatted}.`,
      distractors: ({ contractValue, workDonePct, retentionPct }, result, rng) => [
        rupee(contractValue * (workDonePct / 100)),
        rupee(result.value * 1.3),
        rupee(near(result.value, 0.2, rng)),
      ],
    },
  },
  {
    name: "cost-per-sqft",
    weight: 4,
    spec: {
      discipline: D, topic: "BOQ & Quantity Take-off Fundamentals", subtopic: "Cost Benchmarking", tags: ["calculation"], difficulty: "Intermediate",
      gen: (rng) => ({ totalCost: randInt(rng, 500000, 50000000), area: randInt(rng, 5000, 500000) }),
      compute: ({ totalCost, area }) => ({ formatted: rupee(totalCost / area) + " per sq.ft", value: totalCost / area }),
      question: ({ totalCost, area }) =>
        `A building's total MEP works cost is Rs ${totalCost.toLocaleString("en-IN")} for a built-up area of ${area.toLocaleString("en-IN")} sq.ft. What is the approximate MEP cost per square foot, a common benchmarking metric?`,
      explanation: ({ totalCost, area }, formatted) =>
        `Cost per sq.ft = Total cost / Built-up area = ${totalCost.toLocaleString("en-IN")} / ${area.toLocaleString("en-IN")} = approximately ${formatted}.`,
      distractors: ({ totalCost, area }, result, rng) => [
        rupee(result.value * 2) + " per sq.ft",
        rupee(result.value / 2) + " per sq.ft",
        rupee(near(result.value, 0.3, rng)) + " per sq.ft",
      ],
    },
  },
  {
    name: "manpower-for-duration",
    weight: 4,
    spec: {
      discipline: D, topic: "Rate Analysis & Costing", subtopic: "Manpower Planning", tags: ["calculation"], difficulty: "Basic",
      gen: (rng) => ({ totalManDays: randInt(rng, 100, 5000), durationDays: randInt(rng, 20, 200) }),
      compute: ({ totalManDays, durationDays }) => ({ formatted: `${Math.ceil(totalManDays / durationDays)} workers/day`, value: Math.ceil(totalManDays / durationDays) }),
      question: ({ totalManDays, durationDays }) =>
        `An activity requires a total of ${totalManDays} man-days of work and must be completed within ${durationDays} working days. What is the minimum average daily workforce required?`,
      explanation: ({ totalManDays, durationDays }, formatted) =>
        `Average daily workforce = Total man-days / Duration in days, rounded up = ${totalManDays} / ${durationDays} rounded up to ${formatted}.`,
      distractors: ({ totalManDays, durationDays }, result, rng) => [
        `${Math.max(1, Math.round(result.value / 2))} workers/day`,
        `${Math.round(result.value * 1.6)} workers/day`,
        `${Math.max(1, Math.round(near(result.value, 0.3, rng)))} workers/day`,
      ],
    },
  },
];

export function generateEstimation() {
  const conceptual = roundRobinTrim(buildFromFactBank(FACTS, D), CONCEPTUAL_TARGET, (q) => q.topic);
  const calcTarget = TARGET - conceptual.length;
  const calc = buildCalcSet(CALC_TEMPLATES, calcTarget, "estimation");
  return [...conceptual, ...calc].slice(0, TARGET);
}
