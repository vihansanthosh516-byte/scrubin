/**
 * ScrubIn Home Page - Premium Edition
 */
import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, useScroll, useSpring, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Activity, Heart, Brain, Scissors, BookOpen, Trophy, Play, ArrowRight, Zap, Target, Award, Sparkles, Users, Star } from "lucide-react";

function FloatingParticles() {
  const particles = Array.from({ length: 30 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{ background: i % 2 === 0 ? '#7EC8E3' : '#5DCAA5', boxShadow: `0 0 10px ${i % 2 === 0 ? '#7EC8E3' : '#5DCAA5'}` }}
          initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, opacity: 0 }}
          animate={{ y: [null, Math.random() * -200 - 100], opacity: [0, 0.8, 0], x: Math.random() * window.innerWidth }}
          transition={{ duration: Math.random() * 15 + 15, repeat: Infinity, ease: "linear", delay: Math.random() * 10 }}
        />
      ))}
    </div>
  );
}

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div className="absolute w-[900px] h-[900px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #7EC8E3 0%, #5DCAA5 50%, transparent 70%)", top: "-20%", right: "-10%" }} animate={{ x: [0, 100, 0], y: [0, 80, 0], scale: [1, 1.3, 1], rotate: [0, 180, 360] }} transition={{ duration: 25, repeat: Infinity }} />
      <motion.div className="absolute w-[800px] h-[800px] rounded-full opacity-15" style={{ background: "radial-gradient(circle, #5DCAA5 0%, #7EC8E3 50%, transparent 70%)", bottom: "-10%", left: "-5%" }} animate={{ x: [0, -80, 0], y: [0, 100, 0], scale: [1, 1.4, 1], rotate: [360, 180, 0] }} transition={{ duration: 30, repeat: Infinity }} />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(126,200,227,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(126,200,227,0.5) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      <FloatingParticles />
    </div>
  );
}

function StatItem({ value, label, suffix = "", icon: Icon, delay = 0 }: any) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  useEffect(() => {
    if (inView) {
      let start = 0;
      const increment = value / 100;
      const timer = setInterval(() => {
        start += increment;
        if (start >= value) { setCount(value); clearInterval(timer); }
        else { setCount(Math.floor(start)); }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [inView, value]);
  return (
    <motion.div ref={ref} initial={{ opacity: 0, scale: 0.8, y: 30 }} animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}} transition={{ duration: 0.7, delay, type: "spring", stiffness: 100 }} className="group relative">
      <div className="relative p-8 rounded-3xl glass-card hover:glass-card-pro transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2">
        {Icon && (
          <motion.div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-125 group-hover:rotate-12 transition-all" whileHover={{ scale: 1.2, rotate: 15 }}>
            <Icon className="w-6 h-6 text-primary" />
          </motion.div>
        )}
        <div className="text-5xl md:text-6xl font-bold mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>
          <span className="text-gradient">{count.toLocaleString()}{suffix}</span>
        </div>
        <div className="text-sm text-muted-foreground font-mono-data uppercase tracking-wider">{label}</div>
      </div>
    </motion.div>
  );
}

function FeatureCard({ icon: Icon, title, description, index, color }: any) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) { const x = e.clientX - rect.left, y = e.clientY - rect.top, centerX = rect.width / 2, centerY = rect.height / 2; setRotate({ x: (y - centerY) / 8, y: (centerX - x) / 8 }); }
  };
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 60, rotateY: 15 }} animate={inView ? { opacity: 1, y: 0, rotateY: 0 } : {}} transition={{ duration: 0.8, delay: index * 0.2, type: "spring", stiffness: 80 }} className="group" onMouseMove={handleMouseMove} onMouseLeave={() => setRotate({ x: 0, y: 0 })}>
      <div className="relative p-10 rounded-3xl glass-card transition-all overflow-hidden" style={{ transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)` }}>
        <motion.div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${color} border border-primary/20 flex items-center justify-center mb-6 text-primary group-hover:scale-125 group-hover:rotate-12 transition-all shadow-xl mx-auto`} whileHover={{ scale: 1.3, rotate: 15 }}><Icon className="w-10 h-10" /></motion.div>
        <h3 className="text-2xl font-bold text-foreground mb-4 text-center" style={{ fontFamily: "'Syne', sans-serif" }}>{title}</h3>
        <p className="text-muted-foreground text-base leading-relaxed text-center">{description}</p>
      </div>
    </motion.div>
  );
}

