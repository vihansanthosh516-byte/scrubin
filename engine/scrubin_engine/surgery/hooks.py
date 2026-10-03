"""Risk hooks for surgical tasks.

`start_<name>(proc, task)` runs when a task starts, `end_<name>(proc, task,
running)` when it completes. Randomness always comes from the case RNG so
cases stay reproducible.
"""

from __future__ import annotations

import sys
from typing import TYPE_CHECKING

if TYPE_CHECKING:  # pragma: no cover
    from .procedure import Procedure, Running

LAPAROSCOPIC = {"explore", "lyse_adhesions", "mobilize_cecum", "grasp_appendix", "window", "divide_meso", "secure_base", "divide_appendix", "bag", "irrigate",
                "retract_fundus", "dissect_triangle", "clip_duct", "clip_artery", "divide_cystic", "dissect_liver_bed",
                "identify_landmarks", "incise_peritoneum", "develop_flap", "reduce_sac", "parietalize", "place_mesh", "fix_mesh", "close_peritoneum",
                "sweep_bowel", "medial_dissect", "identify_ureter", "divide_ima", "lateral_mobilize", "assess_reach", "mobilize_flexure", "divide_distal",
                "place_anvil", "anastomose", "leak_test",
                "round_ligaments", "adnexa", "bladder_flap", "open_broad_ligament", "uterine_arteries", "colpotomy", "close_cuff",
                "reflect_colon", "kocher_duodenum", "mobilize_spleen", "expose_hilum", "survey_hilum", "isolate_artery", "isolate_vein", "spare_adrenal", "take_adrenal", "free_kidney",
                "drop_bladder", "endopelvic_fascia", "dvc_ligate", "bladder_neck", "seminal_vesicles", "denonvilliers", "spare_nerves", "wide_excision", "divide_urethra", "anastomose"}
NEEDS_EXPOSURE = {"explore", "grasp_appendix", "mobilize_cecum", "window", "divide_meso", "retract_fundus", "dissect_triangle", "dissect_liver_bed",
                  "incise_peritoneum", "develop_flap", "reduce_sac", "sweep_bowel", "medial_dissect", "identify_ureter", "divide_ima", "lateral_mobilize",
                  "mobilize_flexure", "divide_distal", "round_ligaments", "adnexa", "bladder_flap", "open_broad_ligament", "uterine_arteries",
                  "reflect_colon", "kocher_duodenum", "mobilize_spleen", "expose_hilum", "isolate_artery", "isolate_vein", "free_kidney",
                  "drop_bladder", "endopelvic_fascia", "dvc_ligate", "bladder_neck", "seminal_vesicles", "denonvilliers", "spare_nerves", "wide_excision", "divide_urethra"}


def _rng(proc: "Procedure"):
    return proc.case.rng


def _instrument(proc: "Procedure", r: "Running") -> dict:
    return proc.spec["instruments"].get(r.instrument or "", {})


def duration_factor(proc: "Procedure", task: dict) -> float:
    f = 1.0
    h = proc.case.patient.hidden
    tid = task["id"]
    if tid in LAPAROSCOPIC and not proc.flag("relaxed"):
        f *= 1.4
    if tid in NEEDS_EXPOSURE and not proc.flag("positioned"):
        f *= 1.3
    if tid in ("grasp_appendix", "window", "divide_meso") and h.get("perforated"):
        f *= 1.3
    if tid == "mobilize_cecum" and h.get("adhesions"):
        f *= 1.2
    if tid in ("dissect_triangle", "dissect_liver_bed") and h.get("acute_inflammation"):
        f *= 1.5
    if tid in ("medial_dissect", "lateral_mobilize", "mobilize_flexure", "divide_distal") and h.get("inflamed"):
        f *= 1.4
    if tid in ("bladder_flap", "uterine_arteries", "remove_specimen") and h.get("large_uterus"):
        f *= 1.3
    if tid == "bladder_flap" and h.get("bladder_adherent"):
        f *= 1.3
    if tid in ("expose_hilum", "free_kidney", "isolate_vein") and h.get("bulky_tumor"):
        f *= 1.3
    if tid in ("drop_bladder", "bladder_neck", "seminal_vesicles", "divide_urethra") and h.get("large_gland"):
        f *= 1.25
    return f


# --- incision / access -------------------------------------------------

def start_record_incision(proc, task):
    c = proc.case
    if c.metrics.incision_t is None:
        c.metrics.incision_t = c.t
        c.event("incision")
        if c.metrics.antibiotic_t is not None and c.t - c.metrics.antibiotic_t > 3600:
            proc.notes.append("Antibiotics were given more than 60 minutes before incision.")


def end_veress_placement(proc, task, r):
    if _rng(proc).random() < 0.06:
        proc.flags.add("veress_preperitoneal")


def start_insufflation_checks(proc, task):
    c = proc.case
    if "veress_preperitoneal" in proc.flags:
        c.say("scrub", "Opening pressure is 13 mmHg at only 1 L/min flow…")
        if proc.mode == "auto":
            proc.surgeon_says("Pressure's too high — Veress isn't in. Re-siting.")
            proc.flags.discard("veress_preperitoneal")
        else:
            proc.flags.add("subq_emphysema")
            proc.occult.append("Preperitoneal insufflation (high opening pressure ignored): subcutaneous emphysema, extra CO2 absorption.")
    if not proc.flag("relaxed"):
        proc.surgeon_says(f"Pressure's climbing but the abdomen isn't expanding — {c.patient.he}'s not relaxed.", key="relax_insuff")


def end_blind_trocar_risk(proc, task, r):
    if _rng(proc).random() < 0.005:
        proc.occult.append("Unrecognised small bowel injury from blind trocar insertion.")


# --- findings / exposure ----------------------------------------------

