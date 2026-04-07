/**
 * ScrubIn Learn Hub — Clinical Precision Design
 * Editorial two-column layout, article categories, anatomy references
 */
import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Clock, BookOpen, ChevronRight, ArrowRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ScrubinCard, ScrubinStaticPanel } from "@/components/ui/scrubin-card";

const CATEGORIES = ["All", "Anatomy", "Procedures", "Pharmacology", "Complications", "Career"];

const ARTICLES = [
  {
    id: 1,
    title: "McBurney's Point and the Classic Appendicitis Triad",
    category: "Anatomy",
    readTime: "6 min",
    difficulty: "Beginner",
    related: ["Appendectomy"],
    excerpt: "Understanding the anatomical landmarks that define acute appendicitis presentation — from Rovsing's sign to the psoas sign.",
    content: `The diagnosis of acute appendicitis remains one of the most clinically important skills in emergency medicine. The appendix, a vestigial structure arising from the cecum at the convergence of the taeniae coli, sits in the right iliac fossa in approximately 65% of patients — though retrocecal, pelvic, and other positions account for the remainder and can dramatically alter the clinical presentation.

**McBurney's Point** is defined as the junction of the lateral and middle thirds of a line drawn from the anterior superior iliac spine (ASIS) to the umbilicus. Direct tenderness at this point, combined with the classic triad of periumbilical pain migrating to the RLQ, fever, and leukocytosis, carries a positive predictive value exceeding 85% for appendicitis.

**Rovsing's Sign** — pain in the RLQ elicited by palpation of the LLQ — reflects peritoneal irritation and suggests that the inflammatory process has extended beyond the appendix itself. A positive Rovsing's sign increases the likelihood ratio for appendicitis to approximately 2.5.

The **Psoas Sign** is elicited by extending the right hip while the patient lies on their left side. Pain with this maneuver suggests a retrocecal appendix lying in contact with the iliopsoas muscle. The **Obturator Sign** — pain with internal rotation of the flexed right hip — suggests a pelvic appendix.

In the era of CT imaging, these physical examination findings remain critical for two reasons: they guide the decision to image, and they provide context for interpreting equivocal imaging results. A Alvarado Score ≥7 in a patient with classic examination findings warrants surgical consultation regardless of imaging.`,
  },
  {
    id: 2,
    title: "Laparoscopic Port Placement: Principles and Pitfalls",
    category: "Procedures",
    readTime: "8 min",
    difficulty: "Intermediate",
    related: ["Appendectomy", "Cholecystectomy"],
    excerpt: "Safe trocar placement is the foundation of any laparoscopic procedure. Learn the principles that prevent vascular and bowel injury.",
    content: `Trocar placement in laparoscopic surgery follows a set of geometric and anatomical principles that, when violated, lead to the most serious complications in minimally invasive surgery — including major vascular injury, bowel perforation, and inadequate visualization.

**The Triangle of Safety** for most abdominal laparoscopic procedures places the camera port at the umbilicus, with working ports positioned to create a 60-degree angle of approach to the target organ. This triangulation allows instruments to work without "sword fighting" and provides the surgeon with depth perception cues analogous to binocular vision.

**Primary Port Entry** at the umbilicus exploits the natural thinning of the abdominal wall at the linea alba. The Hasson technique (open entry) is preferred in patients with prior abdominal surgery, obesity, or suspected adhesions. Veress needle entry is acceptable in virgin abdomens with proper technique — the needle should pass through two distinct "pops" (anterior and posterior fascia) before insufflation.

**Port Size Matters for Closure**: The 10-12mm fascial defect created by a 12mm trocar carries a significant risk of port-site hernia (reported rates 0.5–3.6%) if the fascia is not closed. The 5mm ports do not require fascial closure in most patients. Failure to close the 12mm umbilical port is one of the most common technical errors leading to early postoperative complications.`,
  },
  {
    id: 3,
    title: "Anesthesia Types: Choosing the Right Approach",
    category: "Pharmacology",
    readTime: "7 min",
    difficulty: "Beginner",
    related: ["Appendectomy", "ACL Reconstruction", "C-Section"],
    excerpt: "General, regional, spinal, or local — the anesthesia choice is a critical pre-operative decision with major implications for patient safety.",
    content: `Anesthesia selection is among the most consequential pre-operative decisions, requiring integration of surgical requirements, patient comorbidities, and risk-benefit analysis. The four major categories — general, regional, neuraxial (spinal/epidural), and local — each carry distinct profiles of risk and benefit.

**General Anesthesia** provides complete unconsciousness and muscle relaxation, making it the default for most intra-abdominal procedures. The risks include aspiration (mitigated by NPO protocols and rapid sequence induction in emergencies), cardiovascular depression, and postoperative nausea and vomiting (PONV). In patients with difficult airways, anticipated by the LEMON assessment, the anesthesia team must have a plan for awake fiberoptic intubation.

**Neuraxial Anesthesia** — spinal and epidural — is the preferred approach for lower extremity orthopedic procedures and cesarean delivery. Spinal anesthesia provides rapid, dense block with a single injection; epidural allows continuous dosing for prolonged procedures or postoperative analgesia. Contraindications include coagulopathy, patient refusal, and infection at the injection site.

**Regional Nerve Blocks** have transformed perioperative pain management. Ultrasound-guided blocks — femoral nerve block for ACL reconstruction, TAP block for abdominal surgery, interscalene block for shoulder procedures — reduce opioid requirements by 40–60% and enable same-day discharge for procedures previously requiring overnight admission.`,
  },
  {
    id: 4,
    title: "Wound Dehiscence and Port-Site Hernias",
    category: "Complications",
    readTime: "5 min",
    difficulty: "Intermediate",
    related: ["Appendectomy", "Cholecystectomy"],
    excerpt: "Two of the most preventable post-operative complications — and exactly how to prevent them with proper closure technique.",
    content: `Wound dehiscence and port-site hernia represent failures of surgical closure technique that are largely preventable with proper attention to anatomical principles and suture selection.

**Wound Dehiscence** — the separation of surgical wound edges — occurs in 0.5–3% of abdominal incisions and carries a mortality rate of up to 15% when it involves evisceration. Risk factors include obesity, malnutrition, diabetes, steroid use, wound infection, and technical errors in closure. The fascia must be closed with a running mass closure using a slowly absorbable suture (PDS or Maxon) with a suture-to-wound length ratio of at least 4:1.

**Port-Site Hernia** is specific to laparoscopic surgery and occurs through the fascial defect created by trocar insertion. The umbilical port, typically 10–12mm, is the most common site. The hernia may present acutely with incarceration or as a chronic bulge weeks to months postoperatively. Prevention requires fascial closure of all ports ≥10mm using a Carter-Thomason device or direct visualization with a J-needle.`,
  },
  {
    id: 5,
    title: "The Pre-Med Roadmap: From High School to Medical School",
    category: "Career",
    readTime: "10 min",
    difficulty: "Beginner",
    related: [],
    excerpt: "A practical, honest guide to navigating the pre-med track — what matters, what doesn't, and how to build a competitive application.",
    content: `The path from high school to medical school is long, competitive, and often misunderstood. This guide cuts through the noise to focus on what actually matters for building a compelling medical school application.

**The Foundation: GPA and MCAT** remain the primary screening criteria at most allopathic medical schools. A GPA above 3.7 and MCAT above 515 puts you in competitive range for top programs, but these numbers are floors, not ceilings. Science GPA (sGPA) is weighted heavily — your performance in biology, chemistry, physics, and math courses signals your ability to handle the basic science curriculum of medical school.

**Clinical Experience** is non-negotiable. Medical schools want evidence that you understand what medicine actually involves — the difficult conversations, the physical demands, the emotional weight. Shadowing physicians (100+ hours across multiple specialties) and direct patient contact (volunteering in a hospital, working as an EMT or CNA, scribing) demonstrate this understanding.

**Research** is increasingly important, particularly for MD-PhD programs and research-intensive schools. Even a single summer research experience demonstrates scientific thinking and the ability to contribute to knowledge generation. Publications and presentations strengthen an application significantly.

**The Personal Statement** is where numbers become a person. The most compelling personal statements are specific, honest, and reflective — they don't list accomplishments but illuminate the moments that shaped your understanding of medicine and your motivation to practice it.`,
  },
];

