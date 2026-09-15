import { type Version } from "./model";
import { hazards, levels } from "../config/pack";
export const communicationTypes = [
  "WORKFORCE UPDATE",
  "PEOPLE LEADER UPDATE",
  "SENIOR LEADERSHIP BRIEF",
  "EVENT STATUS SUMMARY",
];
export function draftCommunication(
  type: string,
  v: Version,
  nextReview: string,
) {
  const i = v.input;
  return `${type} — DRAFT FOR REVIEW\n${i.title}\n\nWhat: ${hazards[i.hazard].name}. ${i.adviceDetails}\nSource: ${i.source} — ${i.reference || "Reference not recorded"}\nWhere / when: ${i.geography}; ${i.timing}.\nPeople / Business Centres: ${i.workforce || "Workforce details not recorded"}. ${v.centres.map((c) => c.name).join(", ") || "No centres selected"}. ${i.impactNotes || "See recorded impact assessment."}\nRecorded posture: ${v.decision.posture} — ${levels[v.decision.posture]}. Decision-maker: ${v.decision.maker}.\nAction now: ${i.proportionateAction}\n${type === "PEOPLE LEADER UPDATE" ? "People Leaders: apply normal attendance / flexible-work authority and escalate welfare or operational issues.\n" : ""}${type === "SENIOR LEADERSHIP BRIEF" || type === "EVENT STATUS SUMMARY" ? `Enterprise hand-off: ${v.recommendation.escalation.join(" ") || "No hand-off trigger recorded."}\n` : ""}Next update: ${nextReview || "Must be set before issue"}.\nAuthoritative emergency and enterprise site advice takes precedence.`;
}