function ProcedurePreview({ name, tag, difficulty, color, index }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 30, scale: 0.9, rotateY: 10 }} whileInView={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1, type: "spring" }} whileHover={{ scale: 1.08, y: -12, rotateY: -5 }} className="group p-6 rounded-2xl glass-card cursor-pointer relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${color} backdrop-blur-sm`}>{difficulty}</span>
          <span className="text-xs text-muted-foreground font-mono-data">{tag}</span>
        </div>
        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors" style={{ fontFamily: "'Syne', sans-serif" }}>{name}</h4>
        <motion.div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity" initial={{ x: 10 }} whileHover={{ x: 0 }}><ArrowRight className="w-5 h-5 text-primary" /></motion.div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  useEffect(() => { setMounted(true); }, []);
  const procedures = [{ name: "Appendectomy", tag: "Emergency", difficulty: "Beginner", color: "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20" }, { name: "Heart Bypass", tag: "Cardiovascular", difficulty: "Advanced", color: "text-red-400 bg-red-400/10 border border-red-400/20" }, { name: "Craniotomy", tag: "Neurological", difficulty: "Advanced", color: "text-red-400 bg-red-400/10 border border-red-400/20" }, { name: "Cholecystectomy", tag: "Laparoscopic", difficulty: "Intermediate", color: "text-amber-400 bg-amber-400/10 border border-amber-400/20" }];
  const features = [{ icon: Scissors, title: "Choose Your Procedure", description: "Browse real surgical cases from appendectomy to craniotomy.", color: "from-primary/20 to-teal-400/20" }, { icon: Target, title: "Make Every Decision", description: "From diagnosis to closing, every step is yours.", color: "from-teal-400/20 to-primary/20" }, { icon: BookOpen, title: "Learn From Everything", description: "Right or wrong, you'll know exactly why.", color: "from-primary/20 to-purple-400/20" }];
  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-teal-400 to-primary z-[9999] origin-left" style={{ scaleX }} />
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <AnimatedBackground />
        {[Activity, Heart, Brain, Scissors].map((Icon, i) => (
          <motion.div key={i} className="absolute z-20" style={{ left: i % 2 === 0 ? "10%" : "85%", top: i === 0 ? "20%" : i === 1 ? "25%" : i === 2 ? "70%" : "75%" }} animate={{ y: [0, -25, 0], rotate: [0, 15, -15, 0] }} transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}><Icon className="w-10 h-10 text-primary/40 hover:text-primary transition-colors cursor-pointer drop-shadow-[0_0_15px_rgba(126,200,227,0.6)]" /></motion.div>
        ))}
        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.8 }} animate={mounted ? { opacity: 1, y: 0, scale: 1 } : {}} transition={{ duration: 0.7, type: "spring" }} className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-card mb-8 mx-auto">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}><Sparkles className="w-5 h-5 text-primary" /></motion.div>
            <span className="text-sm font-mono-data text-primary font-semibold">The Future of Surgical Education</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={mounted ? { opacity: 1, y: 0, scale: 1 } : {}} transition={{ duration: 1, delay: 0.2, type: "spring", stiffness: 100 }} className="text-7xl md:text-9xl lg:text-[12rem] font-bold leading-none tracking-tight mb-8" style={{ fontFamily: "'Syne', sans-serif" }}>
            <span className="text-gradient">ScrubIn</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 30 }} animate={mounted ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.4 }} className="text-2xl md:text-3xl text-muted-foreground max-w-2xl mx-auto mb-4">Your First Surgery Starts Here</motion.p>
          <motion.p initial={{ opacity: 0, y: 30 }} animate={mounted ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.5 }} className="text-lg text-muted-foreground/80 max-w-xl mx-auto mb-12">Put ScrubIn on top of your first surgery.</motion.p>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={mounted ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.6 }} className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/procedures">
              <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-12 py-8 rounded-2xl text-lg shadow-[0_0_50px_rgba(126,200,227,0.5)] hover:shadow-[0_0_100px_rgba(126,200,227,0.8)] transition-all" style={{ fontFamily: "'Syne', sans-serif" }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="mr-2"><Activity className="w-6 h-6" /></motion.div>
                  Enter the OR
                </Button>
              </motion.div>
            </Link>
            <Link href="/procedures">
              <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="outline" className="border-2 border-primary/50 hover:border-primary hover:bg-primary/10 font-semibold px-12 py-8 rounded-2xl text-lg transition-all glass-card" style={{ fontFamily: "'Syne', sans-serif" }}>
                  <Play className="w-6 h-6 mr-2" />
                  View Procedures
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
        <motion.div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30" animate={{ y: [0, 15, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="w-8 h-14 rounded-full border-2 border-primary/40 flex items-start justify-center p-3 glass-card">
            <motion.div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_15px_rgba(126,200,227,0.8)]" animate={{ y: [0, 16, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
          </div>
        </motion.div>
      </section>
      <section className="py-32 relative"><div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" /><div className="max-w-6xl mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="label-mono text-center mb-16 uppercase tracking-widest text-lg">Trusted by Medical Students Worldwide</motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <StatItem value={7} label="Procedures" icon={Activity} delay={0} />
          <StatItem value={200} label="Decision Points" suffix="+" icon={Target} delay={0.1} />
          <StatItem value={14000} label="Students Trained" suffix="+" icon={Users} delay={0.2} />
          <StatItem value={0} label="Patients Harmed" icon={Heart} delay={0.3} />
        </div>
      </div></section>
      <section className="py-40 relative"><div className="max-w-6xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-24">
          <motion.span className="label-mono text-primary uppercase tracking-widest mb-6 block text-lg">How It Works</motion.span>
          <h2 className="text-5xl md:text-7xl font-bold text-foreground" style={{ fontFamily: "'Syne', sans-serif" }}>Three Steps to the <span className="text-gradient">OR</span></h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">{features.map((f, i) => <FeatureCard key={f.title} icon={f.icon} title={f.title} description={f.description} index={i} color={f.color} />)}</div>
      </div></section>
      <section className="py-40 relative bg-gradient-to-b from-primary/5 via-transparent to-primary/5"><div className="max-w-6xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-20">
          <span className="label-mono text-primary uppercase tracking-widest mb-6 block text-lg">Available Now</span>
          <h2 className="text-5xl md:text-7xl font-bold text-foreground mb-8" style={{ fontFamily: "'Syne', sans-serif" }}>Start Your <span className="text-gradient">Training</span></h2>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">Choose from our growing library of surgical simulations</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">{procedures.map((proc, i) => <ProcedurePreview key={proc.name} {...proc} index={i} />)}</div>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center">
          <Link href="/procedures">
            <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" variant="outline" className="border-2 border-primary/50 hover:border-primary hover:bg-primary/10 font-semibold px-12 py-8 rounded-2xl text-lg transition-all glass-card" style={{ fontFamily: "'Syne', sans-serif" }}>View All Procedures <ArrowRight className="w-5 h-5 ml-2" /></Button>
            </motion.div>
          </Link>
        </motion.div>
      </div></section>
      <section className="py-40 relative"><div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="p-10">
            <motion.div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8" whileHover={{ scale: 1.2, rotate: 15 }}><Zap className="w-12 h-12 text-primary" /></motion.div>
            <h3 className="text-2xl font-bold text-foreground mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>Real-Time Vitals</h3>
            <p className="text-muted-foreground text-base">Watch patient vitals respond to your decisions in real-time</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }} className="p-10">
            <motion.div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8" whileHover={{ scale: 1.2, rotate: 15 }}><Award className="w-12 h-12 text-primary" /></motion.div>
            <h3 className="text-2xl font-bold text-foreground mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>XP & Rankings</h3>
            <p className="text-muted-foreground text-base">Earn experience and climb the global leaderboard</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.2 }} className="p-10">
            <motion.div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8" whileHover={{ scale: 1.2, rotate: 15 }}><Trophy className="w-12 h-12 text-primary" /></motion.div>
            <h3 className="text-2xl font-bold text-foreground mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>Zero Risk</h3>
            <p className="text-muted-foreground text-base">Make mistakes, learn, and try again without any real-world consequences</p>
          </motion.div>
        </div>
      </div></section>
      <section className="py-52 relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-teal-400/15" />
        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, type: "spring", stiffness: 80 }} className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.span className="label-mono text-primary uppercase tracking-widest mb-10 block text-xl">Ready to Begin?</motion.span>
          <h2 className="text-6xl md:text-8xl font-bold text-foreground mb-10" style={{ fontFamily: "'Syne', sans-serif" }}>The Patient Is <br /><motion.span className="text-gradient inline-block" animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 2, repeat: Infinity }}>On the Table</motion.span></h2>
          <p className="text-muted-foreground mb-16 text-2xl">No experience required. No real risk. Just real learning.</p>
          <Link href="/procedures">
            <motion.div whileHover={{ scale: 1.1, y: -8 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-20 py-10 rounded-3xl text-2xl shadow-[0_0_80px_rgba(126,200,227,0.6)] hover:shadow-[0_0_150px_rgba(126,200,227,0.9)] transition-all duration-500" style={{ fontFamily: "'Syne', sans-serif" }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="mr-3"><Activity className="w-8 h-8" /></motion.div>
                Start Your First Surgery
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </section>
      <footer className="border-t border-border bg-background/80 py-20"><div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          <motion.div className="flex items-center gap-4" whileHover={{ scale: 1.05 }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}><Activity className="w-8 h-8 text-primary" /></motion.div>
            <span className="text-3xl font-bold text-foreground" style={{ fontFamily: "'Syne', sans-serif" }}>Scrub<span className="text-baby-blue">In</span></span>
          </motion.div>
          <div className="flex gap-10 text-sm text-muted-foreground">
            <motion.div whileHover={{ scale: 1.1, y: -3 }}><Link href="/procedures"><span className="hover:text-foreground transition-colors">Procedures</span></Link></motion.div>
            <motion.div whileHover={{ scale: 1.1, y: -3 }}><Link href="/learn"><span className="hover:text-foreground transition-colors">Learn Hub</span></Link></motion.div>
            <motion.div whileHover={{ scale: 1.1, y: -3 }}><Link href="/leaderboard"><span className="hover:text-foreground transition-colors">Leaderboard</span></Link></motion.div>
            <motion.div whileHover={{ scale: 1.1, y: -3 }}><Link href="/profile"><span className="hover:text-foreground transition-colors">Profile</span></Link></motion.div>
          </div>
          <div className="text-sm text-muted-foreground font-mono-data">© 2026 ScrubIn · For educational use only</div>
        </div>
      </div></footer>
    </div>
  );
}