def end_reveal_findings(proc, task, r):
    h = proc.case.patient.hidden
    pos = {"retrocecal": "retrocecal", "pelvic": "hanging into the pelvis", "subcecal": "subcecal"}[h.get("appendix_position", "pelvic")]
    parts = [f"Inflamed appendix, {pos}."]
    if h.get("perforated"):
        parts.append("It's perforated — purulent fluid in the pelvis.")
    else:
        parts.append("No perforation.")
    if h.get("adhesions"):
        parts.append("Omentum is stuck down to the cecum.")
    proc.findings = parts
    who = "surgeon" if proc.mode == "auto" else "system"
    proc.case.say(who, " ".join(parts), kind="finding" if who == "system" else "speech")
    if h.get("perforated"):
        proc.flags.add("perforated_known")


def start_exposure_check(proc, task):
    if not proc.flag("positioned"):
        if proc.mode == "trainee":
            proc.case.say("scrub", "Exposure is poor — bowel keeps falling into the field. Want the table tilted?")


def start_grasp_perforated(proc, task):
    r = proc.running
    if proc.case.patient.hidden.get("perforated") and r and r.instrument == "maryland" and _rng(proc).random() < 0.5:
        proc.flags.add("spillage")
        proc.case.say("system" if proc.mode == "trainee" else "surgeon", "The friable appendix tears — pus spills into the right lower quadrant.")
        proc.occult.append("Appendix torn with a traumatic grasper: intra-abdominal spillage.")


# --- dissection ----------------------------------------------------------

def _bleed(proc, rate, source, text):
    from .procedure import Bleeder

    proc.bleeders.append(Bleeder(source, rate, proc.case.t))
    proc.case.event("complication", name="bleeding", source=source, rate_ml_min=rate)
    who = "surgeon" if proc.mode == "auto" else "system"
    proc.case.say(who, text)


def end_mesoappendix_bleed(proc, task, r):
    h = proc.case.patient.hidden
    ins = _instrument(proc, r)
    p = 0.03
    rate = 120.0
    if not ins.get("hemostatic"):
        p = 1.0
        rate = 150.0
    elif r.instrument == "hook_cautery":
        p = 0.3
        rate = 80.0
    if h.get("accessory_appendiceal_artery"):
        p = max(p, 0.05 if r.instrument in ("ligasure", "stapler", "clip_applier") else 0.3)
    if r.moved:
        p = max(p, 0.5)
        proc.notes.append("The patient moved during mesoappendix division.")
    if _rng(proc).random() < p:
        _bleed(proc, rate, "appendiceal artery", "Bleeder from the appendiceal artery! Suction!" if proc.mode == "auto" else "Bright red blood wells up from the mesoappendix — the appendiceal artery is bleeding.")


def end_thermal_bowel_risk(proc, task, r):
    ins = _instrument(proc, r)
    p = 0.02 if ins.get("thermal") else 0.0
    if r.moved:
        p += 0.15
    if p and _rng(proc).random() < p:
        proc.flags.add("thermal_injury")
        proc.occult.append(f"Unrecognised thermal injury to the {proc.spec.get('thermal_organ', 'cecum')}.")


def end_base_technique(proc, task, r):
    h = proc.case.patient.hidden
    if h.get("perforated") and r.instrument == "endoloop":
        proc.notes.append("Perforated appendix with a friable base secured with endoloops rather than a stapler (higher stump leak risk).")
        if _rng(proc).random() < 0.3:
            proc.occult.append("Stump leak risk: loops on an inflamed, friable base.")


def end_specimen_contamination(proc, task, r):
    if "bagged" not in proc.flags:
        proc.notes.append(f"Specimen removed without a {proc.spec.get('bag_name', 'retrieval bag')} (port-site infection risk).")
        if proc.case.patient.hidden.get("perforated"):
            proc.flags.add("wound_contaminated")


def end_irrigation_effect(proc, task, r):
    proc.flags.discard("spillage")


def end_reveal_occult(proc, task, r):
    c = proc.case
    txt = proc.spec.get("hemostasis_ok", "Stump secure, mesoappendix dry.")
    if "thermal_injury" in proc.flags and _rng(proc).random() < 0.6:
        proc.flags.discard("thermal_injury")
        proc.occult = [o for o in proc.occult if "thermal" not in o]
        organ = proc.spec.get("thermal_organ", "cecum")
        proc.notes.append(f"Thermal {organ} injury recognised on inspection and oversewn.")
        txt = f"Blanched area on the {organ} — thermal injury. Oversewing it."
    who = "surgeon" if proc.mode == "auto" else "system"
    c.say(who, txt)


def end_control_bleeder(proc, task, r):
    ins = _instrument(proc, r)
    if ins.get("hemostatic"):
        proc.bleeders.clear()
        msg = "Bleeding controlled."
    else:
        for b in proc.bleeders:
            b.rate_ml_min *= 0.3
        msg = "Pressure is slowing it down, but it'll need a clip or energy device."
    who = "surgeon" if proc.mode == "auto" else "system"
    proc.case.say(who, msg)


def end_count_result(proc, task, r):
    proc.case.say("circulator", "Sponge, needle and instrument counts are correct.")


def start_closing_cue(proc, task):
    if proc.mode == "auto":
        proc.surgeon_says("Closing now — about ten minutes left.")
    else:
        proc.case.say("anesthesia", "Thanks — I'll start planning emergence.")


def end_finish(proc, task, r):
    c = proc.case
    proc.finished = True
    proc.iap_target = 0.0
    c.status = "emergence"
    c.event("surgery_complete")
    if "counted" not in proc.flags:
        proc.notes.append("Closed without a completed count (retained item risk).")
    for name in proc.spec.get("final_checks", []):
        getattr(sys.modules[__name__], f"final_{name}")(proc)
    if proc.mode == "auto":
        proc.surgeon_says(f"All done. Thanks everyone — {c.patient.he}'s all yours.")
    else:
        c.say("anesthesia", f"Nice work. I'll wake {c.patient.him} up.")


# --- laparoscopic cholecystectomy ----------------------------------------

def end_reveal_gb_findings(proc, task, r):
    h = proc.case.patient.hidden
    parts = ["Gallbladder is distended, thick-walled and oedematous — acute cholecystitis." if h.get("acute_inflammation")
             else "Gallbladder with stones, mild chronic wall thickening."]
    if h.get("adhesions"):
        parts.append("Omentum and duodenum are stuck to the gallbladder.")
    proc.findings = parts
    who = "surgeon" if proc.mode == "auto" else "system"
    proc.case.say(who, " ".join(parts), kind="finding" if who == "system" else "speech")