export default function LearnHub() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedArticle, setSelectedArticle] = useState(ARTICLES[0]);

  const filtered = ARTICLES.filter(
    a => activeCategory === "All" || a.category === activeCategory
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16">
        {/* Header */}
        <div className="max-w-6xl mx-auto px-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="label-mono block mb-3">Knowledge Base</span>
            <h1
              className="text-4xl md:text-5xl font-bold text-foreground mb-3"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Learn Hub
            </h1>
            <p className="text-muted-foreground">Anatomy, procedures, pharmacology — everything you need to perform better in the OR.</p>
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
            <div className="lg:col-span-2 space-y-3">
              {filtered.map((article, i) => (
                <motion.button
                  key={article.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  onClick={() => setSelectedArticle(article)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedArticle.id === article.id
                      ? "border-teal-400/40 bg-teal-400/5 shadow-[0_0_20px_rgba(93,202,165,0.15)]"
                      : "border-border bg-card/90 hover:border-teal-400/20 hover:bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3
                      className="text-sm font-semibold text-foreground leading-snug"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
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
                className="rounded-2xl border border-teal-400/20 bg-card/90 backdrop-blur-xl p-8 sticky top-24 shadow-[0_0_30px_rgba(93,202,165,0.1)]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold font-mono-data ${
                    selectedArticle.difficulty === "Beginner"
                      ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
                      : "bg-amber-400/10 text-amber-400 border border-amber-400/20"
                  }`}>
                    {selectedArticle.difficulty}
                  </span>
                  <span className="label-mono text-muted-foreground">{selectedArticle.category}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono-data ml-auto">
                    <Clock className="w-3 h-3" /> {selectedArticle.readTime} read
                  </span>
                </div>

                <h2
                  className="text-2xl font-bold text-foreground mb-4 leading-tight"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {selectedArticle.title}
                </h2>

                <p className="text-muted-foreground text-sm mb-6 leading-relaxed italic border-l-2 border-primary/30 pl-4">
                  {selectedArticle.excerpt}
                </p>

                <div className="prose prose-sm max-w-none">
                  {selectedArticle.content.split("\n\n").map((para, i) => {
                    if (para.startsWith("**") && para.includes("**")) {
                      const parts = para.split(/\*\*(.*?)\*\*/g);
                      return (
                        <p key={i} className="text-sm text-muted-foreground leading-relaxed mb-4">
                          {parts.map((part, j) =>
                            j % 2 === 1
                              ? <strong key={j} className="text-foreground font-semibold">{part}</strong>
                              : part
                          )}
                        </p>
                      );
                    }
                    return (
                      <p key={i} className="text-sm text-muted-foreground leading-relaxed mb-4">{para}</p>
                    );
                  })}
                </div>

                {selectedArticle.related.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-border">
                    <div className="label-mono text-muted-foreground mb-3">Related Simulations</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedArticle.related.map(rel => {
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
                        const procId = PROC_ID_MAP[rel] || "appendectomy";
                        return (
                          <Link key={rel} href={`/simulation?proc=${procId}`}>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors">
                              <BookOpen className="w-3 h-3" />
                              {rel}
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </Link>
                        );
                      })}
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
