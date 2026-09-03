import { randInt, randFloat, pick } from "../lib/rng.mjs";
import { buildFromFactBank, buildCalcSet, roundRobinTrim } from "../lib/engine.mjs";

const D = "HVAC";
const TARGET = 900;
const CONCEPTUAL_TARGET = 200;

const FACTS = [
  // HVAC Fundamentals & Psychrometrics
  { term: "Dry Bulb Temperature", topic: "HVAC Fundamentals & Psychrometrics", difficulty: "Basic", tags: ["psychrometrics"],
    definition: "The temperature of air measured by a standard thermometer without accounting for its moisture content.",
    function: "To indicate the sensible temperature condition of air, used as a baseline in psychrometric calculations.",
    fact: "Dry bulb temperature is one of the two basic readings used to plot an air state point on a psychrometric chart." },
  { term: "Wet Bulb Temperature", topic: "HVAC Fundamentals & Psychrometrics", difficulty: "Basic", tags: ["psychrometrics"],
    definition: "The temperature read by a thermometer covered with a water-moistened wick exposed to airflow, reflecting evaporative cooling.",
    function: "To indicate the moisture content and cooling potential of air together with dry bulb temperature.",
    fact: "Wet bulb temperature is always equal to or lower than dry bulb temperature, except at 100% relative humidity." },
  { term: "Relative Humidity", topic: "HVAC Fundamentals & Psychrometrics", difficulty: "Basic", tags: ["psychrometrics"],
    definition: "The ratio of the actual moisture content of air to the maximum it could hold at the same temperature, expressed as a percentage.",
    function: "To indicate how close air is to saturation, affecting comfort and condensation risk.",
    fact: "Comfort air conditioning typically targets a relative humidity range of about 40-60%." },
  { term: "Sensible Heat", topic: "HVAC Fundamentals & Psychrometrics", difficulty: "Intermediate", tags: ["psychrometrics", "load"],
    definition: "Heat that changes the temperature of air without changing its moisture content.",
    function: "To represent the portion of a cooling or heating load associated with temperature change alone.",
    fact: "Sensible heat load is calculated using dry bulb temperature difference and airflow rate." },
  { term: "Latent Heat", topic: "HVAC Fundamentals & Psychrometrics", difficulty: "Intermediate", tags: ["psychrometrics", "load"],
    definition: "Heat associated with a change in the moisture content of air, such as evaporation or condensation, without a temperature change.",
    function: "To represent the portion of a cooling load associated with dehumidification.",
    fact: "Latent heat load arises mainly from occupants, infiltrated moisture, and outdoor ventilation air." },
  { term: "Sensible Heat Ratio (SHR)", topic: "HVAC Fundamentals & Psychrometrics", difficulty: "Advanced", tags: ["psychrometrics", "load"],
    definition: "The ratio of sensible heat load to total heat load, sensible plus latent, for a given space or cooling coil.",
    function: "To guide selection of a cooling coil and system type appropriate for the space's moisture and temperature loads.",
    fact: "A lower SHR indicates a higher proportion of latent (dehumidification) load relative to sensible load." },
  { term: "Psychrometric Chart", topic: "HVAC Fundamentals & Psychrometrics", difficulty: "Intermediate", tags: ["psychrometrics"],
    definition: "A graphical tool relating dry bulb temperature, humidity, enthalpy, and other air properties for HVAC calculations.",
    function: "To determine air properties and analyze cooling and heating processes graphically.",
    fact: "The psychrometric chart is commonly used to determine cooling coil load by plotting entering and leaving air conditions." },

  // Refrigeration Cycle
  { term: "Vapour Compression Cycle", topic: "Refrigeration Cycle", difficulty: "Basic", tags: ["refrigeration"],
    definition: "A refrigeration cycle using a compressor, condenser, expansion device, and evaporator, with a refrigerant that changes phase.",
    function: "To provide the basic mechanism for most air conditioning and refrigeration equipment to reject heat from a space.",
    fact: "The four main components of the vapour compression cycle are the compressor, condenser, expansion device, and evaporator." },
  { term: "Compressor (Refrigeration)", topic: "Refrigeration Cycle", difficulty: "Basic", tags: ["refrigeration"],
    definition: "A mechanical device that raises refrigerant pressure and temperature by compressing refrigerant vapour.",
    function: "To circulate refrigerant through the cycle and enable heat rejection at the condenser.",
    fact: "Common compressor types in HVAC include reciprocating, scroll, screw, and centrifugal compressors." },
  { term: "Condenser (Refrigeration)", topic: "Refrigeration Cycle", difficulty: "Basic", tags: ["refrigeration"],
    definition: "A heat exchanger where high-pressure refrigerant vapour rejects heat and condenses into liquid.",
    function: "To reject heat absorbed by the refrigerant to a cooling medium such as air or water.",
    fact: "Condensers can be air-cooled, water-cooled, or evaporative depending on the system design." },
  { term: "Evaporator (Refrigeration)", topic: "Refrigeration Cycle", difficulty: "Basic", tags: ["refrigeration"],
    definition: "A heat exchanger where low-pressure liquid refrigerant absorbs heat and evaporates into vapour, cooling the surrounding medium.",
    function: "To absorb heat from the space or fluid being cooled, producing the cooling effect.",
    fact: "The evaporator is the component directly responsible for the cooling effect delivered to the conditioned space or chilled water." },
  { term: "Expansion Valve", topic: "Refrigeration Cycle", difficulty: "Intermediate", tags: ["refrigeration"],
    definition: "A metering device that reduces refrigerant pressure and controls refrigerant flow between the condenser and evaporator.",
    function: "To regulate refrigerant flow into the evaporator matching the cooling load.",
    fact: "Thermostatic expansion valves adjust refrigerant flow based on evaporator superheat." },
  { term: "Refrigerant", topic: "Refrigeration Cycle", difficulty: "Basic", tags: ["refrigeration"],
    definition: "A working fluid used in a refrigeration cycle that absorbs and rejects heat through phase changes.",
    function: "To transfer heat within the refrigeration cycle by evaporating and condensing at controlled pressures.",
    fact: "Modern HVAC systems increasingly use lower global-warming-potential refrigerants in place of older high-GWP options." },
  { term: "Coefficient of Performance (COP)", topic: "Refrigeration Cycle", difficulty: "Intermediate", tags: ["refrigeration", "efficiency"],
    definition: "A ratio of useful cooling or heating output to the energy input required to produce it.",
    function: "To indicate the energy efficiency of a refrigeration or heat pump system.",
    fact: "A higher COP indicates a more energy-efficient refrigeration system for a given cooling output." },

  // Chillers
  { term: "Water-Cooled Chiller", topic: "Chillers", difficulty: "Basic", tags: ["chillers"],
    definition: "A chiller that rejects condenser heat to a condenser water loop connected to a cooling tower.",
    function: "To provide chilled water for building cooling while rejecting heat via a cooling tower loop, typically at higher efficiency.",
    fact: "Water-cooled chillers generally have higher efficiency than air-cooled chillers of similar capacity." },
  { term: "Air-Cooled Chiller", topic: "Chillers", difficulty: "Basic", tags: ["chillers"],
    definition: "A chiller that rejects condenser heat directly to outdoor air using fans, without a separate cooling tower.",
    function: "To provide chilled water where cooling tower water treatment or space is not desired or practical.",
    fact: "Air-cooled chillers avoid the need for a cooling tower but are typically less efficient than water-cooled chillers." },
  { term: "Centrifugal Chiller", topic: "Chillers", difficulty: "Intermediate", tags: ["chillers"],
    definition: "A chiller using a centrifugal compressor, typically suited to large cooling capacities.",
    function: "To provide efficient large-capacity chilled water cooling for commercial and industrial buildings.",
    fact: "Centrifugal chillers are commonly used for large cooling loads, often several hundred tons of refrigeration or more." },
  { term: "Screw Chiller", topic: "Chillers", difficulty: "Intermediate", tags: ["chillers"],
    definition: "A chiller using a rotary screw compressor, suited to medium-to-large cooling capacities with good part-load performance.",
    function: "To provide reliable chilled water cooling across a wide capacity range with good part-load efficiency.",
    fact: "Screw chillers are widely used in mid-to-large commercial buildings due to their reliability and part-load performance." },
  { term: "Ton of Refrigeration (TR)", topic: "Chillers", difficulty: "Basic", tags: ["chillers", "units"],
    definition: "A unit of cooling capacity where one ton of refrigeration equals approximately 3.517 kW of cooling effect.",
    function: "To express chiller and cooling load capacity in a commonly used refrigeration unit.",
    fact: "One ton of refrigeration (TR) is the approximate rate of heat absorption from melting one ton of ice in 24 hours." },
  { term: "Chiller Plant Efficiency (kW/TR)", topic: "Chillers", difficulty: "Advanced", tags: ["chillers", "efficiency"],
    definition: "A metric expressing the electrical power input required per ton of refrigeration delivered by a chiller plant.",
    function: "To benchmark and compare the energy efficiency of different chiller plants.",
    fact: "A lower kW/TR value indicates a more energy-efficient chiller plant." },
  { term: "Free Cooling (Chiller)", topic: "Chillers", difficulty: "Advanced", tags: ["chillers", "efficiency"],
    definition: "An operating mode where a chiller or plant uses low outdoor temperatures to provide cooling with reduced or no compressor operation.",
    function: "To reduce energy consumption during cooler weather by using ambient conditions instead of full mechanical cooling.",
    fact: "Free cooling is most beneficial in climates with significant periods of low outdoor temperature relative to required chilled water temperature." },

  // Air Handling Units
  { term: "Air Handling Unit (AHU)", topic: "Air Handling Units", difficulty: "Basic", tags: ["ahu"],
    definition: "An equipment assembly containing a fan, cooling/heating coil, and filters, used to condition and circulate air through ductwork.",
    function: "To supply conditioned air to occupied spaces via a ducted distribution system.",
    fact: "AHUs typically include a supply fan, cooling coil, filter section, and sometimes a heating coil and humidifier." },
  { term: "Fresh Air Handling Unit (FAHU)", topic: "Air Handling Units", difficulty: "Intermediate", tags: ["ahu"],
    definition: "An air handling unit dedicated to conditioning and supplying outdoor fresh air, often pre-treating it before mixing with recirculated air.",
    function: "To provide adequate outdoor air ventilation while pre-conditioning it to reduce load on terminal units.",
    fact: "FAHUs help decouple the ventilation load from the sensible cooling load handled by terminal units like FCUs." },
  { term: "Fan Coil Unit (FCU)", topic: "Air Handling Units", difficulty: "Basic", tags: ["fcu"],
    definition: "A compact terminal unit containing a fan and a cooling/heating coil, used to condition air locally in a zone.",
    function: "To provide zone-level temperature control by circulating room air across a chilled or hot water coil.",
    fact: "FCUs are commonly used in hotel rooms, offices, and residential buildings for zone-wise comfort control." },
  { term: "Cooling Coil", topic: "Air Handling Units", difficulty: "Intermediate", tags: ["ahu"],
    definition: "A heat exchanger coil within an AHU or FCU through which chilled water or refrigerant flows to cool and dehumidify passing air.",
    function: "To remove sensible and latent heat from air passing through an air handling unit or fan coil unit.",
    fact: "Cooling coils are typically sized based on required sensible and latent cooling capacity and design air quantity." },
  { term: "Air Filter (HVAC)", topic: "Air Handling Units", difficulty: "Basic", tags: ["ahu"],
    definition: "A component within an AHU that removes particulate matter from air before it is supplied to occupied spaces.",
    function: "To maintain acceptable indoor air quality and protect downstream coils and equipment from dust fouling.",
    fact: "Filter efficiency classes, such as G4, F7, F9, or HEPA, indicate the size range of particles the filter can effectively capture." },
  { term: "Return Air", topic: "Air Handling Units", difficulty: "Basic", tags: ["ahu"],
    definition: "Air drawn back from a conditioned space to the AHU, typically mixed with fresh air before conditioning.",
    function: "To recover conditioned air from the space, reducing the total load compared to using 100% outdoor air.",
    fact: "The proportion of return air mixed with fresh air significantly affects the total cooling load an AHU must handle." },
  { term: "AHU Static Pressure", topic: "Air Handling Units", difficulty: "Advanced", tags: ["ahu"],
    definition: "The pressure an AHU fan must generate to overcome resistance through coils, filters, and ductwork.",
    function: "To ensure the AHU can deliver the design airflow against the total system resistance.",
    fact: "AHU fan static pressure requirements increase as filters become dirty and ductwork resistance rises." },

  // VRF/VRV & DX Systems
  { term: "VRF (Variable Refrigerant Flow) System", topic: "VRF/VRV & DX Systems", difficulty: "Intermediate", tags: ["vrf"],
    definition: "An HVAC system that varies refrigerant flow to multiple indoor units from one or more outdoor units, allowing individual zone control.",
    function: "To provide flexible, zone-wise cooling and heating using a single refrigerant piping network instead of ducted chilled water.",
    fact: "Heat-recovery VRF systems can provide simultaneous heating and cooling to different indoor units on the same system." },
  { term: "DX (Direct Expansion) System", topic: "VRF/VRV & DX Systems", difficulty: "Basic", tags: ["dx"],
    definition: "An air conditioning system where the cooling coil directly evaporates refrigerant to cool air, without an intermediate chilled water loop.",
    function: "To provide cooling directly through refrigerant-to-air heat exchange, commonly used in packaged and split units.",
    fact: "DX systems are common in smaller-capacity applications where a central chilled water plant is not justified." },
  { term: "Outdoor Condensing Unit (VRF)", topic: "VRF/VRV & DX Systems", difficulty: "Intermediate", tags: ["vrf"],
    definition: "The outdoor unit of a VRF or DX system containing the compressor(s) and condenser coil, rejecting heat to outdoor air.",
    function: "To reject heat from the refrigerant cycle and supply refrigerant to connected indoor units.",
    fact: "Multiple indoor units can be connected to a single VRF outdoor condensing unit via refrigerant piping and branch controllers." },
  { term: "Branch Selector Box (VRF)", topic: "VRF/VRV & DX Systems", difficulty: "Advanced", tags: ["vrf"],
    definition: "A device in heat-recovery VRF systems that directs refrigerant flow to allow individual indoor units to heat or cool independently.",
    function: "To enable simultaneous heating and cooling operation across different zones served by the same VRF system.",
    fact: "Branch selector boxes are used only in heat-recovery type VRF systems, not in heat-pump-only VRF systems." },
  { term: "VRF Refrigerant Piping Limitations", topic: "VRF/VRV & DX Systems", difficulty: "Advanced", tags: ["vrf"],
    definition: "Manufacturer-specified limits on total pipe length, height difference, and branch length for VRF refrigerant piping.",
    function: "To ensure proper refrigerant oil return and system performance across the installed piping network.",
    fact: "Exceeding VRF refrigerant piping length or height limits can degrade performance and long-term reliability." },

  // Package & Split AC Systems
  { term: "Split AC Unit", topic: "Package & Split AC Systems", difficulty: "Basic", tags: ["split-ac"],
    definition: "An air conditioning unit with an indoor evaporator unit and an outdoor condensing unit connected by refrigerant piping.",
    function: "To provide localized cooling to a single room or small zone without ductwork.",
    fact: "Split AC units are commonly used for small offices, retail spaces, and residential rooms." },
  { term: "Ductable Split Unit", topic: "Package & Split AC Systems", difficulty: "Basic", tags: ["split-ac"],
    definition: "A split AC unit with an indoor unit designed to connect to a short duct run for distributing air to more than one outlet.",
    function: "To provide cooling to a slightly larger area than a standard split unit, through limited ductwork.",
    fact: "Ductable split units are often used for small conference rooms or shops needing multiple diffusers from one indoor unit." },
  { term: "Package Air Conditioner", topic: "Package & Split AC Systems", difficulty: "Intermediate", tags: ["package-ac"],
    definition: "A self-contained air conditioning unit combining compressor, coils, and fan in a single package, larger than typical split units.",
    function: "To provide cooling for medium-sized spaces such as server rooms, retail floors, or floor-by-floor applications.",
    fact: "Package units may be air-cooled or water-cooled and can be floor-mounted or ducted." },
  { term: "Precision Air Conditioning (PAC) Unit", topic: "Package & Split AC Systems", difficulty: "Advanced", tags: ["precision-ac"],
    definition: "A specialized air conditioning unit designed to maintain tight temperature and humidity tolerances for critical spaces such as data centers.",
    function: "To maintain stable temperature and humidity conditions required for sensitive electronic equipment.",
    fact: "Precision AC units typically offer tighter temperature and humidity control tolerances than standard comfort cooling units." },

  // Cooling Towers & Condenser Water
  { term: "Cooling Tower", topic: "Cooling Towers & Condenser Water", difficulty: "Basic", tags: ["cooling-tower"],
    definition: "A heat rejection device that cools water by evaporative contact with ambient air, typically serving water-cooled chillers.",
    function: "To reject heat from the condenser water loop to the atmosphere, enabling water-cooled chiller operation.",
    fact: "Cooling towers commonly use fill media to increase the contact area between water and air, improving heat rejection." },
  { term: "Approach Temperature (Cooling Tower)", topic: "Cooling Towers & Condenser Water", difficulty: "Advanced", tags: ["cooling-tower"],
    definition: "The difference between the cooling tower's leaving water temperature and the ambient wet bulb temperature.",
    function: "To indicate cooling tower performance relative to ambient conditions.",
    fact: "A smaller approach temperature generally indicates a larger or more efficient cooling tower for given conditions." },
  { term: "Range (Cooling Tower)", topic: "Cooling Towers & Condenser Water", difficulty: "Intermediate", tags: ["cooling-tower"],
    definition: "The difference between the water temperature entering and leaving a cooling tower.",
    function: "To indicate the amount of heat rejected by the cooling tower per unit flow.",
    fact: "Cooling tower range depends on the heat load and the condenser water flow rate." },
  { term: "Condenser Water Pump", topic: "Cooling Towers & Condenser Water", difficulty: "Basic", tags: ["pumps"],
    definition: "A pump that circulates water between the chiller condenser and the cooling tower.",
    function: "To move condenser water through the chiller and cooling tower to enable heat rejection.",
    fact: "Condenser water pumps are typically sized to overcome the pressure drop through the chiller condenser, tower, and piping." },
  { term: "Cooling Tower Drift Eliminator", topic: "Cooling Towers & Condenser Water", difficulty: "Intermediate", tags: ["cooling-tower"],
    definition: "A component in a cooling tower that reduces the carryover of water droplets in the discharged air stream.",
    function: "To minimize water loss and reduce the spread of aerosols from the cooling tower.",
    fact: "Drift eliminators help reduce water consumption and limit potential spread of waterborne contaminants." },
  { term: "Cooling Tower Water Treatment", topic: "Cooling Towers & Condenser Water", difficulty: "Advanced", tags: ["cooling-tower", "water-treatment"],
    definition: "Chemical and mechanical treatment of cooling tower water to control scaling, corrosion, and biological growth including Legionella.",
    function: "To maintain cooling tower and chiller condenser efficiency and to protect against biological hazards.",
    fact: "Poor cooling tower water treatment can result in scaling, corrosion, or Legionella growth risks." },

  // Chilled Water Systems & Pumps
  { term: "Primary-Secondary Chilled Water System", topic: "Chilled Water Systems & Pumps", difficulty: "Advanced", tags: ["chw"],
    definition: "A piping arrangement with a primary loop circulating constant flow through chillers and a secondary loop delivering variable flow to the building.",
    function: "To decouple chiller flow requirements from variable building load requirements for stable chiller operation.",
    fact: "A primary-secondary system typically uses a decoupler pipe to separate primary and secondary flow variations." },
  { term: "Primary Chilled Water Pump", topic: "Chilled Water Systems & Pumps", difficulty: "Intermediate", tags: ["chw", "pumps"],
    definition: "A pump that circulates chilled water through the chiller evaporator at a constant design flow rate.",
    function: "To maintain the constant flow rate required for stable chiller operation.",
    fact: "Primary chilled water pumps are usually sized to match a chiller's minimum required constant flow rate." },
  { term: "Secondary Chilled Water Pump", topic: "Chilled Water Systems & Pumps", difficulty: "Intermediate", tags: ["chw", "pumps"],
    definition: "A pump that circulates chilled water from the plant to air handling units and fan coil units, often with variable speed control.",
    function: "To deliver chilled water to the building distribution system, varying flow according to actual cooling demand.",
    fact: "Secondary pumps are frequently equipped with VFDs to reduce energy consumption at part-load conditions." },
  { term: "Chilled Water Delta-T", topic: "Chilled Water Systems & Pumps", difficulty: "Advanced", tags: ["chw"],
    definition: "The temperature difference between chilled water supply and return, typically around 5-7 degrees C in comfort cooling systems.",
    function: "To indicate how effectively the distribution system extracts heat from chilled water for a given flow rate.",
    fact: "A lower-than-design chilled water delta-T, known as low delta-T syndrome, can indicate coil or control problems." },
  { term: "Variable Primary Flow System", topic: "Chilled Water Systems & Pumps", difficulty: "Advanced", tags: ["chw"],
    definition: "A chilled water system where chiller flow itself varies with load, eliminating the need for separate secondary pumps.",
    function: "To simplify the pumping system and reduce pumping energy compared to a traditional primary-secondary arrangement.",
    fact: "Variable primary flow systems require chillers capable of tolerating varying evaporator flow rates." },
  { term: "Chilled Water Buffer Tank", topic: "Chilled Water Systems & Pumps", difficulty: "Advanced", tags: ["chw"],
    definition: "A storage tank in a chilled water system that provides thermal mass and helps stabilize flow during low-load conditions.",
    function: "To prevent short-cycling of chillers and stabilize system operation at very low cooling loads.",
    fact: "Buffer tanks are particularly useful in variable primary flow systems to avoid excessive chiller cycling." },

  // Valves, Strainers & Expansion Tanks
  { term: "Butterfly Valve", topic: "Valves, Strainers & Expansion Tanks", difficulty: "Basic", tags: ["valves"],
    definition: "A quarter-turn valve using a rotating disc to control flow, commonly used for isolation in HVAC piping.",
    function: "To isolate sections of chilled or condenser water piping for maintenance or system sectioning.",
    fact: "Butterfly valves are compact and cost-effective for larger pipe sizes compared to gate valves." },
  { term: "Balancing Valve", topic: "Valves, Strainers & Expansion Tanks", difficulty: "Intermediate", tags: ["valves"],
    definition: "A valve used to regulate and measure flow in a hydronic circuit to achieve designed flow distribution.",
    function: "To ensure each branch or terminal unit in a hydronic system receives its designed water flow rate.",
    fact: "Proper hydronic balancing using balancing valves helps prevent some zones from being over- or under-supplied with water." },
  { term: "Two-Way Control Valve", topic: "Valves, Strainers & Expansion Tanks", difficulty: "Intermediate", tags: ["valves"],
    definition: "A control valve that varies flow through a coil in response to a control signal, typically without a bypass.",
    function: "To modulate water flow through a coil to control the delivered heating or cooling capacity.",
    fact: "Two-way control valves are commonly used in variable-flow hydronic systems to reduce pumping energy at part load." },
  { term: "Three-Way Control Valve", topic: "Valves, Strainers & Expansion Tanks", difficulty: "Intermediate", tags: ["valves"],
    definition: "A control valve that diverts or mixes flow between a coil and a bypass path to maintain constant total system flow.",
    function: "To modulate coil capacity while maintaining a relatively constant flow rate in the piping system.",
    fact: "Three-way valves are typically associated with constant-flow hydronic systems, unlike two-way valves used in variable-flow systems." },
  { term: "Y-Strainer", topic: "Valves, Strainers & Expansion Tanks", difficulty: "Basic", tags: ["strainers"],
    definition: "A strainer with a Y-shaped body containing a removable mesh screen to remove debris from a fluid stream.",
    function: "To protect pumps, valves, and coils from debris and sediment carried in the water system.",
    fact: "Y-strainers require periodic cleaning of the screen to avoid excessive pressure drop as debris accumulates." },
  { term: "Expansion Tank", topic: "Valves, Strainers & Expansion Tanks", difficulty: "Intermediate", tags: ["expansion-tank"],
    definition: "A tank connected to a closed hydronic system that accommodates water volume changes due to temperature variation.",
    function: "To absorb the expansion and contraction of water as system temperature changes, maintaining safe system pressure.",
    fact: "Expansion tanks typically use a diaphragm or bladder to separate the water side from a pressurized air or gas cushion." },
  { term: "Pressurization Unit (HVAC)", topic: "Valves, Strainers & Expansion Tanks", difficulty: "Advanced", tags: ["expansion-tank"],
    definition: "An automatic system that maintains a set pressure in a closed hydronic circuit by adding or relieving water as needed.",
    function: "To maintain stable system pressure and prevent air ingress or excessive pressure in a closed chilled or hot water loop.",
    fact: "Pressurization units help prevent pump cavitation and air entrainment by maintaining minimum required system pressure." },

  // Ducting & Insulation
  { term: "GI Duct", topic: "Ducting & Insulation", difficulty: "Basic", tags: ["ducting"],
    definition: "Ductwork fabricated from galvanized iron sheet, widely used for HVAC air distribution.",
    function: "To convey conditioned air from AHUs to diffusers and grilles throughout a building.",
    fact: "GI ducts are commonly fabricated and jointed per sheet metal standards to control air leakage." },
  { term: "PIR Duct", topic: "Ducting & Insulation", difficulty: "Intermediate", tags: ["ducting"],
    definition: "Ductwork fabricated from pre-insulated rigid polyisocyanurate panels with factory-applied aluminium facing.",
    function: "To combine ductwork and insulation into a single lightweight panel system, reducing installation time and heat gain.",
    fact: "PIR ductwork typically eliminates the need for separate external duct insulation since it is factory pre-insulated." },
  { term: "Duct Insulation", topic: "Ducting & Insulation", difficulty: "Basic", tags: ["insulation"],
    definition: "Thermal insulation, such as fiberglass or elastomeric foam, applied to ductwork to reduce heat gain/loss and prevent condensation.",
    function: "To minimize energy loss and prevent surface condensation on duct exteriors carrying conditioned air.",
    fact: "Duct insulation thickness is typically selected based on duct location, air temperature, and ambient humidity conditions." },
  { term: "Duct Leakage", topic: "Ducting & Insulation", difficulty: "Intermediate", tags: ["ducting"],
    definition: "Air lost from ductwork through joints and seams rather than being delivered to the intended outlets.",
    function: "To highlight a key efficiency and performance issue that duct sealing and leakage testing aim to control.",
    fact: "Excessive duct leakage increases fan energy consumption and can starve some outlets of design airflow." },
  { term: "Duct Static Pressure Class", topic: "Ducting & Insulation", difficulty: "Advanced", tags: ["ducting"],
    definition: "A classification of ductwork based on the maximum internal pressure it is designed to withstand without excessive deflection or leakage.",
    function: "To ensure ductwork construction, including joint and reinforcement type, matches the system's operating pressure.",
    fact: "Higher static pressure class ducts typically require heavier gauge metal and more robust joints and reinforcement." },
  { term: "Duct Aspect Ratio", topic: "Ducting & Insulation", difficulty: "Intermediate", tags: ["ducting"],
    definition: "The ratio of the longer side to the shorter side of a rectangular duct's cross-section.",
    function: "To indicate duct shape efficiency, since a lower aspect ratio generally reduces friction loss and material use.",
    fact: "Rectangular ducts with a lower aspect ratio, closer to square, are generally more efficient than very flat ducts." },

  // Air Distribution & Dampers
  { term: "VAV (Variable Air Volume) Box", topic: "Air Distribution & Dampers", difficulty: "Intermediate", tags: ["vav"],
    definition: "A terminal device that varies the quantity of supply air delivered to a zone in response to a thermostat signal.",
    function: "To match delivered airflow to the actual cooling or heating demand of an individual zone, saving fan energy.",
    fact: "VAV systems generally offer greater energy savings than constant air volume systems, especially at part load." },
  { term: "CAV (Constant Air Volume) System", topic: "Air Distribution & Dampers", difficulty: "Basic", tags: ["cav"],
    definition: "An HVAC distribution approach where a constant quantity of supply air is delivered regardless of the zone's actual load.",
    function: "To provide simple, ducted air distribution where temperature, not airflow, is varied to meet zone loads.",
    fact: "CAV systems are generally simpler but less energy-efficient than VAV systems at part-load conditions." },
  { term: "Diffuser", topic: "Air Distribution & Dampers", difficulty: "Basic", tags: ["diffusers"],
    definition: "An air distribution outlet designed to deliver supply air into a room in a pattern that promotes good mixing and comfort.",
    function: "To distribute conditioned supply air evenly into the occupied zone of a room.",
    fact: "Diffuser selection considers throw, spread, and noise criteria (NC) appropriate to the space." },
  { term: "Grille", topic: "Air Distribution & Dampers", difficulty: "Basic", tags: ["grilles"],
    definition: "An air distribution outlet, typically without dampers or diffusion vanes, used for supply or return air openings.",
    function: "To allow supply or return air to pass through a wall, ceiling, or duct opening.",
    fact: "Return air grilles are typically sized for a lower face velocity than supply diffusers to minimize noise." },
  { term: "Volume Control Damper", topic: "Air Distribution & Dampers", difficulty: "Basic", tags: ["dampers"],
    definition: "A damper installed in ductwork to manually or automatically regulate airflow to a branch or outlet.",
    function: "To balance airflow distribution across multiple branches of a duct system.",
    fact: "Volume control dampers are commonly used during air balancing (TAB) to achieve design airflow at each outlet." },
  { term: "Fire Damper", topic: "Air Distribution & Dampers", difficulty: "Intermediate", tags: ["dampers", "fire-safety"],
    definition: "A damper installed at fire-rated wall or floor duct penetrations that automatically closes to prevent fire spread through ductwork.",
    function: "To maintain the fire rating of a wall or floor assembly at duct penetration points during a fire.",
    fact: "Fire dampers are typically held open by a fusible link that melts at a set temperature, allowing the damper to close." },
  { term: "Motorized Damper", topic: "Air Distribution & Dampers", difficulty: "Intermediate", tags: ["dampers"],
    definition: "A damper controlled by an electric or pneumatic actuator, allowing automatic or remote adjustment of airflow.",
    function: "To enable automatic control of airflow, such as fresh air intake modulation, from a building automation system.",
    fact: "Motorized dampers are commonly interfaced with a BMS for automated fresh-air or economizer control." },

  // Ventilation & Smoke Management
  { term: "Fresh Air Ventilation", topic: "Ventilation & Smoke Management", difficulty: "Basic", tags: ["ventilation"],
    definition: "The supply of outdoor air into a building to dilute indoor contaminants and maintain acceptable indoor air quality.",
    function: "To maintain indoor air quality by diluting CO2, odors, and other contaminants generated indoors.",
    fact: "Minimum fresh air ventilation rates are typically specified per occupant or per unit floor area depending on space type." },
  { term: "Exhaust Ventilation System", topic: "Ventilation & Smoke Management", difficulty: "Basic", tags: ["ventilation"],
    definition: "A system that removes contaminated or stale air from specific areas such as toilets, kitchens, or generator rooms.",
    function: "To remove odors, heat, or contaminants directly at the source before they spread to other areas.",
    fact: "Exhaust systems are typically designed to maintain the served space at a slightly negative pressure relative to adjacent areas." },
  { term: "Car Park Ventilation", topic: "Ventilation & Smoke Management", difficulty: "Intermediate", tags: ["ventilation", "fire-safety"],
    definition: "A mechanical ventilation system for enclosed car parks that removes vehicle exhaust fumes (CO) and provides smoke extraction during fire.",
    function: "To maintain safe air quality during normal operation and provide smoke extraction during a fire emergency.",
    fact: "Car park ventilation fans are often rated for high-temperature operation to allow smoke extraction duty during a fire." },
  { term: "Staircase Pressurization", topic: "Ventilation & Smoke Management", difficulty: "Advanced", tags: ["fire-safety"],
    definition: "A system that maintains positive air pressure in a staircase relative to adjoining areas to keep it smoke-free during a fire.",
    function: "To keep escape staircases free of smoke, providing a safe means of egress during a fire emergency.",
    fact: "Staircase pressurization systems are designed to maintain a minimum pressure differential while still allowing doors to be opened with reasonable force." },
  { term: "Smoke Extraction System", topic: "Ventilation & Smoke Management", difficulty: "Advanced", tags: ["fire-safety"],
    definition: "A mechanical system designed to remove smoke from a building area during a fire to maintain visibility and tenable escape conditions.",
    function: "To limit smoke spread and maintain escape routes during a fire emergency.",
    fact: "Smoke extraction fans and ductwork are typically rated to operate at high temperatures for a specified duration during a fire." },
  { term: "Kitchen Exhaust Ventilation", topic: "Ventilation & Smoke Management", difficulty: "Intermediate", tags: ["ventilation"],
    definition: "A ventilation system that captures and removes heat, grease-laden vapors, and odors from commercial kitchen cooking equipment.",
    function: "To maintain air quality and safety in and around commercial kitchens by removing grease and heat from cooking processes.",
    fact: "Kitchen exhaust ductwork typically requires grease-rated construction and regular cleaning to reduce fire risk." },
  { term: "Air Changes per Hour (ACH)", topic: "Ventilation & Smoke Management", difficulty: "Intermediate", tags: ["ventilation"],
    definition: "The number of times the total air volume of a room is replaced by ventilation air in one hour.",
    function: "To specify the ventilation rate requirement for spaces such as toilets, kitchens, or car parks.",
    fact: "Higher ACH requirements are typically specified for spaces with higher contamination potential, such as toilets or generator rooms." },

  // HVAC Controls, TAB & Commissioning
  { term: "Direct Digital Control (DDC)", topic: "HVAC Controls, TAB & Commissioning", difficulty: "Intermediate", tags: ["controls"],
    definition: "An electronic control system that uses digital controllers and sensors to regulate HVAC equipment operation.",
    function: "To provide precise, programmable control of HVAC systems such as AHUs, chillers, and pumps.",
    fact: "DDC systems typically communicate with a central BMS using standard protocols such as BACnet or Modbus." },
  { term: "Testing, Adjusting & Balancing (TAB)", topic: "HVAC Controls, TAB & Commissioning", difficulty: "Intermediate", tags: ["tab"],
    definition: "The process of measuring and adjusting HVAC air and water flow rates to match design values.",
    function: "To verify that installed HVAC systems deliver the airflow and water flow quantities intended by the design.",
    fact: "TAB is typically performed after installation and before final handover, using calibrated instruments to measure flow." },
  { term: "HVAC Commissioning", topic: "HVAC Controls, TAB & Commissioning", difficulty: "Intermediate", tags: ["commissioning"],
    definition: "A systematic process of verifying that HVAC systems and equipment are installed, function, and perform according to design intent.",
    function: "To confirm that HVAC systems operate correctly and efficiently before building handover.",
    fact: "HVAC commissioning typically includes pre-functional checks, functional performance testing, and trend review." },
  { term: "Air-Side Economizer Control", topic: "HVAC Controls, TAB & Commissioning", difficulty: "Advanced", tags: ["controls"],
    definition: "A control strategy that uses outdoor air, when suitable, to meet cooling needs instead of mechanical cooling.",
    function: "To reduce mechanical cooling energy use by taking advantage of favorable outdoor air conditions.",
    fact: "Air-side economizer control typically increases outdoor air intake when outdoor conditions are cooler and drier than return air." },
  { term: "HVAC Interlock", topic: "HVAC Controls, TAB & Commissioning", difficulty: "Intermediate", tags: ["controls"],
    definition: "A control logic arrangement that links the operation of two or more pieces of equipment, such as a fan and its associated damper.",
    function: "To ensure dependent equipment operates only under correct conditions, improving safety and system protection.",
    fact: "A common HVAC interlock example is preventing an AHU fan from starting until its fresh air damper is proven open." },

  // HVAC BOQ & Estimation
  { term: "HVAC Load Calculation", topic: "HVAC BOQ & Estimation", difficulty: "Intermediate", tags: ["estimation"],
    definition: "The process of determining the cooling and heating loads of a building or space to size HVAC equipment appropriately.",
    function: "To ensure HVAC equipment is neither undersized, causing comfort issues, nor oversized, causing inefficiency and higher cost.",
    fact: "HVAC load calculations consider factors such as solar gain, occupancy, equipment heat, and ventilation air requirements." },
  { term: "HVAC Equipment Schedule", topic: "HVAC BOQ & Estimation", difficulty: "Basic", tags: ["estimation"],
    definition: "A tabulated list of HVAC equipment with technical parameters such as capacity, airflow, and electrical rating, used in tender documents.",
    function: "To communicate the design intent and technical requirements for each piece of HVAC equipment to bidders and installers.",
    fact: "An equipment schedule is typically cross-referenced with drawings and specifications during technical bid evaluation." },
  { term: "Ducting Take-off", topic: "HVAC BOQ & Estimation", difficulty: "Intermediate", tags: ["estimation"],
    definition: "The measurement of ductwork surface area or weight from drawings for estimation and procurement purposes.",
    function: "To determine the quantity of sheet metal and insulation required for an HVAC ducting package.",
    fact: "Ducting take-off is commonly measured in sheet area (sq.m) or fabricated weight (kg), depending on the estimation method used." },
  { term: "HVAC Rate Analysis", topic: "HVAC BOQ & Estimation", difficulty: "Intermediate", tags: ["estimation"],
    definition: "A cost breakdown for HVAC items covering equipment supply, ductwork fabrication, insulation, piping, and installation labour.",
    function: "To establish and justify unit rates quoted for HVAC BOQ items.",
    fact: "HVAC rate analysis often separates supply-only, installation, and testing and commissioning components of the rate." },
];