def _spill(proc, how):
    if "spillage" in proc.flags:
        return
    proc.flags.add("spillage")
    proc.case.say("surgeon" if proc.mode == "auto" else "system", f"The gallbladder tears {how} — bile and a few stones spill out.")
    proc.notes.append("Gallbladder perforated — spilled stones should be retrieved and the field irrigated.")


def start_triangle_risk(proc, task):
    if proc.mode == "trainee":
        proc.case.say("attending", "Take your time here. I want to see the critical view of safety before anything gets clipped.")


def end_triangle_risk(proc, task, r):
    h = proc.case.patient.hidden
    rng = _rng(proc)
    if r.instrument == "hook_cautery" and h.get("posterior_cystic_artery") and rng.random() < 0.4:
        _bleed(proc, 90.0, "cystic artery", "Bleeder from a posterior cystic artery branch! Suction!" if proc.mode == "auto"
               else "Pulsatile bleeding from behind the cystic duct — a posterior branch of the cystic artery.")
    if rng.random() < (0.25 if h.get("acute_inflammation") else 0.08):
        _spill(proc, "at the neck")
    if r.moved:
        proc.notes.append("The patient moved during dissection of the hepatocystic triangle.")


def end_confirm_cvs(proc, task, r):
    if proc.mode == "trainee":
        proc.case.say("attending", "Good — that's a critical view. Two structures only. Go ahead and clip.")
    msg = ("Critical view of safety: hepatocystic triangle cleared, lower third of the cystic plate exposed, "
           "two and only two structures entering the gallbladder.")
    proc.case.say("surgeon" if proc.mode == "auto" else "system", msg, **({} if proc.mode == "auto" else {"kind": "finding"}))


def start_clip_risk(proc, task):
    """Clipping before the critical view is how bile duct injuries happen."""
    if "cvs" in proc.flags:
        return
    h = proc.case.patient.hidden
    rng = _rng(proc)
    proc.notes.append(f"{task['name']} clipped without a critical view of safety.")
    if task["id"] == "clip_duct" and rng.random() < (0.5 if h.get("acute_inflammation") else 0.25):
        proc.flags.add("bile_duct_injury")
        proc.occult.append("Common bile duct clipped and divided — mistaken for the cystic duct (classic laparoscopic bile duct injury).")
    if task["id"] == "clip_artery" and rng.random() < 0.15:
        proc.occult.append("Right hepatic artery clipped — mistaken for the cystic artery.")


def end_liver_bed_risk(proc, task, r):
    h = proc.case.patient.hidden
    rng = _rng(proc)
    thermal = _instrument(proc, r).get("thermal")
    if rng.random() < (0.3 if h.get("acute_inflammation") else 0.12) + (0.15 if r.moved else 0.0):
        _spill(proc, "off the liver bed")
    if rng.random() < (0.15 if thermal else 0.4):
        _bleed(proc, 60.0, "liver bed", "Liver bed is oozing — need the hook on it." if proc.mode == "auto" else "The gallbladder fossa is oozing steadily.")


# --- laparoscopic inguinal hernia (TAPP) -----------------------------------

def _speaker(proc) -> str:
    return "surgeon" if proc.mode == "auto" else "system"


def end_reveal_hernia_findings(proc, task, r):
    h = proc.case.patient.hidden
    kind = h.get("hernia_type", "indirect")
    parts = [("Right indirect hernia: the sac enters the deep ring lateral to the inferior epigastric vessels." if kind == "indirect"
              else "Right direct hernia: a bulge through the floor of the inguinal canal, medial to the inferior epigastric vessels.")]
    parts.append("The left groin has a small defect too." if h.get("contralateral_defect") else "The left groin is intact.")
    if h.get("prior_pelvic_surgery"):
        parts.append("There are old pelvic adhesions from a previous operation, tethering the bladder dome.")
    proc.findings = parts
    proc.case.say(_speaker(proc), " ".join(parts), kind="speech" if proc.mode == "auto" else "finding")


def end_landmarks(proc, task, r):
    msg = ("Landmarks: median and medial umbilical ligaments, inferior epigastric vessels, the deep ring and the cord. "
           "Below the iliopubic tract: triangle of doom (iliac vessels) medially, triangle of pain (nerves) laterally. Staying above it.")
    if proc.mode == "trainee":
        proc.case.say("attending", "Good. Epigastrics, ligaments, cord. Nothing below the iliopubic tract gets a tack or a clip.")
        proc.case.say("system", msg, kind="finding")
    else:
        proc.case.say("surgeon", msg)


def start_peritoneal_flap_risk(proc, task):
    if "landmarks_identified" in proc.flags:
        return
    proc.notes.append("Peritoneum incised before identifying the inferior epigastric vessels, the vas and the iliac vessels.")
    if _rng(proc).random() < 0.2:
        _bleed(proc, 90.0, "inferior epigastric vessels", "Bleeding from the inferior epigastric vessels! Suction!" if proc.mode == "auto"
               else "Brisk bleeding from the inferior epigastric artery — it was under the incision.")


def end_flap_risk(proc, task, r):
    h = proc.case.patient.hidden
    rng = _rng(proc)
    if "bladder_empty" not in proc.flags:
        p = 0.45 + (0.2 if h.get("prior_pelvic_surgery") else 0.0)
        proc.notes.append("The bladder wasn't emptied before the pelvic dissection.")
        if rng.random() < p:
            proc.occult.append("Bladder injury: the full bladder dome was cut or cauterised during the flap dissection and not recognised "
                               "(haematuria, urinoma, a leaking cystotomy after discharge).")
    elif h.get("prior_pelvic_surgery") and rng.random() < 0.1:
        proc.case.say(_speaker(proc), "The bladder dome is stuck down — small serosal tear. Oversewing it, catheter stays in overnight." if proc.mode == "auto"
                      else "The bladder dome is stuck down and the serosa tears. Oversewn, with a catheter overnight.", kind="speech" if proc.mode == "auto" else "finding")
        proc.notes.append("Bladder serosal injury in adhesions, recognised and repaired.")
    if h.get("corona_mortis") and rng.random() < (0.5 if r.instrument not in ("harmonic",) else 0.15):
        _bleed(proc, 60.0, "corona mortis", "Bleeder from an aberrant pubic vessel — the corona mortis!" if proc.mode == "auto"
               else "Dark blood wells up along Cooper's ligament — an aberrant vessel, the corona mortis.")
    if r.moved:
        proc.notes.append("The patient moved during the preperitoneal dissection.")


