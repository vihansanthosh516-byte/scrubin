/**
 * ScrubIn Learn Hub — Comprehensive Surgical Education
 * Connected to Anatomy Explorer and Simulation
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Clock, BookOpen, ChevronRight, ArrowRight, Tag, Activity, Heart, Brain, Bone, Stethoscope, Baby, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrubinCard } from "@/components/ui/scrubin-card";

const CATEGORIES = ["All", "Anatomy", "Procedures", "Pharmacology", "Complications", "Techniques"];

// ═══════════════════════════════════════════════════════════════════════════════
// COMPREHENSIVE SURGICAL EDUCATION ARTICLES
// ═══════════════════════════════════════════════════════════════════════════════

const ARTICLES = [
  // ═══ APPENDECTOMY ═══
  {
    id: 1,
    title: "Appendectomy: Complete Surgical Guide",
    category: "Procedures",
    readTime: "12 min",
    difficulty: "Beginner",
    related: ["Appendectomy"],
    excerpt: "Master the appendectomy from diagnosis to closure. Learn port placement, dissection techniques, and how to handle the inflamed appendix safely.",
    sections: [
      {
        title: "Anatomy Review",
        content: "The appendix is a vestigial structure arising from the posteromedial wall of the cecum, typically 6-10cm in length. It lies at the convergence of the three taeniae coli, a critical landmark for identification during surgery. The base of the appendix is relatively fixed at McBurney's point (1/3 distance from ASIS to umbilicus), but the tip position varies: retrocecal (65%), pelvic (30%), or subcecal.\n\nThe blood supply is the appendiceal artery, a branch of the ileocolic artery (from superior mesenteric). The artery runs in the mesoappendix and is the only vessel supplying the appendix — it must be secured before division. Venous drainage follows the artery to the superior mesenteric vein, then portal system."
      },
      {
        title: "Clinical Presentation",
        content: "Classic presentation follows a predictable pattern: periumbilical visceral pain (vague, dull) migrates to the right lower quadrant (somatic, sharp) over 12-24 hours as the parietal peritoneum becomes inflamed. Anorexia, nausea, and low-grade fever (38-38.5°C) accompany the pain.\n\nPhysical exam findings:\n• McBurney's point tenderness — the most sensitive finding\n• Rovsing's sign — RLQ pain with LLQ palpation\n• Psoas sign — pain with right hip extension (retrocecal appendix)\n• Obturator sign — pain with internal rotation of flexed right hip (pelvic appendix)\n• Rebound tenderness — suggests peritoneal irritation"
      },
      {
        title: "Port Placement",
        content: "Standard three-port laparoscopic appendectomy:\n\n1. Umbilical port (10mm) — Camera port, placed via Hasson or Veress technique\n2. Suprapubic port (5mm) — Left of midline, allows grasper manipulation of appendix\n3. Left lower quadrant port (5mm) — Working port for stapler or clips\n\nThe ports form a triangle with the appendix at the apex. The surgeon stands on the patient's left, with the camera assistant at the foot of the bed. Monitor placement is at the patient's right hip for optimal ergonomics."
      },
      {
        title: "Operative Technique",
        content: "Step 1: Exposure and Identification\nGrasp the appendix with a babcock or atraumatic grasper through the suprapubic port. Retract medially to expose the mesoappendix. Identify the cecum, terminal ileum, and appendix base.\n\nStep 2: Mesoappendix Dissection\nCreate a window in the mesoappendix near the appendix base using a hook cautery or ultrasonic shears. The appendiceal artery runs in the mesoappendix — it must be controlled before division.\n\nStep 3: Vessel Control\nDivide the mesoappendix using:\n• Endoscopic stapler (vascular load) — most common\n• Clips (2-3 clips on artery, then divide)\n• Ultrasonic shears (LigaSure, Harmonic)\n\nStep 4: Appendiceal Division\nPlace a linear stapler across the appendix base. Fire the stapler to simultaneously ligate and divide. Alternatively, use pre-tied endoloops (2-3 loops on base, then divide).\n\nStep 5: Specimen Retrieval\nPlace the appendix in an endocatch bag to prevent port-site contamination. Extract through the umbilical port. Irrigate the abdomen if any spillage occurred."
      },
      {
        title: "Key Decision Points",
        content: "During the simulation, you'll face these critical decisions:\n\n1. Diagnosis: Is this appendicitis or mimics (mesenteric adenitis, diverticulitis, ovarian pathology)?\n\n2. Approach: Laparoscopic vs. open? Laparoscopic is standard unless contraindicated (prior surgery, hemodynamic instability).\n\n3. Mesoappendix management: How to control the appendiceal artery? Stapler, clips, or energy device?\n\n4. Stump management: Invert the stump or leave it? Current evidence suggests no difference in outcome.\n\n5. Perforated appendix: Should you irrigate? How extensively? Place drains?"
      },
      {
        title: "Complications",
        content: "Early Complications:\n• Wound infection (3-8% for laparoscopic, higher for open)\n• Intra-abdominal abscess (2-5%)\n• Ileus — common, usually resolves with supportive care\n• Bowel injury — from trocar placement or dissection\n\nLate Complications:\n• Port-site hernia (0.5-1%)\n• Small bowel obstruction (adhesions)\n• Stump appendicitis — rare, occurs if appendiceal tissue left behind\n\nIf you encounter complications in simulation, the rescue system will guide you through appropriate responses."
      }
    ]
  },

  // ═══ CHOLECYSTECTOMY ═══
  {
    id: 2,
    title: "Cholecystectomy: Critical View of Safety",
    category: "Procedures",
    readTime: "15 min",
    difficulty: "Intermediate",
    related: ["Cholecystectomy"],
    excerpt: "The most common abdominal surgery — and the most common source of bile duct injury. Master the critical view of safety to prevent catastrophe.",
    sections: [
      {
        title: "Anatomy of the Gallbladder",
        content: "The gallbladder sits in the gallbladder fossa on the inferior surface of the liver, segments IVb and V. It stores 30-50ml of bile, concentrating it 10-fold through water absorption.\n\nCritical anatomical structures:\n• Cystic duct — connects gallbladder to common bile duct, typically 2-4cm long\n• Cystic artery — branch of right hepatic artery, runs in Calot's triangle\n• Calot's triangle — bounded by cystic duct, common hepatic duct, and liver edge\n• Triangle of Calot — contains cystic artery and lymph node of Lund\n\nVariant anatomy is common:\n• Cystic duct insertion — may join the CBD low, high, or spiral\n• Cystic artery — may be double, may arise from left hepatic artery\n• Accessory bile ducts — present in 10-15%"
      },
      {
        title: "The Critical View of Safety",
        content: "The Critical View of Safety (CVS) is the single most important concept in preventing bile duct injury. Before any structure is clipped or divided, three criteria must be met:\n\n1. The cystic duct and cystic artery are fully dissected and cleared\n2. The hepatocystic triangle is cleared of all fibrous and adipose tissue\n3. The gallbladder is separated from the liver bed, showing only cystic structures entering it\n\nIf you cannot achieve CVS, consider:\n• Additional retraction ports\n• Fundus-first technique\n• Subtotal cholecystectomy\n• Conversion to open\n\nNEVER clip or cut a structure until CVS is achieved. Bile duct injuries are devastating complications that are almost always preventable."
      },
      {
        title: "Port Placement",
        content: "Standard four-port laparoscopic cholecystectomy:\n\n1. Umbilical port (10mm) — Camera port\n2. Epigastric port (10mm) — Operating port for clips and dissector\n3. Right subcostal port (5mm) — Grasper for fundus retraction\n4. Right lateral port (5mm) — Assistant grasper for infundibulum retraction\n\nThe camera port may be placed supraumbilically for better visualization. The epigastric port should be to the left of the falciform ligament to avoid instrument conflict."
      },
      {
        title: "Operative Technique",
        content: "Step 1: Exposure and Retraction\nGrasp the gallbladder fundus and retract superiorly and laterally. The assistant grasps the infundibulum and retracts laterally to open Calot's triangle.\n\nStep 2: Dissection of Calot's Triangle\nUsing a hook cautery or Maryland dissector, carefully dissect the peritoneum over Calot's triangle. Identify the cystic duct by following the infundibulum down. The cystic artery is usually found superior and medial to the cystic duct.\n\nStep 3: Achieving Critical View\nClear all fibrofatty tissue from the triangle. Separate the gallbladder from the liver bed partially to confirm that only cystic structures remain attached. If in doubt, intraoperative cholangiogram can confirm anatomy.\n\nStep 4: Division of Structures\nClip the cystic duct with two clips proximally and one distally. Divide between clips. Repeat for cystic artery.\n\nStep 5: Gallbladder Removal\nDissect the gallbladder from the liver bed using hook cautery. Extract in an endocatch bag through the umbilical port."
      },
      {
        title: "Intraoperative Cholangiogram",
        content: "When to perform IOC:\n• Unclear anatomy\n• Suspected common bile duct stones\n• Elevated preoperative bilirubin\n• History of pancreatitis\n\nTechnique:\n1. Make a small transverse cystic ductotomy\n2. Insert a cholangiocatheter (4-5Fr) into the cystic duct\n3. Secure with a clip or specialized clamp\n4. Inject 10-15ml of dilute contrast\n5. Obtain fluoroscopic images\n\nNormal IOC shows:\n• Filling of the CBD, common hepatic duct, and intrahepatic ducts\n• Flow into the duodenum\n• No filling defects\n• No extravasation"
      },
      {
        title: "When to Convert",
        content: "Consider conversion to open when:\n• Unable to achieve CVS after reasonable attempts\n• Severe inflammation obscuring anatomy\n• Suspected or confirmed bile duct injury\n• Uncontrolled bleeding\n• Mirizzi syndrome (gallstone impacted in cystic duct compressing CBD)\n\nSubtotal cholecystectomy is an alternative to conversion:\n• Leave the posterior gallbladder wall attached to liver\n• Remove stones and anterior wall\n• Close the remnant over a drain\n• Prevents bile duct injury in hostile anatomy"
      }
    ]
  },

  // ═══ CABG ═══
  {
    id: 3,
    title: "Coronary Artery Bypass Grafting (CABG)",
    category: "Procedures",
    readTime: "18 min",
    difficulty: "Advanced",
    related: ["Heart Bypass (CABG)"],
    excerpt: "The gold standard for multivessel coronary disease. Understand cardiopulmonary bypass, graft selection, and anastomotic technique.",
    sections: [
      {
        title: "Coronary Anatomy",
        content: "The coronary arteries arise from the aortic sinuses:\n\nLeft Main Coronary Artery:\n• Arises from left sinus of Valsalva\n• Divides into LAD and circumflex\n• LAD supplies anterior septum, anterior LV, apex\n• Circumflex supplies lateral LV, posterior LV (in left-dominant)\n\nRight Coronary Artery:\n• Arises from right sinus of Valsalva\n• Supplies right ventricle, inferior LV, posterior septum (in right-dominant)\n• Gives rise to SA node artery (60% of patients)\n• Gives rise to AV node artery (90% of patients)\n\nDominance is determined by which artery supplies the posterior descending artery (PDA) and posterolateral branches. Right-dominant: 85%, Left-dominant: 8%, Codominant: 7%."
      },
      {
        title: "Indications for CABG",
        content: "Class I indications (strong evidence for CABG):\n\n1. Left main stenosis ≥50%\n2. Three-vessel disease (especially in diabetics)\n3. Two-vessel disease with proximal LAD stenosis\n4. Unstable angina refractory to medical therapy\n5. Post-MI mechanical complications (VSD, papillary muscle rupture)\n6. Failed PCI with ongoing ischemia\n\nCABG vs. PCI decision factors:\n• Diabetes — CABG preferred for multivessel disease\n• Complexity of lesions (SYNTAX score)\n• Patient age and life expectancy\n• Ability to take antiplatelet therapy\n• Patient preference"
      },
      {
        title: "Graft Selection",
        content: "Left Internal Mammary Artery (LIMA):\n• Gold standard for LAD grafting\n• 10-year patency >90%\n• Remains patent even if LAD disease progresses\n• Harvested from subclavian to level 6 rib\n• Left attached proximally (in situ graft)\n\nSaphenous Vein Grafts (SVG):\n• Used for non-LAD targets\n• 10-year patency ~60%\n• Harvested endoscopically or open\n• Prone to atherosclerosis and intimal hyperplasia\n\nRadial Artery:\n• Alternative to SVG, better patency\n• Contraindicated in Raynaud's, positive Allen test\n• Requires calcium channel blocker postop to prevent spasm\n\nRight Internal Mammary Artery (RIMA):\n• Can be used as second arterial graft\n• Similar patency to LIMA\n• May be used in situ or as free graft"
      },
      {
        title: "Cardiopulmonary Bypass",
        content: "CPB temporarily replaces heart and lung function, providing a bloodless surgical field.\n\nCannulation:\n• Aortic cannula — ascending aorta, distal to cross-clamp site\n• Venous cannula — right atrial appendage (single) or IVC/SVC (bicaval)\n• Cardioplegia cannula — ascending aorta for antegrade, coronary sinus for retrograde\n\nComponents:\n• Pump — roller or centrifugal\n• Oxygenator — membrane type\n• Heat exchanger — for cooling/rewarming\n• Reservoir — collects blood from surgical field\n\nCardioplegia:\n• Cold blood cardioplegia most common\n• Delivered antegrade (into aortic root) or retrograde (into coronary sinus)\n• Provides cardiac arrest and myocardial protection\n• Redoses every 15-20 minutes"
      },
      {
        title: "Operative Technique",
        content: "Step 1: Harvesting\nLIMA harvest proceeds through a median sternotomy, using a retractor to elevate the left chest. The LIMA is harvested with its vein and fascia from the subclavian to the 6th intercostal space.\n\nStep 2: Cannulation and Bypass\nHeparinize (300 units/kg). Place aortic and venous cannulas. Initiate CPB. Cross-clamp the aorta. Deliver cardioplegia.\n\nStep 3: Distal Anastomoses\nIdentify target vessels. Open the LAD, create the anastomosis with running 7-0 Prolene. The LIMA-to-LAD is performed first as the most critical graft.\n\nFor SVG: Open the coronary, anastomose end-to-side with running 7-0 Prolene. Measure length to aorta.\n\nStep 4: Proximal Anastomoses\nPlace a partial occlusion clamp on the ascending aorta. Open the aorta with a punch. Anastomose SVG to aorta end-to-side with running 5-0 Prolene.\n\nStep 5: Weaning from Bypass\nRemove the cross-clamp. Allow reperfusion. Place temporary pacing wires. Wean from CPB as cardiac function returns. Decannulate. Close the sternum."
      },
      {
        title: "Off-Pump CABG (OPCAB)",
        content: "CABG can be performed without cardiopulmonary bypass using specialized retractors and stabilizers.\n\nAdvantages:\n• Avoids CPB-related inflammation\n• Reduced neurologic complications\n• Shorter ICU stay\n\nDisadvantages:\n• Technically demanding\n• Less stable surgical field\n• May have incomplete revascularization\n\nTechnique:\n• Median sternotomy\n• Pericardial cradle and Trendelenburg positioning\n• Tissue stabilizer (Octopus, Starfish) immobilizes target vessel\n• Shunts maintain coronary flow during anastomosis\n• LIMA-to-LAD performed first for hemodynamic stability"
      }
    ]
  },

  // ═══ CRANIOTOMY ═══
  {
    id: 4,
    title: "Craniotomy for Tumor Resection",
    category: "Procedures",
    readTime: "20 min",
    difficulty: "Advanced",
    related: ["Craniotomy"],
    excerpt: "Neurosurgical precision at its finest. Navigate eloquent cortex, protect critical vessels, and achieve maximal safe resection.",
    sections: [
      {
        title: "Neuroanatomy Essentials",
        content: "Critical neuroanatomy for craniotomy:\n\nCerebral Cortex:\n• Frontal lobe — executive function, motor cortex (precentral gyrus)\n• Parietal lobe — sensory cortex (postcentral gyrus), spatial awareness\n• Temporal lobe — memory, language (Wernicke's area), hearing\n• Occipital lobe — visual processing\n\nVascular Territory:\n• Anterior cerebral artery — medial frontal/parietal\n• Middle cerebral artery — lateral frontal/parietal/temporal\n• Posterior cerebral artery — occipital, medial temporal\n\nEloquent Cortex:\n• Primary motor cortex — precentral gyrus\n• Primary sensory cortex — postcentral gyrus\n• Broca's area — left inferior frontal gyrus\n• Wernicke's area — left superior temporal gyrus\n• Visual cortex — occipital lobe\n\nDamage to eloquent cortex results in permanent deficits. Surgical planning must identify and avoid these areas."
      },
      {
        title: "Preoperative Planning",
        content: "Imaging Requirements:\n• MRI with contrast — defines tumor extent\n• Functional MRI — identifies eloquent cortex\n• DTI tractography — maps white matter tracts\n• MR spectroscopy — tumor grading\n• CTA/MRA — vascular relationships\n\nNeuronavigation:\n• Frameless stereotactic system\n• Registers patient anatomy to preoperative imaging\n• Guides craniotomy placement and tumor resection\n• Updated with intraoperative MRI when available\n\nCortical Mapping:\n• Direct electrical stimulation of cortex\n• Identifies motor, sensory, and language areas\n• Performed awake in dominant hemisphere surgery\n• Reduces postoperative deficits"
      },
      {
        title: "Positioning and Approach",
        content: "Patient Positioning:\n• Supine for frontal, temporal, parietal tumors\n• Lateral (park bench) for posterior temporal, parietal\n• Prone for occipital, posterior fossa\n• Mayfield head holder for rigid fixation\n\nIncision Planning:\n• Curvilinear or horseshoe incision\n• Based on tumor location and vascular supply\n• Preserve scalp blood supply (temporal artery)\n• Plan for cosmetic closure\n\nBone Flap Design:\n• Burr holes at key locations\n• Craniotome connects burr holes\n• Bone flap removed as single piece\n• Sized to provide adequate exposure\n• Preserves temporalis muscle for closure"
      },
      {
        title: "Operative Technique",
        content: "Step 1: Exposure and Dural Opening\nAfter craniotomy, open the dura in a curvilinear fashion. Reflect the dura over the bone flap. Identify cortical landmarks.\n\nStep 2: Cortical Mapping and Navigation\nUse neuronavigation to locate tumor beneath cortex. If near eloquent areas, perform cortical stimulation mapping. Mark functional areas with numbered labels.\n\nStep 3: Tumor Resection\nApproach through non-eloquent cortex when possible. Use microsurgical technique:\n• Internal debulking of tumor\n• Careful dissection of tumor margins\n• Identify and preserve vessels\n• Piecemeal removal for firm tumors\n• En bloc removal when possible\n\nStep 4: Hemostasis\nControl bleeding with:\n• Bipolar cautery on low setting\n• Hemostatic agents (Surgicel, Gelfoam)\n• Cottonoid patties\n• Warm irrigation\n\nStep 5: Closure\nClose dura with running 4-0 Neurolon. Replace bone flap with titanium plates and screws. Close scalp in two layers. Apply sterile dressing."
      },
      {
        title: "Intraoperative Complications",
        content: "Brain Swelling:\n• Causes: hyperemia, venous obstruction, edema\n• Management: head elevation, mannitol, hyperventilation\n• May require lobectomy or decompressive craniectomy\n\nHemorrhage:\n• Venous bleeding — apply patties, elevate head\n• Arterial bleeding — identify source, bipolar control\n• Tumor bed bleeding — hemostatic agents\n\nCortical Injury:\n• Minimize retraction pressure\n• Protect cortex with cottonoid patties\n• Avoid excessive bipolar energy\n\nSeizure:\n• Intraoperative seizures are rare\n• Treat with propofol or midazolam\n• Resume surgery once controlled"
      }
    ]
  },

  // ═══ C-SECTION ═══
  {
    id: 5,
    title: "Cesarean Section: Safe Delivery",
    category: "Procedures",
    readTime: "14 min",
    difficulty: "Intermediate",
    related: ["C-Section"],
    excerpt: "The most common major surgery worldwide. Master the Pfannenstiel incision, low transverse hysterotomy, and gentle delivery techniques.",
    sections: [
      {
        title: "Anatomical Considerations",
        content: "Uterine Anatomy in Pregnancy:\n• Enlarged to 1000g (from 70g non-pregnant)\n• Lower segment forms from isthmus\n• Upper segment contracts, lower segment passive\n• Bladder is reflected anteriorly\n\nKey Landmarks:\n• Uterine incision — lower segment, transverse\n• Vesicouterine peritoneum — reflects bladder from uterus\n• Uterine vessels — ascend laterally in broad ligament\n• Round ligaments — anterolateral, cross uterine vessels\n\nLayers of Abdominal Wall:\n• Skin → Subcutaneous tissue → Anterior rectus sheath\n• Rectus muscles → Posterior rectus sheath (above arcuate line)\n• Transversalis fascia → Peritoneum"
      },
      {
        title: "Indications",
        content: "Maternal Indications:\n• Prior cesarean delivery (prior classical incision)\n• Prior uterine surgery (myomectomy with cavity entry)\n• Placenta previa\n• Active genital herpes infection\n• HIV with high viral load\n• Mechanical obstruction (fibroids, ovarian tumor)\n\nFetal Indications:\n• Non-reassuring fetal status\n• Cord prolapse\n• Malpresentation (breech, transverse)\n• Multiple gestation with complications\n\nLabor Indications:\n• Failure to progress (arrest of dilation, arrest of descent)\n• Cephalopelvic disproportion\n• Failed induction of labor"
      },
      {
        title: "Operative Technique",
        content: "Step 1: Incision\nPfannenstiel skin incision — 15cm, 2-3cm above pubic symphysis. Sharply open the fascia transversely. Develop plane between fascia and rectus muscles. Separate rectus muscles vertically. Enter peritoneum transversely.\n\nStep 2: Bladder Flap\nIdentify the vesicouterine peritoneum. Create a bladder flap by incising this peritoneum transversely. Reflect the bladder inferiorly with gentle blunt dissection. Place bladder blade retractor.\n\nStep 3: Hysterotomy\nMake a small transverse incision in the lower uterine segment. Extend with bandage scissors or bluntly (finger expansion). Avoid lateral extension toward uterine vessels.\n\nStep 4: Delivery\nPlace hand into uterine cavity. Flex fetal head. Deliver head with gentle pressure from assistant (fundal pressure). Suction mouth and nose. Deliver shoulders. Clamp and cut cord. Hand infant to neonatology.\n\nStep 5: Placenta and Closure\nControl cord traction for placenta delivery. Massage fundus. Close uterus in two layers with running 1-0 Vicryl. Close peritoneum (optional). Close fascia with running 0-Vicryl. Close skin with subcuticular 4-0 Monocryl."
      },
      {
        title: "Complications",
        content: "Intraoperative:\n• Bladder injury — repair in two layers, leave Foley 7-10 days\n• Uterine lacerations — extend from incision, repair with Vicryl\n• Bowel injury — rare, general surgery consultation\n• Hemorrhage — uterine atony, lacerations, abnormal placentation\n\nPostoperative:\n• Endometritis — 5-15% rate, treat with broad-spectrum antibiotics\n• Wound infection — 3-5% rate\n• Thromboembolism — prophylaxis with sequential compression\n• Ileus — common, resolves with supportive care"
      },
      {
        title: "VBAC Considerations",
        content: "Trial of Labor After Cesarean (TOLAC):\n• Success rate ~70% with one prior low transverse cesarean\n• Lower success with: prior dystocia, BMI >30, no prior vaginal birth\n\nContraindications to VBAC:\n• Prior classical or T-incision\n• Prior uterine rupture\n• Prior myomectomy with cavity entry\n• Multiple prior cesareans\n\nSigns of Uterine Rupture:\n• Abnormal fetal heart rate (most common)\n• Loss of fetal station\n• Abdominal pain (may be masked by epidural)\n• Hemodynamic instability\n\nUterine rupture requires emergent cesarean delivery. Rupture rate is 0.5-1% for one prior low transverse incision."
      }
    ]
  },

  // ═══ ACL RECONSTRUCTION ═══
  {
    id: 6,
    title: "ACL Reconstruction: Surgical Principles",
    category: "Procedures",
    readTime: "16 min",
    difficulty: "Intermediate",
    related: ["ACL Reconstruction"],
    excerpt: "Restore knee stability with anatomic ACL reconstruction. Learn tunnel positioning, graft selection, and fixation techniques.",
    sections: [
      {
        title: "Knee Anatomy",
        content: "Anterior Cruciate Ligament:\n• Originates from posteromedial aspect of lateral femoral condyle\n• Inserts anteromedial intercondylar area of tibia\n• Two bundles: anteromedial (restricts anterior translation), posterolateral (restricts rotation)\n• Blood supply from middle genicular artery\n• Length: 32-35mm, Width: 10-12mm\n\nSecondary Stabilizers:\n• Medial meniscus — attached to MCL, provides constraint\n• Iliotibial band — contributes to anterolateral stability\n• Posterolateral corner — prevents rotational instability\n\nAssociated Injuries:\n• Meniscal tears (50-70%)\n• MCL injury (20-30%)\n• Articular cartilage damage\n• Bone bruising (lateral femoral condyle, posterior tibia)"
      },
      {
        title: "Clinical Evaluation",
        content: "Mechanism of Injury:\n• Non-contact pivoting injury\n• Sudden deceleration with change of direction\n• Audible pop in 50%\n• Immediate swelling (hemarthrosis)\n\nPhysical Exam:\n• Lachman test — most sensitive, performed at 20-30° flexion\n• Anterior drawer — at 90° flexion, less sensitive\n• Pivot shift — dynamic test for rotational instability\n• KT-1000 arthrometer — objective measurement\n\nMRI Findings:\n• ACL discontinuity or abnormal signal\n• Bone bruises (classic pattern)\n• Meniscal tears\n• Associated ligament injuries"
      },
      {
        title: "Graft Selection",
        content: "Bone-Patellar Tendon-Bone (BTB):\n• Gold standard for athletes\n• Bone-to-bone healing at 6-8 weeks\n• Faster incorporation than soft tissue grafts\n• Complications: patellar fracture, patellar tendinitis, kneeling pain\n\nHamstring Autograft (Semitendinosus/Gracilis):\n• Less donor site morbidity\n• Four-strand graft provides excellent strength\n• Slower incorporation (10-12 weeks)\n• No bone blocks — requires suspensory fixation\n\nQuadriceps Tendon:\n• Alternative when BTB/hamstring contraindicated\n• Large graft diameter possible\n• Bone block from patella optional\n\nAllograft:\n• No donor site morbidity\n• Slower incorporation\n• Risk of disease transmission (rare)\n• Higher failure rate in young athletes\n• Consider for revision or older patients"
      },
      {
        title: "Operative Technique",
        content: "Step 1: Diagnostic Arthroscopy\nEvaluate entire knee. Document ACL tear. Assess menisci, cartilage, and other ligaments. Address associated pathology.\n\nStep 2: Graft Harvest\nBTB: Make incision from inferior pole of patella to tibial tuberosity. Harvest central third of patellar tendon with bone plugs. Hamstring: Make incision over pes anserinus. Harvest semitendinosus and gracilis through tendon stripper.\n\nStep 3: Tunnel Preparation\nTibial tunnel: Start at anteromedial tibia, aim for ACL footprint. Diameter matches graft (typically 10mm).\n\nFemoral tunnel: Anatomic placement at 10:00 position (right knee). Created through tibial tunnel or accessory medial portal. Avoid posterior wall blowout.\n\nStep 4: Graft Passage\nPass graft through tunnels using Beath pin. Position bone plugs in tunnels. Femoral plug should fill tunnel.\n\nStep 5: Fixation\nFemoral: Interference screw (metal or bioabsorbable) or suspensory button (EndoButton)\n\nTibial: Interference screw, with backup fixation (post, washer)\n\nStep 6: Tensioning\nCycle knee through range of motion. Tension graft at full extension. Secure tibial fixation with knee extended."
      },
      {
        title: "Rehabilitation Protocol",
        content: "Phase 1 (Weeks 0-2): Protection\n• Brace locked in extension\n• Weight bearing as tolerated with crutches\n• Quad sets, straight leg raises\n• Patellar mobilization\n\nPhase 2 (Weeks 2-6): Motion\n• Brace unlocked, progress to no brace\n• Range of motion 0-120°\n• Stationary bike\n• Closed chain exercises\n\nPhase 3 (Weeks 6-12): Strengthening\n• Progressive strengthening\n• Balance and proprioception\n• Progress to running (typically week 10-12)\n\nPhase 4 (Months 3-6): Return to Activity\n• Sport-specific training\n• Plyometrics\n• Agility drills\n• Return to sport at 6-9 months"
      }
    ]
  },

  // ═══ ANATOMY - ABDOMINAL WALL ═══
  {
    id: 7,
    title: "Abdominal Wall Anatomy for Surgeons",
    category: "Anatomy",
    readTime: "10 min",
    difficulty: "Beginner",
    related: ["Appendectomy", "Cholecystectomy", "C-Section"],
    excerpt: "Every abdominal operation begins with the abdominal wall. Know the layers, vessels, and nerves to enter safely.",
    sections: [
      {
        title: "Layers of the Abdominal Wall",
        content: "From superficial to deep:\n\n1. Skin\n2. Subcutaneous tissue (Camper's fascia — fatty layer)\n3. Scarpa's fascia (membranous layer of superficial fascia)\n4. External oblique muscle/aponeurosis\n5. Internal oblique muscle/aponeurosis\n6. Transversus abdominis muscle/aponeurosis\n7. Transversalis fascia\n8. Preperitoneal fat (variable)\n9. Parietal peritoneum\n\nAbove the arcuate line (midway between umbilicus and pubis):\n• Anterior rectus sheath = external oblique aponeurosis + anterior internal oblique\n• Posterior rectus sheath = posterior internal oblique + transversus abdominis + transversalis fascia\n\nBelow the arcuate line:\n• Anterior rectus sheath = all three aponeuroses\n• Posterior rectus sheath = transversalis fascia only"
      },
      {
        title: "Blood Supply",
        content: "Arterial Supply:\n• Superior epigastric artery — branch of internal thoracic\n• Inferior epigastric artery — branch of external iliac\n• Deep circumflex iliac artery — lateral supply\n• Intercostal and lumbar arteries — segmental supply\n\nVenous Drainage:\n• Follows arterial supply\n• Superior epigastric → internal thoracic → subclavian\n• Inferior epigastric → external iliac → common iliac → IVC\n\nClinical Significance:\n• Inferior epigastric vessels are at risk in lower abdominal trocar placement\n• Damage causes significant retroperitoneal hemorrhage\n• Visible pulsations help identify vessels during laparoscopy"
      },
      {
        title: "Nerve Supply",
        content: "Sensory Innervation:\n• T7-T12 intercostal nerves — supply dermatomes\n• Iliohypogastric (T12, L1) — above inguinal ligament\n• Ilioinguinal (L1) — medial thigh, external genitalia\n\nMotor Innervation:\n• Intercostal nerves — segmental innervation of lateral muscles\n• Rectus muscles receive segmental innervation from T7-T12\n\nClinical Significance:\n• Transverse incisions may denervate rectus inferior to incision\n• Lower midline incisions safest for nerve preservation\n• Laparoscopic port placement lateral to rectus avoids nerves"
      },
      {
        title: "Surgical Considerations",
        content: "Incision Planning:\n• Midline — through linea alba, minimal bleeding, no muscle fibers cut\n• Paramedian — lateral to rectus, can be muscle-splitting or transrectus\n• Transverse — follows skin lines, better cosmesis, more dissection\n• Pfannenstiel — transverse lower abdomen, excellent cosmesis\n\nHernia Sites:\n• Umbilical — through umbilical ring\n• Epigastric — through linea alba above umbilicus\n• Spigelian — lateral border of rectus\n• Incisional — through prior surgical site\n• Inguinal — Hesselbach's triangle (direct) or inguinal canal (indirect)"
      }
    ]
  },

  // ═══ COMPLICATIONS - HEMORRHAGE ═══
  {
    id: 8,
    title: "Intraoperative Hemorrhage: Recognition and Response",
    category: "Complications",
    readTime: "12 min",
    difficulty: "Intermediate",
    related: ["Appendectomy", "Cholecystectomy", "Heart Bypass (CABG)", "C-Section"],
    excerpt: "Bleeding is the most feared intraoperative complication. Know how to recognize it, control it, and communicate with your team.",
    sections: [
      {
        title: "Classification of Hemorrhage",
        content: "By Source:\n• Arterial — bright red, pulsatile, high pressure\n• Venous — dark red, continuous, variable pressure\n• Capillary — oozing, diffuse, low pressure\n• Parenchymal — organ bleeding (liver, spleen)\n\nBy Timing:\n• Primary — during surgery\n• Reactionary — within 24 hours (clot displacement)\n• Secondary — days later (infection, necrosis)\n\nBy Severity:\n• Class I — <15% blood volume lost, minimal tachycardia\n• Class II — 15-30% lost, tachycardia, narrowed pulse pressure\n• Class III — 30-40% lost, hypotension, confusion\n• Class IV — >40% lost, life-threatening"
      },
      {
        title: "Immediate Response Protocol",
        content: "STOP THE BLEEDING — The mantra:\n\nS — Survey the field\nT — Tell anesthesia (\"I have bleeding\")\nO — Occlude the vessel (direct pressure, clamp)\nP — Prepare for blood products\n\nInitial Maneuvers:\n• Direct pressure with laparotomy pads\n• Do NOT blindly clamp in a pool of blood\n• Suction to identify source\n• Call for help if major vessel injury\n\nCommunication with Anesthesia:\n• Quantify blood loss (\"500cc so far\")\n• Request blood products if needed\n• Prepare for massive transfusion protocol\n• Keep surgeon informed of vitals"
      },
      {
        title: "Specific Control Techniques",
        content: "Arterial Bleeding:\n• Apply direct pressure proximal and distal\n• Suction to identify the vessel\n• Precision clamp (not blind)\n• Ligate with suture or clips\n• May need vascular repair for named vessels\n\nVenous Bleeding:\n• Direct pressure usually sufficient\n• Suture ligature for larger veins\n• Venous injury may not require repair — ligation acceptable\n\nParenchymal Bleeding (Liver, Spleen):\n• Direct pressure\n• Hemostatic agents (Surgicel, Gelfoam, fibrin glue)\n• Electrocautery (bipolar for liver)\n• Suture repair (mattress sutures with pledgets)\n• Packing (damage control)\n\nUncontrolled Bleeding:\n• Pack all quadrants\n• Resuscitate in ICU\n• Return to OR in 24-48 hours\n"
      },
      {
        title: "Damage Control Surgery",
        content: "Indications:\n• Physiologic exhaustion (hypothermia, acidosis, coagulopathy)\n• Estimated blood loss >10 units\n• Coagulopathy on labs\n• Unable to control bleeding surgically\n\nPrinciples:\n1. Control hemorrhage (pack, ligate, shunt)\n2. Control contamination (staple, suture, resect)\n3. Temporary closure (vacuum dressing, towel clip)\n4. ICU resuscitation (warm, correct coagulopathy)\n5. Planned reoperation (24-48 hours)\n\nDo NOT perform definitive repairs in damage control:\n• No primary anastomosis\n• No complex vascular repairs\n• No stoma creation (unless absolutely necessary)\n• Focus on survival"
      }
    ]
  },

  // ═══ TECHNIQUES - SUTURE AND KNOTS ═══
  {
    id: 9,
    title: "Surgical Knots and Suture Techniques",
    category: "Techniques",
    readTime: "8 min",
    difficulty: "Beginner",
    related: ["Appendectomy", "Cholecystectomy", "C-Section", "Craniotomy"],
    excerpt: "Every surgeon must master knot tying. Learn the two-handed square knot, instrument ties, and when to use each technique.",
    sections: [
      {
        title: "Suture Materials",
        content: "Absorbable:\n• Vicryl (polyglactin) — 70% strength at 14 days, complete at 60-90 days\n• PDS (polydioxanone) — 50% at 4 weeks, complete at 6 months\n• Monocryl (poliglecaprone) — rapid absorption, 50% at 7 days\n• Chromic gut — natural, unpredictable absorption\n\nNon-Absorbable:\n• Prolene (polypropylene) — permanent, minimal tissue reaction\n• Silk — braided, easy handling, high tissue reaction\n• Nylon (Ethilon) — monofilament, good for skin\n• Stainless steel — highest strength, difficult handling\n\nSelection Principles:\n• Slow-healing tissues need longer-lasting sutures (PDS for fascia)\n• Contaminated wounds need absorbable sutures\n• Skin closure: non-absorbable or rapid-absorbing subcuticular\n• Vascular anastomosis: non-absorbable monofilament (Prolene)"
      },
      {
        title: "The Square Knot",
        content: "The Two-Handed Square Knot — The Foundation:\n\nFirst Throw:\n1. Place suture through tissue\n2. Hold needle end in right hand, free end in left\n3. Cross right over left\n4. Pinch left strand with right thumb and index\n5. Pass left strand over right thumb\n6. Bring right strand down and through the loop\n7. Tighten by pulling hands apart (equal tension)\n\nSecond Throw:\n1. Cross left over right (opposite direction)\n2. Form loop with right strand\n3. Pass left strand through loop\n4. Tighten in opposite direction\n\nCritical Points:\n• First throw must lay flat before second throw\n• Equal tension on both strands\n• Second throw must be opposite direction\n• Test by pulling — should lock, not slip"
      },
      {
        title: "Instrument Tie",
        content: "When to Use:\n• Deep spaces where hands cannot reach\n• Laparoscopic surgery\n• When needle holder is the only instrument available\n• Short suture length\n\nTechnique:\n1. Grasp needle end with needle holder\n2. Wrap suture twice around needle holder (for first throw)\n3. Grasp the free end with needle holder\n4. Pull through to create first throw\n5. For second throw, wrap once in opposite direction\n6. Grasp free end and pull through\n\nCommon Errors:\n• Too much tension on first throw (cuts tissue)\n• Not pulling hands apart (creates granny knot)\n• Wrapping in same direction twice (slips)\n• Not visualizing knot placement"
      },
      {
        title: "Laparoscopic Knots",
        content: "Extracorporeal Knots (pushed from outside):\n• Tie knot outside the body\n• Use knot pusher to slide knot down\n• Good for long sutures\n• Allows complex knot patterns\n\nIntracorporeal Knots (tied inside):\n• Standard instrument tie technique\n• Requires practice for dexterity\n• Use curved needle driver for better manipulation\n\nPre-tied Loops (Endoloop):\n• Ready-made sliding knot\n• Place loop around structure\n• Tighten by pulling tail\n• Secure with pusher\n• Fast and reliable for structures like appendix base\n\nClip Appliers:\n• Titanium clips for vessel ligation\n• Faster than suturing\n• Not for tension-bearing structures"
      }
    ]
  },

  // ═══ PHARMACOLOGY - ANESTHESIA ═══
  {
    id: 10,
    title: "Anesthetic Agents in Surgery",
    category: "Pharmacology",
    readTime: "11 min",
    difficulty: "Beginner",
    related: ["Appendectomy", "Cholecystectomy", "Heart Bypass (CABG)", "C-Section"],
    excerpt: "Understanding anesthetic agents helps surgeons anticipate patient responses and communicate effectively with anesthesia.",
    sections: [
      {
        title: "Induction Agents",
        content: "Propofol:\n• Most common induction agent\n• Rapid onset (30-60 seconds)\n• Short duration (5-10 minutes)\n• Causes hypotension (vasodilation, myocardial depression)\n• Used for maintenance (TIVA — total intravenous anesthesia)\n• Pain on injection (can be reduced with lidocaine)\n\nEtomidate:\n• Hemodynamically stable — preferred in cardiac patients\n• Minimal effect on blood pressure\n• Adrenal suppression (single dose acceptable)\n• Causes myoclonus\n\nKetamine:\n• Dissociative anesthetic\n• Increases heart rate and blood pressure\n• Bronchodilation — good for asthmatics\n• Emergence delirium (can be reduced with benzodiazepines)\n• Good for trauma, hypotensive patients"
      },
      {
        title: "Neuromuscular Blockers",
        content: "Depolarizing (Succinylcholine):\n• Rapid onset (30-60 seconds)\n• Short duration (5-10 minutes)\n• Causes fasciculations, then paralysis\n• Contraindicated in: hyperkalemia, burns, spinal cord injury, malignant hyperthermia\n• Must wait for fasciculations to stop before intubating\n\nNon-Depolarizing (Rocuronium, Vecuronium, Cisatracurium):\n• Slower onset (2-3 minutes)\n• Longer duration (30-60 minutes)\n• No fasciculations\n• Reversed by neostigmine or sugammadex (rocuronium only)\n• Preferred for most surgeries\n\nMonitoring:\n• Train-of-four (TOF) stimulation\n• Goal: 1-2 twitches for adequate relaxation\n• TOF ratio >0.9 before extubation"
      },
      {
        title: "Volatile Anesthetics",
        content: "Sevoflurane:\n• Most commonly used\n• Rapid onset and emergence\n• Pleasant smell, well tolerated for mask induction\n• Minimal metabolism\n\nDesflurane:\n• Fastest onset and emergence\n• Pungent odor — not for mask induction\n• Good for short procedures\n• Airway irritation\n\nIsoflurane:\n• Slower onset and emergence\n• Older agent, less commonly used\n• Good vasodilation\n\nMinimum Alveolar Concentration (MAC):\n• Concentration needed to prevent movement in 50% of patients\n• MAC decreases with age, hypothermia, pregnancy\n• MAC increases with: alcohol tolerance, hyperthermia, anxiety"
      },
      {
        title: "Opioids",
        content: "Fentanyl:\n• Most common intraoperative opioid\n• Rapid onset (2-3 minutes)\n• Short duration (30-60 minutes)\n• Given in boluses during surgery\n• Causes chest wall rigidity in high doses\n\nMorphine:\n• Longer duration (3-4 hours)\n• Used for postoperative pain\n• Histamine release (hypotension, bronchoconstriction)\n• Metabolized by liver\n\nRemifentanil:\n• Ultra-short acting (5-10 minutes)\n• Metabolized by plasma esterases\n• Context-sensitive half-time is constant\n• Ideal for TIVA and rapid emergence\n• No postoperative analgesia"
      },
      {
        title: "Reversal Agents",
        content: "Neostigmine:\n• Acetylcholinesterase inhibitor\n• Reverses non-depolarizing blockers\n• Must give with glycopyrrolate (anticholinergic)\n• Wait at least 20 minutes after last paralytic dose\n• Cannot reverse profound block (TOF must have ≥1 twitch)\n\nSugammadex:\n• Encapsulates rocuronium and vecuronium\n• Rapid reversal (2-3 minutes) regardless of depth\n• No anticholinergic needed\n• Expensive but invaluable for difficult airways\n• Cannot reverse succinylcholine"
      }
    ]
  },
];

// Procedure ID mapping for links
const PROC_ID_MAP: Record<string, string> = {
  "Appendectomy": "appendectomy",
  "Heart Bypass": "cabg",
  "Heart Bypass (CABG)": "cabg",
  "Craniotomy": "craniotomy",
  "Cholecystectomy": "cholecystectomy",
  "ACL Reconstruction": "acl-reconstruction",
  "C-Section": "c-section",
  "Spinal Fusion": "spinal-fusion",
  "Total Knee Replacement": "total-knee-replacement",
  "Emergency Exploratory Laparotomy": "exploratory-laparotomy",
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function LearnHub() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedArticle, setSelectedArticle] = useState(ARTICLES[0]);
  const [location] = useLocation();

  // Check if we came from anatomy with a procedure selected
  const params = new URLSearchParams(window.location.search);
  const procedureParam = params.get("procedure");
  if (procedureParam && !selectedArticle.related.includes(procedureParam)) {
    const matchingArticle = ARTICLES.find(a => a.related.includes(procedureParam));
    if (matchingArticle) setSelectedArticle(matchingArticle);
  }

  const filtered = ARTICLES.filter(a => activeCategory === "All" || a.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16">
        {/* Header */}
        <div className="max-w-6xl mx-auto px-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="label-mono text-muted-foreground">Knowledge Base</span>
              <Link href="/anatomy">
                <span className="text-xs text-primary hover:underline font-mono-data cursor-pointer">← Back to Anatomy</span>
              </Link>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>
              Learn Hub
            </h1>
            <p className="text-muted-foreground">Comprehensive surgical education — anatomy, procedures, and techniques.</p>
          </motion.div>
        </div>

        {/* Category Filters */}
        <div className="max-w-6xl mx-auto px-4 mb-8">
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all font-mono-data uppercase tracking-wide ${
                  activeCategory === cat
                    ? "bg-teal-500 text-white"
                    : "bg-muted/50 text-muted-foreground hover:bg-teal-500/10 hover:border-teal-400/30 border border-border"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Two-column layout */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Article List */}
            <div className="lg:col-span-2 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
              {filtered.map((article, i) => (
                <motion.button
                  key={article.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  onClick={() => setSelectedArticle(article)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedArticle.id === article.id
                      ? "border-teal-400/40 bg-teal-400/5 shadow-[0_0_20px_rgba(93,202,165,0.15)]"
                      : "border-border bg-card/90 hover:border-teal-400/20 hover:bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-sm font-semibold text-foreground leading-snug" style={{ fontFamily: "'Syne', sans-serif" }}>
                      {article.title}
                    </h3>
                    <ChevronRight className={`w-4 h-4 flex-shrink-0 mt-0.5 transition-colors ${
                      selectedArticle.id === article.id ? "text-teal-400" : "text-muted-foreground"
                    }`} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono-data">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" /> {article.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {article.readTime}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Article Content */}
            <div className="lg:col-span-3">
              <motion.div
                key={selectedArticle.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-teal-400/20 bg-card/90 backdrop-blur-xl p-6 lg:p-8 sticky top-24 shadow-[0_0_30px_rgba(93,202,165,0.1)] max-h-[calc(100vh-150px)] overflow-y-auto"
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold font-mono-data ${
                    selectedArticle.difficulty === "Beginner"
                      ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
                      : selectedArticle.difficulty === "Intermediate"
                        ? "bg-amber-400/10 text-amber-400 border border-amber-400/20"
                        : "bg-red-400/10 text-red-400 border border-red-400/20"
                  }`}>
                    {selectedArticle.difficulty}
                  </span>
                  <span className="label-mono text-muted-foreground">{selectedArticle.category}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono-data ml-auto">
                    <Clock className="w-3 h-3" /> {selectedArticle.readTime} read
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-foreground mb-4 leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {selectedArticle.title}
                </h2>

                <p className="text-muted-foreground text-sm mb-6 leading-relaxed italic border-l-2 border-primary/30 pl-4">
                  {selectedArticle.excerpt}
                </p>

                {/* Sections */}
                <div className="space-y-6">
                  {selectedArticle.sections.map((section, idx) => (
                    <div key={idx}>
                      <h3 className="text-lg font-bold text-foreground mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>
                        {section.title}
                      </h3>
                      <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {section.content.split('\n\n').map((para, pIdx) => {
                          if (para.startsWith('•')) {
                            return <p key={pIdx} className="mb-2 pl-2">{para}</p>;
                          }
                          if (para.startsWith('**') && para.includes('**')) {
                            const parts = para.split(/\*\*(.*?)\*\*/g);
                            return (
                              <p key={pIdx} className="mb-3">
                                {parts.map((part, j) =>
                                  j % 2 === 1
                                    ? <strong key={j} className="text-foreground font-semibold">{part}</strong>
                                    : part
                                )}
                              </p>
                            );
                          }
                          return <p key={pIdx} className="mb-3">{para}</p>;
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Related Simulations */}
                {selectedArticle.related.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-border">
                    <div className="label-mono text-muted-foreground mb-3">Practice in Simulation</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedArticle.related.map(rel => {
                        const procId = PROC_ID_MAP[rel] || "appendectomy";
                        return (
                          <Link key={rel} href={`/simulation?proc=${procId}`}>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors cursor-pointer">
                              <BookOpen className="w-3 h-3" />
                              {rel}
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </Link>
                        );
                      })}
                      <Link href="/anatomy">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-400/20 text-teal-400 text-xs font-semibold hover:bg-teal-500/20 transition-colors cursor-pointer">
                          <Activity className="w-3 h-3" />
                          3D Anatomy
                        </span>
                      </Link>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