const num = (n, unit, decimals = 2) => `${Number(n.toFixed(decimals)).toLocaleString("en-IN")} ${unit}`;
const near = (v, pct, rng) => v * (1 + (rng() * 2 - 1) * pct);

const FCU_TABLE = [
  { model: "FCU-04", tr: 0.4 }, { model: "FCU-06", tr: 0.6 }, { model: "FCU-08", tr: 0.8 },
  { model: "FCU-10", tr: 1.0 }, { model: "FCU-15", tr: 1.5 }, { model: "FCU-20", tr: 2.0 },
  { model: "FCU-25", tr: 2.5 }, { model: "FCU-30", tr: 3.0 }, { model: "FCU-40", tr: 4.0 },
  { model: "FCU-50", tr: 5.0 },
];

const CALC_TEMPLATES = [
  {
    name: "tr-to-kw",
    weight: 5,
    spec: {
      discipline: D, topic: "Chillers", subtopic: "TR/kW Conversion", tags: ["calculation"], difficulty: "Basic",
      gen: (rng) => ({ tr: randFloat(rng, 5, 800, 1) }),
      compute: ({ tr }) => ({ formatted: num(tr * 3.517, "kW", 1), value: tr * 3.517 }),
      question: ({ tr }) => `A chiller is rated at ${tr} TR (tons of refrigeration). What is its approximate cooling capacity in kW?`,
      explanation: ({ tr }, formatted) => `1 TR is approximately 3.517 kW, so cooling capacity = ${tr} x 3.517 = ${formatted}.`,
      distractors: ({ tr }, result, rng) => [num(tr * 4.5, "kW", 1), num(tr * 2.5, "kW", 1), num(near(result.value, 0.25, rng), "kW", 1)],
    },
  },
  {
    name: "kw-to-tr",
    weight: 4,
    spec: {
      discipline: D, topic: "Chillers", subtopic: "TR/kW Conversion", tags: ["calculation"], difficulty: "Basic",
      gen: (rng) => ({ kw: randFloat(rng, 20, 2800, 1) }),
      compute: ({ kw }) => ({ formatted: num(kw / 3.517, "TR", 1), value: kw / 3.517 }),
      question: ({ kw }) => `A cooling load is estimated at ${kw} kW. What is the approximate equivalent cooling load in TR (tons of refrigeration)?`,
      explanation: ({ kw }, formatted) => `TR = kW / 3.517 = ${kw} / 3.517 = ${formatted}.`,
      distractors: ({ kw }, result, rng) => [num(kw / 4.5, "TR", 1), num(kw / 2.5, "TR", 1), num(near(result.value, 0.25, rng), "TR", 1)],
    },
  },
  {
    name: "sensible-heat-load",
    weight: 7,
    spec: {
      discipline: D, topic: "HVAC Fundamentals & Psychrometrics", subtopic: "Sensible Heat Load", tags: ["calculation", "load"], difficulty: "Advanced",
      gen: (rng) => ({ flow: randInt(rng, 200, 15000), dt: randFloat(rng, 4, 15, 1) }),
      compute: ({ flow, dt }) => {
        const kw = (1.2 * (flow / 3600) * 1005 * dt) / 1000;
        return { formatted: num(kw, "kW", 2), value: kw };
      },
      question: ({ flow, dt }) =>
        `An air stream of ${flow} m3/hr is cooled through a temperature difference of ${dt} degrees C. Using standard air density (1.2 kg/m3) and specific heat (1.005 kJ/kg-K), what is the approximate sensible cooling load?`,
      explanation: ({ flow, dt }, formatted) =>
        `Sensible load (kW) = 1.2 x (flow in m3/s) x 1.005 x deltaT = 1.2 x (${flow}/3600) x 1005 x ${dt} / 1000 = approximately ${formatted}.`,
      distractors: ({ flow, dt }, result, rng) => [
        num(result.value * 2, "kW", 2),
        num(result.value / 2, "kW", 2),
        num(near(result.value, 0.3, rng), "kW", 2),
      ],
    },
  },
  {
    name: "chiller-cop",
    weight: 5,
    spec: {
      discipline: D, topic: "Refrigeration Cycle", subtopic: "COP", tags: ["calculation", "efficiency"], difficulty: "Intermediate",
      gen: (rng) => ({ coolingKw: randInt(rng, 100, 3000), inputKw: randFloat(rng, 20, 700, 1) }),
      compute: ({ coolingKw, inputKw }) => ({ formatted: num(coolingKw / inputKw, "", 2), value: coolingKw / inputKw }),
      question: ({ coolingKw, inputKw }) =>
        `A chiller delivers ${coolingKw} kW of cooling while consuming ${inputKw} kW of electrical input power. What is its approximate Coefficient of Performance (COP)?`,
      explanation: ({ coolingKw, inputKw }, formatted) => `COP = Cooling output / Power input = ${coolingKw} / ${inputKw} = ${formatted}.`,
      distractors: ({ coolingKw, inputKw }, result, rng) => [
        num(inputKw / coolingKw, "", 2),
        num(result.value * 2, "", 2),
        num(near(result.value, 0.25, rng), "", 2),
      ],
    },
  },
  {
    name: "chiller-plant-kw-per-tr",
    weight: 5,
    spec: {
      discipline: D, topic: "Chillers", subtopic: "Plant Efficiency", tags: ["calculation", "efficiency"], difficulty: "Advanced",
      gen: (rng) => ({ tr: randInt(rng, 100, 3000), inputKw: randFloat(rng, 60, 2200, 1) }),
      compute: ({ tr, inputKw }) => ({ formatted: num(inputKw / tr, "kW/TR", 3), value: inputKw / tr }),
      question: ({ tr, inputKw }) =>
        `A chiller plant delivers ${tr} TR of cooling while the total plant (chillers, pumps, towers) consumes ${inputKw} kW. What is the approximate plant efficiency in kW/TR?`,
      explanation: ({ tr, inputKw }, formatted) => `Plant efficiency = Total input power / Cooling delivered = ${inputKw} / ${tr} = ${formatted}.`,
      distractors: ({ tr, inputKw }, result, rng) => [
        num(tr / inputKw, "kW/TR", 3),
        num(result.value * 2, "kW/TR", 3),
        num(near(result.value, 0.25, rng), "kW/TR", 3),
      ],
    },
  },
  {
    name: "condenser-water-flow",
    weight: 5,
    spec: {
      discipline: D, topic: "Cooling Towers & Condenser Water", subtopic: "Condenser Water Flow", tags: ["calculation"], difficulty: "Advanced",
      gen: (rng) => ({ tr: randInt(rng, 100, 2500), range: randFloat(rng, 4.5, 6.5, 1) }),
      compute: ({ tr, range }) => {
        const heatKw = tr * 3.517 * 1.25; // includes compressor heat of rejection factor
        const flowLps = heatKw / (4.186 * range);
        const flowM3hr = flowLps * 3.6;
        return { formatted: num(flowM3hr, "m3/hr", 1), value: flowM3hr };
      },
      question: ({ tr, range }) =>
        `A water-cooled chiller plant of ${tr} TR rejects heat through a cooling tower with a design range of ${range} degrees C (assume total heat rejected is 1.25 times the cooling effect, to allow for compressor heat). What is the approximate required condenser water flow rate?`,
      explanation: ({ tr, range }, formatted) =>
        `Heat rejected (kW) = TR x 3.517 x 1.25. Flow (l/s) = Heat / (4.186 x range). Converting to m3/hr gives approximately ${formatted}.`,
      distractors: ({ tr, range }, result, rng) => [
        num(result.value / 1.25, "m3/hr", 1),
        num(result.value * 1.6, "m3/hr", 1),
        num(near(result.value, 0.25, rng), "m3/hr", 1),
      ],
    },
  },
  {
    name: "pump-hydraulic-power",
    weight: 6,
    spec: {
      discipline: D, topic: "Chilled Water Systems & Pumps", subtopic: "Pump Power", tags: ["calculation", "pumps"], difficulty: "Advanced",
      gen: (rng) => ({ flowLps: randInt(rng, 5, 300), head: randInt(rng, 10, 60), eff: randFloat(rng, 0.6, 0.78, 2) }),
      compute: ({ flowLps, head, eff }) => {
        const kw = (flowLps * head * 9.81) / (1000 * eff);
        return { formatted: num(kw, "kW", 2), value: kw };
      },
      question: ({ flowLps, head, eff }) =>
        `A chilled water pump delivers ${flowLps} l/s against a total head of ${head} m, with a pump efficiency of ${eff}. What is the approximate shaft input power required?`,
      explanation: ({ flowLps, head, eff }, formatted) =>
        `Pump power (kW) = (Flow(l/s) x Head(m) x 9.81) / (1000 x efficiency) = (${flowLps} x ${head} x 9.81) / (1000 x ${eff}) = approximately ${formatted}.`,
      distractors: ({ flowLps, head, eff }, result, rng) => [
        num((flowLps * head * 9.81) / 1000, "kW", 2),
        num(result.value * 1.6, "kW", 2),
        num(near(result.value, 0.3, rng), "kW", 2),
      ],
    },
  },
  {
    name: "duct-velocity",
    weight: 5,
    spec: {
      discipline: D, topic: "Ducting & Insulation", subtopic: "Duct Velocity", tags: ["calculation", "ducting"], difficulty: "Intermediate",
      gen: (rng) => ({ cmh: randInt(rng, 500, 20000), width: randInt(rng, 200, 1200), height: randInt(rng, 150, 900) }),
      compute: ({ cmh, width, height }) => {
        const areaM2 = (width / 1000) * (height / 1000);
        const velocity = (cmh / 3600) / areaM2;
        return { formatted: num(velocity, "m/s", 2), value: velocity };
      },
      question: ({ cmh, width, height }) =>
        `A rectangular duct of ${width} mm x ${height} mm carries an airflow of ${cmh} m3/hr. What is the approximate air velocity inside the duct?`,
      explanation: ({ cmh, width, height }, formatted) =>
        `Velocity = Flow(m3/s) / Cross-sectional area(m2) = (${cmh}/3600) / ((${width}/1000) x (${height}/1000)) = approximately ${formatted}.`,
      distractors: ({ cmh, width, height }, result, rng) => [
        num(result.value * 2, "m/s", 2),
        num(result.value / 2, "m/s", 2),
        num(near(result.value, 0.3, rng), "m/s", 2),
      ],
    },
  },
  {
    name: "cooling-load-rule-of-thumb",
    weight: 5,
    spec: {
      discipline: D, topic: "HVAC BOQ & Estimation", subtopic: "Preliminary Load Estimation", tags: ["calculation", "estimation"], difficulty: "Intermediate",
      gen: (rng) => ({ area: randInt(rng, 500, 20000), sqftPerTr: pick(rng, [120, 130, 140, 150, 160, 175]) }),
      compute: ({ area, sqftPerTr }) => ({ formatted: num(area / sqftPerTr, "TR", 1), value: area / sqftPerTr }),
      question: ({ area, sqftPerTr }) =>
        `For preliminary budgeting of a commercial office space of ${area} sq.ft, a rule-of-thumb of one TR per ${sqftPerTr} sq.ft is used. What is the approximate preliminary cooling load?`,
      explanation: ({ area, sqftPerTr }, formatted) =>
        `Preliminary TR = Area / (sq.ft per TR) = ${area} / ${sqftPerTr} = approximately ${formatted}. Note this is only a rough preliminary estimate, not a substitute for a detailed load calculation.`,
      distractors: ({ area, sqftPerTr }, result, rng) => [
        num(area / (sqftPerTr * 2), "TR", 1),
        num(result.value * 1.8, "TR", 1),
        num(near(result.value, 0.25, rng), "TR", 1),
      ],
    },
  },
  {
    name: "fcu-selection",
    weight: 4,
    spec: {
      discipline: D, topic: "Air Handling Units", subtopic: "FCU Selection", tags: ["calculation", "fcu"], difficulty: "Intermediate",
      gen: (rng) => {
        const idx = randInt(rng, 1, FCU_TABLE.length - 2);
        const requiredTr = randFloat(rng, FCU_TABLE[idx - 1].tr + 0.05, FCU_TABLE[idx].tr - 0.02, 2);
        return { idx, requiredTr };
      },
      compute: ({ idx }) => ({ formatted: `${FCU_TABLE[idx].model} (${FCU_TABLE[idx].tr} TR)`, value: idx }),
      question: ({ requiredTr }) =>
        `A zone requires a cooling capacity of approximately ${requiredTr} TR. From a standard FCU range of 0.4, 0.6, 0.8, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, and 5.0 TR models, which is the smallest adequate FCU selection?`,
      explanation: ({ idx, requiredTr }, formatted) =>
        `The selected FCU capacity must be equal to or greater than the required ${requiredTr} TR. The smallest adequate standard model is ${formatted}.`,
      distractors: ({ idx }) => {
        const opts = [];
        if (FCU_TABLE[idx - 1]) opts.push(`${FCU_TABLE[idx - 1].model} (${FCU_TABLE[idx - 1].tr} TR)`);
        if (FCU_TABLE[idx + 1]) opts.push(`${FCU_TABLE[idx + 1].model} (${FCU_TABLE[idx + 1].tr} TR)`);
        if (FCU_TABLE[idx + 2]) opts.push(`${FCU_TABLE[idx + 2].model} (${FCU_TABLE[idx + 2].tr} TR)`);
        return opts.slice(0, 3);
      },
    },
  },
  {
    name: "cooling-tower-approach",
    weight: 3,
    spec: {
      discipline: D, topic: "Cooling Towers & Condenser Water", subtopic: "Approach Temperature", tags: ["calculation"], difficulty: "Intermediate",
      gen: (rng) => ({ leavingTemp: randFloat(rng, 29, 34, 1), wetBulb: randFloat(rng, 24, 28.5, 1) }),
      compute: ({ leavingTemp, wetBulb }) => ({ formatted: num(leavingTemp - wetBulb, "deg C", 1), value: leavingTemp - wetBulb }),
      question: ({ leavingTemp, wetBulb }) =>
        `A cooling tower produces a leaving water temperature of ${leavingTemp} degrees C when the ambient wet bulb temperature is ${wetBulb} degrees C. What is the tower's approach temperature?`,
      explanation: ({ leavingTemp, wetBulb }, formatted) =>
        `Approach = Leaving water temperature - Ambient wet bulb temperature = ${leavingTemp} - ${wetBulb} = ${formatted}.`,
      distractors: ({ leavingTemp, wetBulb }, result, rng) => [
        num(leavingTemp + wetBulb, "deg C", 1),
        num(result.value * 2, "deg C", 1),
        num(Math.max(0.5, near(result.value, 0.3, rng)), "deg C", 1),
      ],
    },
  },
  {
    name: "chiller-plant-energy-cost",
    weight: 5,
    spec: {
      discipline: D, topic: "HVAC BOQ & Estimation", subtopic: "Energy Cost", tags: ["calculation", "estimation"], difficulty: "Intermediate",
      gen: (rng) => ({ tr: randInt(rng, 100, 2000), kwPerTr: randFloat(rng, 0.65, 1.1, 2), hours: randInt(rng, 6, 22), rate: randFloat(rng, 6, 11, 2) }),
      compute: ({ tr, kwPerTr, hours, rate }) => {
        const cost = tr * kwPerTr * hours * rate;
        return { formatted: `Rs ${Math.round(cost).toLocaleString("en-IN")}`, value: cost };
      },
      question: ({ tr, kwPerTr, hours, rate }) =>
        `A chiller plant runs at ${tr} TR average load with a plant efficiency of ${kwPerTr} kW/TR, operating ${hours} hours a day, at an electricity tariff of Rs ${rate} per kWh. What is the approximate daily energy cost of the chiller plant?`,
      explanation: ({ tr, kwPerTr, hours, rate }, formatted) =>
        `Daily energy (kWh) = TR x kW/TR x hours. Cost = Energy x tariff = ${tr} x ${kwPerTr} x ${hours} x ${rate} = approximately ${formatted}.`,
      distractors: ({ tr, kwPerTr, hours, rate }, result, rng) => [
        `Rs ${Math.round(result.value / 2).toLocaleString("en-IN")}`,
        `Rs ${Math.round(result.value * 1.7).toLocaleString("en-IN")}`,
        `Rs ${Math.round(near(result.value, 0.3, rng)).toLocaleString("en-IN")}`,
      ],
    },
  },
  {
    name: "ventilation-ach-airflow",
    weight: 5,
    spec: {
      discipline: D, topic: "Ventilation & Smoke Management", subtopic: "ACH-Based Airflow", tags: ["calculation", "ventilation"], difficulty: "Basic",
      gen: (rng) => ({ length: randInt(rng, 4, 25), width: randInt(rng, 3, 20), height: randFloat(rng, 2.7, 4.5, 1), ach: pick(rng, [4, 6, 8, 10, 12, 15, 20, 25]) }),
      compute: ({ length, width, height, ach }) => {
        const volume = length * width * height;
        const cmh = volume * ach;
        return { formatted: num(cmh, "m3/hr", 0), value: cmh };
      },
      question: ({ length, width, height, ach }) =>
        `A room measuring ${length} m x ${width} m with a ceiling height of ${height} m requires a ventilation rate of ${ach} air changes per hour (ACH). What is the required exhaust/supply airflow rate?`,
      explanation: ({ length, width, height, ach }, formatted) =>
        `Required airflow = Room volume x ACH = (${length} x ${width} x ${height}) x ${ach} = approximately ${formatted}.`,
      distractors: ({ length, width, height, ach }, result, rng) => [
        num(result.value / 2, "m3/hr", 0),
        num(result.value * 1.5, "m3/hr", 0),
        num(near(result.value, 0.25, rng), "m3/hr", 0),
      ],
    },
  },
  {
    name: "fan-power-static-pressure",
    weight: 5,
    spec: {
      discipline: D, topic: "Air Handling Units", subtopic: "Fan Power", tags: ["calculation"], difficulty: "Advanced",
      gen: (rng) => ({ flow: randInt(rng, 1000, 60000), pressure: randInt(rng, 250, 1500), eff: randFloat(rng, 0.55, 0.75, 2) }),
      compute: ({ flow, pressure, eff }) => {
        const kw = ((flow / 3600) * pressure) / (1000 * eff);
        return { formatted: num(kw, "kW", 2), value: kw };
      },
      question: ({ flow, pressure, eff }) =>
        `An AHU supply fan delivers ${flow} m3/hr against a total static pressure of ${pressure} Pa, with a fan efficiency of ${eff}. What is the approximate fan shaft power required?`,
      explanation: ({ flow, pressure, eff }, formatted) =>
        `Fan power (kW) = (Flow(m3/s) x Pressure(Pa)) / (1000 x efficiency) = ((${flow}/3600) x ${pressure}) / (1000 x ${eff}) = approximately ${formatted}.`,
      distractors: ({ flow, pressure, eff }, result, rng) => [
        num(result.value * 2, "kW", 2),
        num(result.value / 2, "kW", 2),
        num(near(result.value, 0.3, rng), "kW", 2),
      ],
    },
  },
  {
    name: "chw-flow-for-load",
    weight: 5,
    spec: {
      discipline: D, topic: "Chilled Water Systems & Pumps", subtopic: "Chilled Water Flow", tags: ["calculation"], difficulty: "Advanced",
      gen: (rng) => ({ tr: randInt(rng, 20, 2000), dt: randFloat(rng, 4.5, 7, 1) }),
      compute: ({ tr, dt }) => {
        const flowLps = (tr * 3.517) / (4.186 * dt);
        return { formatted: num(flowLps, "l/s", 2), value: flowLps };
      },
      question: ({ tr, dt }) =>
        `A cooling coil is designed for a load of ${tr} TR with a chilled water temperature difference (delta-T) of ${dt} degrees C. What is the approximate required chilled water flow rate?`,
      explanation: ({ tr, dt }, formatted) =>
        `Flow (l/s) = (TR x 3.517) / (4.186 x delta-T) = (${tr} x 3.517) / (4.186 x ${dt}) = approximately ${formatted}.`,
      distractors: ({ tr, dt }, result, rng) => [
        num(result.value * 2, "l/s", 2),
        num(result.value / 2, "l/s", 2),
        num(near(result.value, 0.3, rng), "l/s", 2),
      ],
    },
  },
  {
    name: "heat-rejection-condenser",
    weight: 4,
    spec: {
      discipline: D, topic: "Cooling Towers & Condenser Water", subtopic: "Heat Rejection", tags: ["calculation"], difficulty: "Intermediate",
      gen: (rng) => ({ coolingKw: randInt(rng, 100, 3000), compressorKw: randFloat(rng, 20, 700, 1) }),
      compute: ({ coolingKw, compressorKw }) => ({ formatted: num(coolingKw + compressorKw, "kW", 1), value: coolingKw + compressorKw }),
      question: ({ coolingKw, compressorKw }) =>
        `A chiller provides ${coolingKw} kW of cooling while its compressor consumes ${compressorKw} kW of electrical power. What is the approximate total heat that must be rejected at the condenser?`,
      explanation: ({ coolingKw, compressorKw }, formatted) =>
        `Heat rejected at condenser = Cooling effect + Compressor work input = ${coolingKw} + ${compressorKw} = approximately ${formatted}.`,
      distractors: ({ coolingKw, compressorKw }, result, rng) => [
        num(coolingKw - compressorKw, "kW", 1),
        num(coolingKw, "kW", 1),
        num(near(result.value, 0.2, rng), "kW", 1),
      ],
    },
  },
];

export function generateHVAC() {
  const conceptual = roundRobinTrim(buildFromFactBank(FACTS, D), CONCEPTUAL_TARGET, (q) => q.topic);
  const calcTarget = TARGET - conceptual.length;
  const calc = buildCalcSet(CALC_TEMPLATES, calcTarget, "hvac");
  return [...conceptual, ...calc].slice(0, TARGET);
}