def end_reduce_sac_risk(proc, task, r):
    h = proc.case.patient.hidden
    thermal = _instrument(proc, r).get("thermal")
    p = (0.25 if h.get("vas_adherent") else 0.02) * (2.0 if thermal else 1.0) + (0.1 if r.moved else 0.0)
    if _rng(proc).random() < min(0.8, p):
        proc.occult.append("Vas deferens injured while reducing the sac" + (" with energy" if thermal else "") +
                           " (testicular pain, swelling, or a subfertility problem later).")
    if h.get("hernia_type") == "direct":
        proc.case.say(_speaker(proc), "Direct defect: inverting the pseudosac rather than dividing it.", kind="speech" if proc.mode == "auto" else "finding")


def end_mesh_placement(proc, task, r):
    if "parietalized" not in proc.flags:
        proc.notes.append("Mesh placed over a cord that wasn't parietalized: it can fold and roll (early recurrence).")
        if _rng(proc).random() < 0.4:
            proc.occult.append("Mesh folded over the cord: early recurrence.")


def start_mesh_fixation(proc, task):
    r = proc.running
    where = {"triangle_doom": "Tacks going in below the iliopubic tract, next to the iliac vessels (triangle of doom).",
             "triangle_pain": "Tacks going in lateral to the vessels, below the iliopubic tract (triangle of pain)."}.get(r.target if r else None)
    proc.surgeon_says(where or "Fixing the mesh to Cooper's ligament and the anterior abdominal wall, above the iliopubic tract only.")
    if proc.mode == "trainee":
        proc.case.say("attending", "Tacks above the iliopubic tract only: Cooper's ligament and the rectus. Not below, not lateral to the vessels.", )


def end_mesh_fixation(proc, task, r):
    rng = _rng(proc)
    if r.target == "triangle_doom":
        proc.notes.append("Mesh tacks placed in the triangle of doom (external iliac vessels).")
        if rng.random() < 0.5:
            _bleed(proc, 140.0, "external iliac branch", "A tack went through a vessel by the iliacs — dark blood in the pelvis!" if proc.mode == "auto"
                   else "Dark blood wells up around the tack by the iliac vessels.")
        if rng.random() < 0.55:
            proc.occult.append("Tack through the external iliac vessels (triangle of doom): delayed bleeding or pseudoaneurysm.")
    elif r.target == "triangle_pain":
        proc.notes.append("Mesh tacks placed in the triangle of pain (lateral femoral cutaneous and genitofemoral nerves).")
        if rng.random() < 0.75:
            proc.occult.append("Tack entrapped the lateral femoral cutaneous / genitofemoral nerve (triangle of pain): chronic groin pain and numbness of the thigh.")


def final_hernia(proc):
    if "peritoneum_closed" not in proc.flags:
        proc.occult.append("Peritoneal flap left open: the mesh is exposed to bowel (adhesions, small-bowel obstruction, mesh erosion).")


# --- laparoscopic sigmoid colectomy ----------------------------------------

def end_reveal_sigmoid_findings(proc, task, r):
    h = proc.case.patient.hidden
    parts = ["Thickened, inflamed sigmoid with a phlegmon in the mesentery." if h.get("inflamed")
             else "Fibrotic sigmoid with multiple diverticula, no active inflammation."]
    if h.get("adhesions"):
        parts.append("Dense adhesions between the sigmoid, the pelvic sidewall and the old hysterectomy scar.")
    if not h.get("bowel_prepped"):
        parts.append("There's solid stool in the colon: the bowel prep wasn't completed.")
        proc.notes.append("The bowel preparation wasn't completed (more stool in the field, higher infection and leak risk).")
    proc.findings = parts
    proc.case.say(_speaker(proc), " ".join(parts), kind="speech" if proc.mode == "auto" else "finding")


def start_medial_dissection(proc, task):
    if proc.mode == "trainee":
        proc.case.say("attending", "Medial to lateral. Find the left ureter and the gonadal vessels before anything in the mesentery gets divided.")


def end_medial_dissection(proc, task, r):
    h = proc.case.patient.hidden
    if h.get("inflamed") and _rng(proc).random() < 0.15:
        proc.flags.add("spillage")
        proc.case.say(_speaker(proc), "Entering the phlegmon: a little pus escapes into the field, suctioning it." if proc.mode == "auto"
                      else "A small pocket of pus escapes from the phlegmon in the mesentery.", kind="speech" if proc.mode == "auto" else "finding")
        proc.notes.append("The mesenteric phlegmon was entered: pus in the field should be suctioned and the pelvis irrigated.")
    if r.moved:
        proc.notes.append("The patient moved during the retroperitoneal dissection.")


def end_ureter_found(proc, task, r):
    h = proc.case.patient.hidden
    txt = "Left ureter identified under the gonadal vessels, peristalsing, lateral to the pedicle."
    if h.get("ureter_distorted"):
        txt = "Left ureter identified under the gonadal vessels, but it's pulled medially against the inflamed mesentery, much closer to the pedicle than usual."
    if proc.mode == "trainee":
        proc.case.say("attending", "Good. Ureter and gonadals are safely behind. Now you can divide the pedicle.")
        proc.case.say("system", txt, kind="finding")
    else:
        proc.case.say("surgeon", txt)


