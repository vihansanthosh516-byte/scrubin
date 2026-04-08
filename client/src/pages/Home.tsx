/**
 * ScrubIn Home Page — Clinical Precision Design
 * Hero with OR lamp effect, ECG flatline→heartbeat, stats, procedures preview
 * Baby blue accents, Syne display, glassmorphism cards
 */
import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import {
  ChevronRight,
  Play,
  Heart,
  Brain,
  Scissors,
  Shield,
  TrendingUp,
  BookOpen,
  Activity,
  Zap,
  Award,
  ArrowRight,
} from "lucide-react";

const PROCEDURES = [
  { name: "Appendectomy", tag: "Emergency", difficulty: "Beginner", color: "text-emerald-400", bg: "bg-emerald-400/10", icon: "🫀", time: "25 min", decisions: 42 },
  { name: "Heart Bypass", tag: "Cardiovascular", difficulty: "Advanced", color: "text-red-400", bg: "bg-red-400/10", icon: "❤️", time: "55 min", decisions: 78 },
  { name: "Craniotomy", tag: "Neurological", difficulty: "Advanced", color: "text-red-400", bg: "bg-red-400/10", icon: "🧠", time: "60 min", decisions: 85 },
  { name: "Cholecystectomy", tag: "Laparoscopic", difficulty: "Intermediate", color: "text-amber-400", bg: "bg-amber-400/10", icon: "🫁", time: "30 min", decisions: 51 },
  { name: "ACL Reconstruction", tag: "Orthopedic", difficulty: "Intermediate", color: "text-amber-400", bg: "bg-amber-400/10", icon: "🦴", time: "35 min", decisions: 48 },
  { name: "C-Section", tag: "OB/GYN", difficulty: "Intermediate", color: "text-amber-400", bg: "bg-amber-400/10", icon: "👶", time: "28 min", decisions: 44 },
];

const STATS = [
  { value: 7, label: "Procedures", suffix: "" },
  { value: 200, label: "Decision Points", suffix: "+" },
  { value: 14000, label: "Students Trained", suffix: "+" },
  { value: 0, label: "Real Patients Harmed", suffix: "" },
];

