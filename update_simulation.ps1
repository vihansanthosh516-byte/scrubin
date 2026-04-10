$file = "client\src\pages\Simulation.tsx"
$content = Get-Content $file -Raw

# Update imports section
$oldImports = @"
import { appendectomyData } from "../data/appendectomy";
import { cabgData } from "../data/cabg";
import { craniotomyData } from "../data/craniotomy";
import { cholecystectomyData } from "../data/cholecystectomy";
import { aclReconstructionData } from "../data/acl_reconstruction";
import { cSectionData } from "../data/c_section";
import { spinalFusionData } from "../data/spinal_fusion";
import { totalKneeReplacementData } from "../data/total_knee_replacement";
import { exploratoryLaparotomyData } from "../data/exploratory_laparotomy";
import { sigmoidColectomyData } from "../data/sigmoid_colectomy";
"@

$newImports = @"
import { appendectomyData } from "../data/appendectomy";
import { cabgData } from "../data/cabg";
import { craniotomyData } from "../data/craniotomy";
import { cholecystectomyData } from "../data/cholecystectomy";
import { aclReconstructionData } from "../data/acl_reconstruction";
import { cSectionData } from "../data/c_section";
import { spinalFusionData } from "../data/spinal_fusion";
import { totalKneeReplacementData } from "../data/total_knee_replacement";
import { exploratoryLaparotomyData } from "../data/exploratory_laparotomy";
import { sigmoidColectomyData } from "../data/sigmoid_colectomy";
import { inguinalHerniaData } from "../data/inguinal_hernia";
import { thyroidectomyData } from "../data/thyroidectomy";
import { carpalTunnelData } from "../data/carpal_tunnel";
import { hysterectomyData } from "../data/hysterectomy";
import { nephrectomyData } from "../data/nephrectomy";
import { hipReplacementData } from "../data/hip_replacement";
import { breastLumpectomyData } from "../data/breast_lumpectomy";
import { tympanoplastyData } from "../data/tympanoplasty";
import { femoralNailingData } from "../data/femoral_nailing";
import { lobectomyData } from "../data/lobectomy";
import { whippleData } from "../data/whipple";
import { aaaRepairData } from "../data/aaa_repair";
import { prostatectomyData } from "../data/prostatectomy";
import { esophagectomyData } from "../data/esophagectomy";
import { liverResectionData } from "../data/liver_resection";
import { microdiscectomyData } from "../data/microdiscectomy";
import { cabgOpcabData } from "../data/cabg_opcab";
import { rotatorCuffData } from "../data/rotator_cuff";
import { rhinoplastyData } from "../data/rhinoplasty";
import { parathyroidectomyData } from "../data/parathyroidectomy";
"@

$content = $content.Replace($oldImports, $newImports)