def end_ima_risk(proc, task, r):
    h = proc.case.patient.hidden
    rng = _rng(proc)
    if "ureter_identified" not in proc.flags:
        proc.notes.append("The IMA pedicle was divided before the left ureter was identified.")
        if rng.random() < (0.45 if h.get("ureter_distorted") else 0.2):
            proc.occult.append("Left ureter injury: clipped or divided with the IMA pedicle (flank pain, urinoma or hydronephrosis, "
                               "a rising creatinine in the days after surgery).")
    elif r.moved and rng.random() < 0.05:
        proc.occult.append("Thermal injury to the left ureter from the sealer when the patient moved.")
    ins = r.instrument
    p = {"ligasure": 0.04, "clip_applier": 0.05, "linear_stapler": 0.03, "harmonic": 0.2}.get(ins, 1.0)
    if rng.random() < p:
        _bleed(proc, 120.0, "IMA stump", "IMA stump is bleeding! Suction!" if proc.mode == "auto"
               else "Bright red blood fills the pedicle: the IMA stump is bleeding.")


def end_lateral_risk(proc, task, r):
    h = proc.case.patient.hidden
    if h.get("inflamed") and "spillage" not in proc.flags and _rng(proc).random() < 0.12:
        proc.flags.add("spillage")
        proc.notes.append("Pus released while mobilizing the inflamed descending colon.")
    if r.moved:
        proc.notes.append("The patient moved during mobilization of the colon.")


def end_reach_check(proc, task, r):
    if proc.case.patient.hidden.get("tension"):
        proc.flags.add("tension")
        proc.case.say(_speaker(proc), "The proximal colon won't reach the pelvis without tension: the splenic flexure has to come down." if proc.mode == "auto"
                      else "The proximal colon only reaches the pelvis under tension. The splenic flexure needs mobilizing.", kind="speech" if proc.mode == "auto" else "finding")
    else:
        proc.flags.add("reach_ok")
        proc.case.say(_speaker(proc), "The colon reaches the pelvis comfortably, no tension." if proc.mode == "auto" else "The colon reaches the pelvis with no tension.",
                      kind="speech" if proc.mode == "auto" else "finding")


def end_flexure_risk(proc, task, r):
    if _rng(proc).random() < 0.08 + (0.1 if r.moved else 0.0):
        _bleed(proc, 70.0, "splenic capsule", "Splenic capsular tear: oozing, need a haemostatic pad." if proc.mode == "auto"
               else "The splenic capsule tore under traction and is oozing.")
        proc.notes.append("Splenic capsular injury during mobilization of the flexure.")


def end_distal_stapler(proc, task, r):
    if _rng(proc).random() < 0.04:
        _bleed(proc, 50.0, "rectal staple line", "Bleeding from the rectal staple line." if proc.mode == "auto" else "The rectal staple line is oozing.")


def end_perfusion_check(proc, task, r):
    h = proc.case.patient.hidden
    if h.get("marginal_perfusion"):
        proc.flags.add("perfusion_resected")
        proc.case.say(_speaker(proc), "The cut edge isn't bleeding well: resecting back another 3 cm to pulsatile bleeding." if proc.mode == "auto"
                      else "The cut edge is dusky and not bleeding. Resected back to bright, pulsatile bleeding.", kind="speech" if proc.mode == "auto" else "finding")
        proc.notes.append("Marginal perfusion of the proximal colon recognised on the perfusion check and resected back.")
    else:
        proc.case.say(_speaker(proc), "Pulsatile bleeding from the cut edge: good perfusion." if proc.mode == "auto" else "Bright pulsatile bleeding from the cut edge: well perfused.",
                      kind="speech" if proc.mode == "auto" else "finding")


def end_anastomosis_risk(proc, task, r):
    h = proc.case.patient.hidden
    p = 0.05
    if "reach_ok" not in proc.flags:
        p += 0.25
        proc.notes.append("Anastomosis made under tension (the splenic flexure wasn't mobilized).")
    if "perfusion_checked" not in proc.flags:
        p += 0.3 if h.get("marginal_perfusion") else 0.03
        proc.notes.append("Perfusion of the proximal colon wasn't checked.")
    if not h.get("bowel_prepped"):
        p += 0.08
    if h.get("inflamed"):
        p += 0.04
    if _rng(proc).random() < p:
        proc.flags.add("anastomotic_defect")


def end_leak_test_result(proc, task, r):
    if "anastomotic_defect" in proc.flags:
        proc.flags.discard("anastomotic_defect")
        proc.case.say(_speaker(proc), "Bubbles at the staple line: a leak. Oversewing it with interrupted sutures and retesting: now dry." if proc.mode == "auto"
                      else "Air bubbles from the staple line: a defect. Oversewn with interrupted sutures; the retest is dry.", kind="speech" if proc.mode == "auto" else "finding")
        proc.notes.append("The air leak test found a staple-line defect, which was repaired (the test paid off).")
    else:
        proc.case.say(_speaker(proc), "No bubbles, and both doughnuts are complete." if proc.mode == "auto" else "No bubbles. Both doughnuts are complete.",
                      kind="speech" if proc.mode == "auto" else "finding")


def final_sigmoid(proc):
    if "leak_test" not in proc.done:
        proc.notes.append("The anastomosis was never leak-tested.")
    if "anastomotic_defect" in proc.flags:
        proc.occult.append("Anastomotic leak, not detected because no air leak test was done (fever, ileus, peritonitis on day 3 to 5; likely a return to theatre).")


# --- total laparoscopic hysterectomy ---------------------------------------

def end_manipulator_risk(proc, task, r):
    h = proc.case.patient.hidden
    if _rng(proc).random() < (0.04 if h.get("large_uterus") else 0.01):
        proc.occult.append("Uterine perforation by the manipulator or sound (small fundal defect, usually settles, but bleeding or a broad-ligament haematoma can follow).")


def end_reveal_uterus_findings(proc, task, r):
    h = proc.case.patient.hidden
    parts = ["Enlarged fibroid uterus, about 14 weeks in size, with three intramural fibroids." if h.get("large_uterus")
             else "Fibroid uterus about 10 weeks in size with two intramural fibroids. Both ovaries and tubes look normal."]
    if h.get("bladder_adherent"):
        parts.append("The bladder is stuck to the lower segment from the caesarean scars.")
    if h.get("adhesions"):
        parts.append("Omentum is adherent to the anterior uterine wall.")
    proc.findings = parts
    proc.case.say(_speaker(proc), " ".join(parts), kind="speech" if proc.mode == "auto" else "finding")