// Animated counter hook
function useCounter(target: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function StatCard({ value, label, suffix, index }: { value: number; label: string; suffix: string; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const count = useCounter(value, 2000, inView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="text-center"
    >
      <div
        className="text-4xl md:text-5xl font-bold text-baby-blue mb-1"
        style={{ fontFamily: "'Syne', sans-serif" }}
      >
        {value === 0 ? "0" : count.toLocaleString()}{suffix}
      </div>
      <div className="label-mono">{label}</div>
    </motion.div>
  );
}

// ECG SVG Animation
function EcgLine({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`w-full h-8 ${className}`}
      viewBox="0 0 800 32"
      preserveAspectRatio="none"
    >
      <path
        d="M0,16 L150,16 L160,16 L165,4 L170,28 L175,4 L180,16 L195,16 L205,10 L210,22 L215,16 L350,16 L360,16 L365,4 L370,28 L375,4 L380,16 L395,16 L405,10 L410,22 L415,16 L550,16 L560,16 L565,4 L570,28 L575,4 L580,16 L595,16 L605,10 L610,22 L615,16 L800,16"
        fill="none"
        stroke="#7EC8E3"
        strokeWidth="1.5"
        opacity="0.5"
        strokeDasharray="1200"
        style={{ animation: "ecg-scroll 4s linear infinite" }}
      />
    </svg>
  );
}

// Testimonial Card Component
function TestimonialCard({
  name,
  role,
  avatar,
  quote,
}: {
  name: string;
  role: string;
  avatar: string;
  quote: string;
}) {
  return (
    <div className="flex-shrink-0 glass-card-light rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <img
          src={avatar}
          alt={name}
          className="w-10 h-10 rounded-full object-cover border border-primary/30"
        />
        <div>
          <div
            className="font-semibold text-sm text-foreground"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {name}
          </div>
          <div className="text-xs text-muted-foreground">{role}</div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">"{quote}"</p>
    </div>
  );
}

export default function Home() {
  const [heroLoaded, setHeroLoaded] = useState(false);
  const featuresRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true });

  useEffect(() => {
    const timer = setTimeout(() => setHeroLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* ── HERO ── */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663492570043/KFxREKjUwBni37ALGkPJdZ/scrubin-hero-bg-PZxPz49NEX2NFmuZiGXe4K.webp)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay for light mode readability */}
        <div className="absolute inset-0 bg-background/70 dark:bg-background/50" />

        {/* Grid texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(126,200,227,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(126,200,227,0.5) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Vignette */}
        <div className="absolute inset-0 bg-radial-[at_50%_50%] from-transparent via-transparent to-background/60 pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          {/* Label */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={heroLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-8"
          >
            <span className="label-mono">Surgery Simulator for Students</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="label-mono text-muted-foreground">v1.0 — Beta</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={heroLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold leading-none tracking-tight text-foreground mb-6"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Your First Surgery
            <br />
            <span className="text-baby-blue">Starts Here.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={heroLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-10 font-mono-data"
          >
            Step into the OR. Make real decisions. See real consequences.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-12"
          >
            <Link href="/procedures">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-xl baby-blue-glow-strong text-base"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                <Activity className="w-4 h-4 mr-2" />
                Enter the OR
              </Button>
            </Link>
            <Link href="/procedures">
              <Button
                size="lg"
                variant="outline"
                className="border-border hover:border-primary/50 hover:bg-primary/5 font-semibold px-8 py-3 rounded-xl text-base"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                <Play className="w-4 h-4 mr-2" />
                View Procedures
              </Button>
            </Link>
          </motion.div>

          {/* Stat bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={heroLoaded ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="font-mono-data text-xs text-muted-foreground tracking-widest uppercase"
          >
            14,000+ students trained · 7 procedures · 0 real patients harmed
          </motion.div>
        </div>

        {/* ECG flatline at bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <EcgLine />
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 bg-background relative" ref={featuresRef}>
        <div className="section-divider mb-16" />
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="label-mono block mb-3">How It Works</span>
            <h2
              className="text-3xl md:text-5xl font-bold text-foreground"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Three Steps to the OR
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

            {[
              {
                num: "01",
                title: "Choose Your Procedure",
                desc: "Browse 7 real surgical cases from appendectomy to craniotomy. Each one is a different challenge.",
                icon: <Scissors className="w-5 h-5" />,
              },
              {
                num: "02",
                title: "Make Every Decision",
                desc: "From diagnosis to closing, every step is yours. No shortcuts. No hand-holding. Real consequences.",
                icon: <Brain className="w-5 h-5" />,
              },
              {
                num: "03",
                title: "Learn From Everything",
                desc: "Right or wrong, you'll know exactly why. Animated consequences, medical explanations, attending feedback.",
                icon: <BookOpen className="w-5 h-5" />,
              },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative glass-card-light rounded-2xl p-8 hover:baby-blue-glow transition-all duration-300 group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <span
                    className="text-5xl font-bold text-primary/20 leading-none"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    {step.num}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary group-hover:bg-primary/25 transition-colors mt-1">
                    {step.icon}
                  </div>
                </div>
                <h3
                  className="text-xl font-semibold text-foreground mb-2"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BANNER ── */}
      <section className="py-20 bg-primary/5 border-y border-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(126,200,227,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(126,200,227,0.8) 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }}
        />
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <StatCard key={stat.label} {...stat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 bg-background overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          {/* Badge Pill */}
          <div className="text-center mb-6">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-baby-blue/20 text-primary dark:bg-primary/20 dark:text-baby-blue border border-primary/20">
              From the OR Community
            </span>
          </div>
          {/* Heading */}
          <div className="text-center mb-4">
            <h2
              className="text-3xl md:text-5xl font-bold text-foreground"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Trusted by Future Doctors
            </h2>
          </div>
          {/* Subheading */}
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
            Pre-med students, biology teachers, and medical students use ScrubIn to build real surgical intuition before ever stepping into a hospital.
          </p>
          {/* Scrolling Columns Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Column 1 - 15s per loop */}
            <div className="relative h-[480px] overflow-hidden group">
              <div className="testimonial-scroll-1 flex flex-col gap-4 group-hover:[animation-play-state:paused]">
                <TestimonialCard
                  name="Sarah Chen"
                  role="Pre-Med Sophomore, UC Berkeley"
                  avatar="https://randomuser.me/api/portraits/women/44.jpg"
                  quote="I ran the appendectomy simulation 8 times before I finally nailed the McBurney's point incision. The attending notes actually explained WHY my original placement caused delayed wound healing."
                />
                <TestimonialCard
                  name="Marcus Thompson"
                  role="AP Biology Teacher, Lincoln High"
                  avatar="https://randomuser.me/api/portraits/men/32.jpg"
                  quote="My students thought they knew anatomy until they hit a simulated bleed during the cholecystectomy. The vitals engine doesn't lie — they actually paid attention to the Calot's triangle for once."
                />
                <TestimonialCard
                  name="Priya Sharma"
                  role="MS-1, University of Michigan"
                  avatar="https://randomuser.me/api/portraits/women/68.jpg"
                  quote="During my first real OR observation, I recognized the instrument handoff sequence from ScrubIn. It was wild — I actually knew what was happening before the surgeon asked for the Bovie."
                />
                <TestimonialCard
                  name="David Kim"
                  role="High School Junior, Pre-Med Track"
                  avatar="https://randomuser.me/api/portraits/men/75.jpg"
                  quote="The craniotomy procedure scared me at first, but the way ScrubIn breaks down each decision made it feel manageable. Now I understand why neurosurgeons obsess over that first burr hole placement."
                />
                <TestimonialCard
                  name="Jessica Miller"
                  role="Anatomy TA, Penn State"
                  avatar="https://randomuser.me/api/portraits/women/22.jpg"
                  quote="I use ScrubIn as a supplement to our cadaver lab. Students who practiced the ACL reconstruction here asked better questions during dissection — they could visualize the graft tunnel."
                />
                <TestimonialCard
                  name="Ryan Patel"
                  role="Pre-Med Junior, UCLA"
                  avatar="https://randomuser.me/api/portraits/men/52.jpg"
                  quote="The XP system is lowkey addictive. I kept replaying the C-section just to hit the 'Perfect Placement' bonus on the uterine incision. Learned way more than I expected."
                />
                <TestimonialCard
                  name="Sarah Chen"
                  role="Pre-Med Sophomore, UC Berkeley"
                  avatar="https://randomuser.me/api/portraits/women/44.jpg"
                  quote="I ran the appendectomy simulation 8 times before I finally nailed the McBurney's point incision. The attending notes actually explained WHY my original placement caused delayed wound healing."
                />
              </div>
            </div>
            {/* Column 2 - 19s per loop */}
            <div className="relative h-[480px] overflow-hidden group hidden md:block">
              <div className="testimonial-scroll-2 flex flex-col gap-4 group-hover:[animation-play-state:paused]">
                <TestimonialCard
                  name="Emily Watson"
                  role="College Freshman, Pre-Med"
                  avatar="https://randomuser.me/api/portraits/women/65.jpg"
                  quote="The consequence system is brutal but fair. I nicked the cystic artery during cholecystectomy and watched the vitals tank in real-time. That visual stuck with me more than any textbook diagram."
                />
                <TestimonialCard
                  name="Dr. Amanda Torres"
                  role="AP Biology Teacher, Westfield High"
                  avatar="https://randomuser.me/api/portraits/women/28.jpg"
                  quote="I've tried other surgical sims, but ScrubIn's decision branching actually reflects real surgical judgment. My AP students argue about the 'right' call — exactly what I want them doing."
                />
                <TestimonialCard
                  name="Kevin O'Brien"
                  role="MS-2, Duke University"
                  avatar="https://randomuser.me/api/portraits/men/15.jpg"
                  quote="Before anatomy lab started, I practiced laparoscopic views on ScrubIn. When we got to the abdomen block, I could actually orient myself faster than most of my classmates."
                />
                <TestimonialCard
                  name="Nina Patel"
                  role="High School Senior, Pre-Med"
                  avatar="https://randomuser.me/api/portraits/women/17.jpg"
                  quote="The heart bypass procedure made me realize I want to be a cardiothoracic surgeon. The way you have to time the cross-clamp with the anesthesiologist's cues — that synergy is beautiful."
                />
                <TestimonialCard
                  name="Tyler Jackson"
                  role="Pre-Med Junior, Howard University"
                  avatar="https://randomuser.me/api/portraits/men/86.jpg"
                  quote="I failed the appendectomy three times in a row because I kept rushing the dissection. The attending notes called me out: 'Surgery rewards patience, not speed.' Needed to hear that."
                />
                <TestimonialCard
                  name="Dr. Lisa Chang"
                  role="Anatomy Instructor, Community College"
                  avatar="https://randomuser.me/api/portraits/women/35.jpg"
                  quote="For students who can't afford cadaver lab access, ScrubIn is invaluable. The procedural view lets them see relationships you just can't get from a diagram."
                />
                <TestimonialCard
                  name="Emily Watson"
                  role="College Freshman, Pre-Med"
                  avatar="https://randomuser.me/api/portraits/women/65.jpg"
                  quote="The consequence system is brutal but fair. I nicked the cystic artery during cholecystectomy and watched the vitals tank in real-time. That visual stuck with me more than any textbook diagram."
                />
              </div>
            </div>
            {/* Column 3 - 17s per loop */}
            <div className="relative h-[480px] overflow-hidden group hidden lg:block">
              <div className="testimonial-scroll-3 flex flex-col gap-4 group-hover:[animation-play-state:paused]">
                <TestimonialCard
                  name="Brandon Lee"
                  role="College Sophomore, Bio Major"
                  avatar="https://randomuser.me/api/portraits/men/45.jpg"
                  quote="The vitals monitor during the craniotomy had me sweating. When BP spiked after I touched the posterior cerebral artery, I finally got why neuro is so high-stakes."
                />
                <TestimonialCard
                  name="Madison Scott"
                  role="Pre-Med Senior, Johns Hopkins"
                  avatar="https://randomuser.me/api/portraits/women/55.jpg"
                  quote="I used ScrubIn the summer before med school. By the time I started, I could explain the Rogoff's triangle approach to appendectomy — my anatomy professor was impressed."
                />
                <TestimonialCard
                  name="Mr. James Wilson"
                  role="Health Sciences Teacher, Central High"
                  avatar="https://randomuser.me/api/portraits/men/62.jpg"
                  quote="My intro to surgery unit used to be just videos. Now students run the simulation first, then we debrief. Their questions are way more sophisticated than before."
                />
                <TestimonialCard
                  name="Aisha Johnson"
                  role="High School Junior, Future Surgeon"
                  avatar="https://randomuser.me/api/portraits/women/48.jpg"
                  quote="I didn't know what a 'surgical airway' was until the cricothyrotomy scenario in ScrubIn. The decision tree showed me exactly when and why you'd make that call."
                />
                <TestimonialCard
                  name="Andrew Park"
                  role="MS-1, Stanford Medicine"
                  avatar="https://randomuser.me/api/portraits/men/24.jpg"
                  quote="The attending notes are surprisingly detailed — like having a real surgeon debrief you. I learned I was clamping too aggressively in the cholecystectomy and causing unnecessary ischemia."
                />
                <TestimonialCard
                  name="Rachel Green"
                  role="Pre-Med Junior, UNC Chapel Hill"
                  avatar="https://randomuser.me/api/portraits/women/33.jpg"
                  quote="I've tried every procedure at least twice. The ACL reconstruction hit different — seeing the graft tension affect knee stability in the outcome screen made biomechanics click."
                />
                <TestimonialCard
                  name="Brandon Lee"
                  role="College Sophomore, Bio Major"
                  avatar="https://randomuser.me/api/portraits/men/45.jpg"
                  quote="The vitals monitor during the craniotomy had me sweating. When BP spiked after I touched the posterior cerebral artery, I finally got why neuro is so high-stakes."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-24 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, rgba(126,200,227,0.08) 0%, rgba(91,168,201,0.05) 100%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <span className="label-mono block mb-4">Ready?</span>
          <h2
            className="text-4xl md:text-6xl font-bold text-foreground mb-6"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            The Patient Is
            <br />
            <span className="text-baby-blue">On the Table.</span>
          </h2>
          <p className="text-muted-foreground mb-10 text-lg">
            No experience required. No real risk. Just real learning.
          </p>
          <Link href="/procedures">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-10 py-4 rounded-xl baby-blue-glow-strong text-lg"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              <Activity className="w-5 h-5 mr-2" />
              Start Your First Surgery
            </Button>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border bg-background/80">
        <EcgLine className="opacity-30" />
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <span
                className="text-lg font-bold text-foreground"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Scrub<span className="text-baby-blue">In</span>
              </span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/procedures"><span className="hover:text-foreground transition-colors">Procedures</span></Link>
              <Link href="/learn"><span className="hover:text-foreground transition-colors">Learn Hub</span></Link>
              <Link href="/leaderboard"><span className="hover:text-foreground transition-colors">Leaderboard</span></Link>
              <Link href="/profile"><span className="hover:text-foreground transition-colors">Profile</span></Link>
            </div>
            <div className="font-mono-data text-xs text-muted-foreground">
              © 2026 ScrubIn · For educational use only
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
