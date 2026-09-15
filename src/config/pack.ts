export const rulesVersion = "climate-v0.6-implementation-1";
export const levels = {
  T0: "MONITOR",
  T1: "HEADS-UP",
  T2: "PREPARE",
  T3: "ACT",
  T4: "RECOVER",
};
export const definitions = {
  T0: "Seasonal/general risk only; no credible near-term material divisional exposure.",
  T1: "Credible emerging threat may affect a Business Centre, commuting area or meaningful workforce concentration.",
  T2: "Material exposure increasingly likely, with reasonable potential to affect travel, attendance, safety or ability to work.",
  T3: "Official warning, imminent/occurring material disruption, unsafe travel/access, or conditions requiring protective action.",
  T4: "Immediate threat passed but people, access, utilities or operations remain affected.",
};
export const authority =
  "People Leaders are the primary attendance / flexible-work authority. A broader protective attendance direction for unsafe conditions requires Business Continuity Director approval. Enterprise functions retain building closure and incident authority.";
export const safeguard =
  "If immediate safety is at risk, inability to reach the next escalation level must not delay communication of authoritative emergency advice or reasonable precautionary guidance.";
export const actions = {
  T0: [
    "Maintain seasonal awareness and workforce exposure data.",
    "Maintain validated centre list, hazard profile and Property contacts.",
  ],
  T1: [
    "Advise relevant leaders; identify affected teams and planned attendance / travel.",
    "Check warning geography, access / transport and enterprise advice.",
  ],
  T2: [
    "People Leaders prepare flexible-work arrangements within normal authority; confirm remote-work options and reconsider non-essential travel / attendance.",
    "Confirm Property advice; assess reasonable attendance and prepare alternatives.",
    "Confirm escalation; increase monitoring; communicate preparation and next update.",
  ],
  T3: [
    "Prioritise safety; communicate authoritative emergency advice and proportionate precautions.",
    "Support remote work; escalate welfare and enterprise issues; track impacts.",
    "Follow enterprise site-status advice. Obtain BC Director approval for broader protective attendance direction.",
  ],
  T4: [
    "Check welfare and material people impacts; communicate recovery arrangements.",
    "Confirm enterprise advice and residual transport, utility and community constraints before normal attendance.",
    "Record lessons and update the plan / register where required.",
  ],
};
export const hazards = {
  fire: {
    name: "Bushfire / smoke",
    T1: "Credible fire/smoke threat intersects relevant geography.",
    T2: "Worsening conditions likely to affect travel, attendance or centre use.",
    T3: "Emergency/evacuation advice, unsafe access, or fire/smoke materially affecting people or centre use.",
    impacts: "Access, evacuation, power, telecommunications, air quality",
  },
  heat: {
    name: "Extreme heat",
    T1: "Unusually severe/prolonged heat forecast for relevant workforce/centre.",
    T2: "Credible transport, power or health/safety stress likely to affect attendance/use.",
    T3: "Conditions or official/enterprise advice make travel/centre use unsafe or materially impractical; significant disruption occurring.",
    impacts: "Electricity demand, HVAC, transport, workforce availability",
  },
  flood: {
    name: "Flood / intense rainfall",
    T1: "Flood Watch/significant rainfall forecast intersects relevant geography.",
    T2: "Credible access, transport or local flooding impacts increasingly likely.",
    T3: "Flood Warning/emergency advice; roads, transport, centre access or workforce areas materially affected.",
    impacts: "Access loss, utilities, transport, supplier interruption",
  },
  storm: {
    name: "Severe storm",
    T1: "Severe weather/thunderstorm risk intersects relevant geography.",
    T2: "High-confidence forecast with credible travel, power or access impacts.",
    T3: "Dangerous conditions imminent/occurring; material transport, power, property or access impacts.",
    impacts: "Power, telecommunications, transport, building damage",
  },
  tropical: {
    name: "Tropical severe weather",
    T1: "Tropical system risk intersects relevant workforce/centre geography.",
    T2: "Watch/credible forecast with material travel, access or power implications.",
    T3: "Cyclone Warning/emergency advice or material disruption expected/occurring.",
    impacts: "Power, telecommunications, aviation, roads, supply chain",
  },
  utilities: {
    name: "Power / telecommunications",
    T1: "External hazard creates credible utility-disruption risk.",
    T2: "Meaningful outage increasingly likely across exposed workforce/centre.",
    T3: "Material outage affects a meaningful workforce concentration or ability to operate.",
    impacts:
      "Power, connectivity, workforce concentration, operational capability",
  },
};