def end_pedicle_bleed(proc, task, r):
    ins = _instrument(proc, r)
    p = 0.04 if ins.get("hemostatic") else 0.8
    if r.instrument == "hook_cautery":
        p = 0.25
    if _rng(proc).random() < p:
        src = "round ligament artery (Sampson's)" if task["id"] == "round_ligaments" else "ovarian pedicle"
        _bleed(proc, 70.0, src, f"Bleeder from the {src}! Suction!" if proc.mode == "auto" else f"Bright blood from the {src}.")


def end_bladder_flap_risk(proc, task, r):
    h = proc.case.patient.hidden
    ins = _instrument(proc, r)
    rng = _rng(proc)
    p = (0.3 if h.get("bladder_adherent") else 0.03) + (0.05 if ins.get("thermal") else 0.0) + (0.1 if r.moved else 0.0)
    if rng.random() < p:
        if rng.random() < 0.6:
            proc.case.say(_speaker(proc), "Cystotomy: clear urine in the field. Closing it in two layers, catheter stays for a week." if proc.mode == "auto"
                          else "Clear fluid wells up: a bladder injury. Repaired in two layers; catheter stays in for a week.", kind="speech" if proc.mode == "auto" else "finding")
            proc.notes.append("Bladder injury during the bladder flap, recognised and repaired.")
        else:
            proc.occult.append("Bladder injury during the flap dissection, not recognised (vesicovaginal fistula, urinoma, haematuria).")


def end_ureter_seen(proc, task, r):
    h = proc.case.patient.hidden
    txt = ("Ureter identified on the medial leaf of the broad ligament, peristalsing, well below where the uterine artery crosses." if not h.get("ureter_displaced")
           else "Ureter identified, but the fibroid has pushed it laterally and it comes very close to the uterine artery.")
    if proc.mode == "trainee":
        proc.case.say("attending", "Good. Ureter is clear of the uterine artery: take it close to the uterus.")
        proc.case.say("system", txt, kind="finding")
    else:
        proc.case.say("surgeon", txt)


def end_uterine_artery_risk(proc, task, r):
    h = proc.case.patient.hidden
    rng = _rng(proc)
    if "ureter_identified" not in proc.flags:
        proc.notes.append("The uterine arteries were coagulated before the ureter was identified.")
        if rng.random() < (0.35 if h.get("ureter_displaced") else 0.15):
            proc.occult.append("Ureteric injury (thermal or clipped) at the uterine artery: flank pain, ureterovaginal fistula or hydronephrosis, recognised days later.")
    ins = _instrument(proc, r)
    p = (0.25 if h.get("large_uterus") else 0.06) * (1.0 if ins.get("hemostatic") else 4.0)
    if r.instrument == "harmonic":
        p = max(p, 0.15)
    if rng.random() < min(0.9, p):
        _bleed(proc, 130.0, "uterine artery", "Uterine artery bleeder! Suction!" if proc.mode == "auto" else "Brisk bleeding from the uterine artery stump.")


def end_colpotomy_risk(proc, task, r):
    h = proc.case.patient.hidden
    rng = _rng(proc)
    if "ureter_identified" not in proc.flags and rng.random() < 0.05:
        proc.occult.append("Thermal injury to the ureter at the lateral colpotomy.")
    if h.get("bladder_adherent") and "bladder_flap_done" in proc.flags and rng.random() < 0.05:
        proc.occult.append("Bladder base thermal injury at the anterior colpotomy.")
    if r.moved:
        proc.notes.append("The patient moved during the colpotomy.")


def end_cuff_closure(proc, task, r):
    if r.moved:
        proc.notes.append("The patient moved while the vaginal cuff was being sutured.")
    proc.case.say(_speaker(proc), "Cuff closed, pedicles incorporated, no gap." if proc.mode == "auto" else "The cuff is closed with full-thickness bites; no gap.",
                  kind="speech" if proc.mode == "auto" else "finding")


def end_cystoscopy_result(proc, task, r):
    found = [o for o in proc.occult if "Ureteric injury" in o or "ureter at the lateral" in o or "Bladder injury during the flap" in o or "Bladder base" in o]
    rng = _rng(proc)
    msg = "Both ureteric orifices are jetting clear urine. Bladder wall intact."
    for o in found:
        if rng.random() < 0.75:
            proc.occult.remove(o)
            msg = "No efflux from one ureteric orifice: a ureter injury. Stent passed and urology informed." if "reter" in o else "A bladder defect is visible: repaired over the catheter."
            proc.notes.append("Cystoscopy caught an injury that would otherwise have been missed: " + o.split(":")[0].split(" during")[0] + ".")
            break
    proc.case.say(_speaker(proc), msg, kind="speech" if proc.mode == "auto" else "finding")


def final_hysterectomy(proc):
    if "cuff_closed" not in proc.flags:
        proc.occult.append("Vaginal cuff left open: haematoma, cuff dehiscence or bowel evisceration through the vagina.")
    if "ureter_identified" not in proc.flags and "cystoscopy_done" not in proc.flags:
        proc.notes.append("No ureter identification and no cystoscopy: nothing would have caught a ureteric injury.")


# --- laparoscopic radical nephrectomy --------------------------------------

def end_reveal_kidney_findings(proc, task, r):
    h = proc.case.patient.hidden
    side = h.get("side", "right")
    parts = [f"{side.capitalize()} kidney with a bulky exophytic tumour at the upper pole." if h.get("bulky_tumor")
             else f"{side.capitalize()} kidney with a 7 cm upper-pole tumour inside Gerota's fascia."]
    parts.append("No peritoneal disease, liver and spleen look normal.")
    if h.get("adhesions"):
        parts.append("The colon is stuck to the lateral sidewall by old adhesions.")
    proc.findings = parts
    proc.case.say(_speaker(proc), " ".join(parts), kind="speech" if proc.mode == "auto" else "finding")


def end_reflect_risk(proc, task, r):
    if r.moved:
        proc.notes.append("The patient moved while the colon was being reflected.")