# Update REGISTRY
$oldRegistry = @"
const REGISTRY: Record<string, any> = {
  appendectomy: appendectomyData,
  cabg: cabgData,
  craniotomy: craniotomyData,
  cholecystectomy: cholecystectomyData,
  "acl-reconstruction": aclReconstructionData,
  "c-section": cSectionData,
  "spinal-fusion": spinalFusionData,
  "total-knee-replacement": totalKneeReplacementData,
  "exploratory-laparotomy": exploratoryLaparotomyData,
  "sigmoid-colectomy": sigmoidColectomyData,
  // New procedures - fallback to appendectomy data until specific files created
  "inguinal-hernia": { ...appendectomyData, PATIENT: { ...appendectomyData.PATIENT, name: "James M.", procedureCategory: "elective" } },
  "thyroidectomy": { ...appendectomyData, PATIENT: { ...appendectomyData.PATIENT, name: "Sarah K.", procedureCategory: "elective" } },
  "carpal-tunnel": { ...appendectomyData, PATIENT: { ...appendectomyData.PATIENT, name: "David L.", procedureCategory: "elective" } },
  "hysterectomy": { ...cSectionData, PATIENT: { ...cSectionData.PATIENT, name: "Maria G.", procedureCategory: "elective" } },
  "nephrectomy": { ...appendectomyData, PATIENT: { ...appendectomyData.PATIENT, name: "Thomas R.", procedureCategory: "elective" } },
  "hip-replacement": { ...totalKneeReplacementData, PATIENT: { ...totalKneeReplacementData.PATIENT, name: "Helen W.", procedureCategory: "orthopedic" } },
  "breast-lumpectomy": { ...appendectomyData, PATIENT: { ...appendectomyData.PATIENT, name: "Jennifer A.", procedureCategory: "elective" } },
  "tympanoplasty": { ...appendectomyData, PATIENT: { ...appendectomyData.PATIENT, name: "Michael P.", procedureCategory: "elective" } },
  "femoral-nailing": { ...aclReconstructionData, PATIENT: { ...aclReconstructionData.PATIENT, name: "Chris B.", procedureCategory: "orthopedic" } },
  "lobectomy": { ...cabgData, PATIENT: { ...cabgData.PATIENT, name: "William H.", procedureCategory: "cardiovascular" } },
  "whipple": { ...appendectomyData, PATIENT: { ...appendectomyData.PATIENT, name: "Richard S.", procedureCategory: "elective" } },
  "aortic-aneurysm": { ...cabgData, PATIENT: { ...cabgData.PATIENT, name: "George T.", procedureCategory: "cardiovascular" } },
  "prostatectomy": { ...appendectomyData, PATIENT: { ...appendectomyData.PATIENT, name: "Edward M.", procedureCategory: "elective" } },
  "esophagectomy": { ...cabgData, PATIENT: { ...cabgData.PATIENT, name: "Charles N.", procedureCategory: "cardiovascular" } },
  "liver-resection": { ...appendectomyData, PATIENT: { ...appendectomyData.PATIENT, name: "Patricia J.", procedureCategory: "elective" } },
  "microdiscectomy": { ...spinalFusionData, PATIENT: { ...spinalFusionData.PATIENT, name: "Kevin D.", procedureCategory: "neurosurgery" } },
  "cabg-opcab": { ...cabgData, PATIENT: { ...cabgData.PATIENT, name: "Robert F.", procedureCategory: "cardiovascular" } },
  "rotator-cuff": { ...aclReconstructionData, PATIENT: { ...aclReconstructionData.PATIENT, name: "Amanda C.", procedureCategory: "orthopedic" } },
  "rhinoplasty": { ...appendectomyData, PATIENT: { ...appendectomyData.PATIENT, name: "Lisa P.", procedureCategory: "elective" } },
  "parathyroidectomy": { ...appendectomyData, PATIENT: { ...appendectomyData.PATIENT, name: "Nancy Q.", procedureCategory: "elective" } },
};
"@

$newRegistry = @"
const REGISTRY: Record<string, any> = {
  appendectomy: appendectomyData,
  cabg: cabgData,
  craniotomy: craniotomyData,
  cholecystectomy: cholecystectomyData,
  "acl-reconstruction": aclReconstructionData,
  "c-section": cSectionData,
  "spinal-fusion": spinalFusionData,
  "total-knee-replacement": totalKneeReplacementData,
  "exploratory-laparotomy": exploratoryLaparotomyData,
  "sigmoid-colectomy": sigmoidColectomyData,
  "inguinal-hernia": inguinalHerniaData,
  "thyroidectomy": thyroidectomyData,
  "carpal-tunnel": carpalTunnelData,
  "hysterectomy": hysterectomyData,
  "nephrectomy": nephrectomyData,
  "hip-replacement": hipReplacementData,
  "breast-lumpectomy": breastLumpectomyData,
  "tympanoplasty": tympanoplastyData,
  "femoral-nailing": femoralNailingData,
  "lobectomy": lobectomyData,
  "whipple": whippleData,
  "aortic-aneurysm": aaaRepairData,
  "prostatectomy": prostatectomyData,
  "esophagectomy": esophagectomyData,
  "liver-resection": liverResectionData,
  "microdiscectomy": microdiscectomyData,
  "cabg-opcab": cabgOpcabData,
  "rotator-cuff": rotatorCuffData,
  "rhinoplasty": rhinoplastyData,
  "parathyroidectomy": parathyroidectomyData,
};
"@

$content = $content.Replace($oldRegistry, $newRegistry)

Set-Content $file $content -NoNewline
Write-Host "Simulation.tsx updated successfully"