def end_right_organ_risk(proc, task, r):
    rng = _rng(proc)
    thermal = _instrument(proc, r).get("thermal")
    if thermal and rng.random() < 0.03 + (0.1 if r.moved else 0.0):
        proc.occult.append("Thermal injury to the second part of the duodenum while kocherizing (presents as peritonitis or a duodenal leak on day 2 to 4).")
    if rng.random() < 0.08 + (0.1 if r.moved else 0.0):
        _bleed(proc, 60.0, "liver capsule", "Liver capsule tear from the retractor: oozing, need the sealer." if proc.mode == "auto"
               else "The liver capsule tears under the retractor and is oozing.")


def end_left_organ_risk(proc, task, r):
    rng = _rng(proc)
    if rng.random() < 0.12 + (0.1 if r.moved else 0.0):
        _bleed(proc, 80.0, "splenic capsule", "Splenic capsular tear! Suction, I need a haemostatic pad." if proc.mode == "auto"
               else "The splenic capsule tears under traction and bleeds steadily.")
        proc.notes.append("Splenic capsular injury while dropping the spleen.")
    if rng.random() < 0.02:
        proc.occult.append("Injury to the tail of the pancreas (a pancreatic leak or fluid collection after surgery).")


def end_hilum_view(proc, task, r):
    h = proc.case.patient.hidden
    txt = ("The renal artery is behind and above the vein. At the upper pole, the tumour is stuck to the adrenal gland with no fat plane between them." if h.get("adrenal_involved")
           else "The renal artery is behind and above the vein. At the upper pole, there is a clear fat plane between the tumour and the adrenal gland.")
    proc.findings = proc.findings + [txt]
    proc.case.say(_speaker(proc), txt, kind="speech" if proc.mode == "auto" else "finding")


def end_accessory_check(proc, task, r):
    if proc.case.patient.hidden.get("accessory_renal_artery"):
        proc.flags.add("accessory_found")
        txt = "There's a second, smaller renal artery arising low from the aorta and running behind the vein to the lower pole."
    else:
        txt = "Single renal artery and a single renal vein; no accessory vessels."
    proc.findings = proc.findings + [txt]
    proc.case.say(_speaker(proc), txt, kind="speech" if proc.mode == "auto" else "finding")


def end_artery_division(proc, task, r):
    p = 0.01 if r.instrument == "vascular_stapler" else 0.04
    if _rng(proc).random() < p:
        _bleed(proc, 200.0, "renal artery stump", "A clip has slipped off the renal artery! Suction! Grasping the stump." if proc.mode == "auto"
               else "Pulsatile bleeding: a clip slipped off the renal artery stump.")


def end_vein_division(proc, task, r):
    h = proc.case.patient.hidden
    rng = _rng(proc)
    artery_first = "artery_divided" in proc.flags
    accessory_left = h.get("accessory_renal_artery") and "accessory_divided" not in proc.flags
    if not artery_first:
        proc.notes.append("The renal vein was divided before the renal artery (the kidney engorges, and the vein can tear).")
        _bleed(proc, 300.0, "engorged kidney and hilum", "The kidney is swelling and the hilum is bleeding! Suction!" if proc.mode == "auto"
               else "The kidney swells dark and engorged and the hilum starts to bleed heavily.")
    elif accessory_left:
        proc.occult.append("A second renal artery was never found and stayed open: the kidney kept perfusing after the vein was divided (engorgement, hilar and parenchymal bleeding).")
        proc.notes.append("The hilum was not surveyed for an accessory artery, and the kidney stayed perfused after the vein was divided.")
        _bleed(proc, 200.0, "engorged kidney (accessory artery)", "The kidney is still pink and the hilum is oozing: there must be another artery!" if proc.mode == "auto"
               else "The kidney is still pink and now swelling. There is bleeding around the hilum: another artery is feeding it.")
    elif rng.random() < 0.03:
        _bleed(proc, 150.0, "renal vein stump", "Bleeding from the renal vein staple line." if proc.mode == "auto" else "The renal vein staple line is oozing.")


def start_adrenal_decision(proc, task):
    if proc.mode == "trainee":
        proc.case.say("attending", "What did the CT and the hilar view show? Spare the adrenal when there's a clear fat plane; take it if the tumour is stuck to it.")


def end_adrenal_decision(proc, task, r):
    h = proc.case.patient.hidden
    rng = _rng(proc)
    inv = bool(h.get("adrenal_involved"))
    if task["id"] == "spare_adrenal" and inv:
        proc.occult.append("The adrenal was involved by tumour and was spared: residual tumour at the margin (positive margin, higher local recurrence risk).")
        proc.notes.append("Adrenal spared although the tumour was stuck to the gland.")
    elif task["id"] == "take_adrenal" and not inv:
        proc.notes.append("The adrenal was taken unnecessarily: there was a clear fat plane, and adrenal-sparing is preferred for an upper-pole tumour with no adrenal involvement.")
    if task["id"] == "take_adrenal" and h.get("side") == "right" and rng.random() < 0.06:
        _bleed(proc, 60.0, "right adrenal vein", "Bleeding from the short right adrenal vein into the cava!" if proc.mode == "auto"
               else "The short right adrenal vein tears off the vena cava and bleeds.")


def end_free_risk(proc, task, r):
    h = proc.case.patient.hidden
    rng = _rng(proc)
    if h.get("bulky_tumor") and rng.random() < 0.1 + (0.1 if r.moved else 0.0):
        proc.occult.append("Tumour capsule breached while freeing the bulky kidney (positive margin and a risk of seeding).")
    if rng.random() < 0.08:
        _bleed(proc, 60.0, "lumbar vessel", "Lumbar vessel bleeding." if proc.mode == "auto" else "A lumbar vein behind the kidney is bleeding.")


# --- robotic radical prostatectomy ------------------------------------------

def end_reveal_prostate_findings(proc, task, r):
    h = proc.case.patient.hidden
    parts = ["Large prostate with a prominent median lobe pushing into the bladder base." if h.get("large_gland")
             else "Average-sized prostate, bladder and pelvic sidewalls look normal."]
    parts.append("Both vasa and the iliac vessels are in their usual places; no pelvic nodes are enlarged.")
    proc.findings = parts
    proc.case.say(_speaker(proc), " ".join(parts), kind="speech" if proc.mode == "auto" else "finding")


def end_dvc_stitch(proc, task, r):
    h = proc.case.patient.hidden
    if _rng(proc).random() < (0.2 if h.get("dvc_fragile") else 0.03) + (0.1 if r.moved else 0.0):
        _bleed(proc, 120.0, "dorsal venous complex", "The needle caught the dorsal venous complex: bleeding! Raising the pressure to 20." if proc.mode == "auto"
               else "The needle tears a branch of the dorsal venous complex and dark blood wells up.")


def end_bladder_neck_risk(proc, task, r):
    h = proc.case.patient.hidden
    if _rng(proc).random() < (0.1 if h.get("large_gland") else 0.02):
        proc.occult.append("Injury to a ureteric orifice at the bladder neck (hydronephrosis and flank pain after the catheter is removed).")


def end_rectal_risk(proc, task, r):
    h = proc.case.patient.hidden
    rng = _rng(proc)
    thermal = _instrument(proc, r).get("thermal")
    p = (0.12 if h.get("rectal_adherent") else 0.01) + (0.03 if thermal else 0.0) + (0.05 if r.moved else 0.0)
    if rng.random() < p:
        if rng.random() < 0.6:
            proc.case.say(_speaker(proc), "Rectal injury: stool in the field. Irrigating, two-layer repair and an omental flap; I'll check it with air and saline." if proc.mode == "auto"
                          else "Stool appears in the field: a small anterior rectal wall injury. Repaired in two layers with an omental flap.", kind="speech" if proc.mode == "auto" else "finding")
            proc.notes.append("Rectal injury during the posterior dissection, recognised and repaired in two layers.")
        else:
            proc.occult.append("Unrecognised rectal injury at the posterior dissection (pelvic sepsis or a rectourethral fistula within days to weeks).")


def end_capsule_view(proc, task, r):
    h = proc.case.patient.hidden
    txt = ("The posterolateral capsule on the left is thickened and the neurovascular bundle is stuck to it: suspicious for extraprostatic extension." if h.get("ece")
           else "The capsule is smooth and the neurovascular bundles peel away cleanly: no sign of extraprostatic extension.")
    proc.findings = proc.findings + [txt]
    proc.case.say(_speaker(proc), txt, kind="speech" if proc.mode == "auto" else "finding")


def start_nerve_decision(proc, task):
    if proc.mode == "trainee":
        proc.case.say("attending", "Nerve-sparing only if the cancer is inside the capsule and he has good erections to protect. If the capsule looks involved, take the bundle widely.")


def end_nerve_decision(proc, task, r):
    h = proc.case.patient.hidden
    ece = bool(h.get("ece"))
    ins = _instrument(proc, r)
    if task["id"] == "spare_nerves":
        if ece:
            proc.occult.append("Positive surgical margin: the cancer extended outside the capsule on the side where the bundle was spared (higher risk of biochemical recurrence).")
            proc.notes.append("Nerve-sparing was chosen despite a capsule suspicious for extraprostatic extension.")
        if ins.get("thermal") and _rng(proc).random() < 0.6:
            proc.occult.append("Thermal injury to the neurovascular bundles from energy used during the nerve-sparing dissection (erectile dysfunction despite the attempt to spare).")
            proc.notes.append("Energy was used near the neurovascular bundles; clips and cold scissors are the athermal choice.")
        if not h.get("good_erectile_function"):
            proc.notes.append("Nerve-sparing offers little to a man who already has poor erections.")
    elif not ece and h.get("good_erectile_function"):
        proc.notes.append("Wide excision when the capsule was clear and he had good erections: nerve-sparing was possible (needless loss of potency).")
    if r.moved:
        proc.notes.append("The patient moved during the pedicle dissection.")


def end_dvc_division(proc, task, r):
    h = proc.case.patient.hidden
    rng = _rng(proc)
    if "dvc_ligated" not in proc.flags:
        proc.notes.append("The dorsal venous complex was divided without being suture-ligated first.")
        _bleed(proc, 400.0, "dorsal venous complex", "The dorsal venous complex is pouring! Pressure up to 20, suction!" if proc.mode == "auto"
               else "Dark blood floods the pelvis: the unsecured dorsal venous complex is bleeding heavily.")
    elif rng.random() < (0.15 if h.get("dvc_fragile") else 0.05):
        _bleed(proc, 80.0, "dorsal venous complex stitch", "Ooze from the DVC stump; adding a stitch." if proc.mode == "auto"
               else "The dorsal venous complex stump is oozing past the stitch.")


def end_uv_anastomosis_risk(proc, task, r):
    h = proc.case.patient.hidden
    p = 0.2 + (0.1 if h.get("large_gland") else 0.0) + (0.1 if r.moved else 0.0)
    if _rng(proc).random() < p:
        proc.flags.add("uv_defect")


def end_leak_test_uv(proc, task, r):
    if "uv_defect" in proc.flags:
        proc.flags.discard("uv_defect")
        proc.case.say(_speaker(proc), "Saline is leaking at the posterior anastomosis. Two more interrupted sutures and retesting: now dry." if proc.mode == "auto"
                      else "Saline beads at the posterior wall of the anastomosis: a leak. Two interrupted sutures, and the retest is dry.", kind="speech" if proc.mode == "auto" else "finding")
        proc.notes.append("The leak test found a urethrovesical leak, which was repaired (the test paid off).")
    else:
        proc.case.say(_speaker(proc), "Bladder filled to 200 mL: the anastomosis is watertight." if proc.mode == "auto" else "200 mL in the bladder and the anastomosis is dry.",
                      kind="speech" if proc.mode == "auto" else "finding")


def final_prostatectomy(proc):
    if "leak_test" not in proc.done:
        proc.notes.append("The urethrovesical anastomosis was never leak-tested.")
    if "uv_defect" in proc.flags:
        proc.occult.append("Urethrovesical anastomotic leak, not detected because no leak test was done (urine leak, pelvic urinoma, prolonged catheter and an anastomotic stricture later).")
