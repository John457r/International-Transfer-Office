import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ArrowRight, Globe, Star, CheckCircle2 } from "lucide-react";

const Typewriter = ({ phrases }: { phrases: string[] }) => {
  const [text, setText] = useState("");
  const [phase, setPhase] = useState("typing");
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const currentPhrase = phrases[phraseIndex];

    if (phase === "typing") {
      if (text.length < currentPhrase.length) {
        timeout = setTimeout(() => setText(currentPhrase.slice(0, text.length + 1)), 50);
      } else {
        timeout = setTimeout(() => setPhase("pausing"), 2000);
      }
    } else if (phase === "pausing") {
      setPhase("deleting");
    } else if (phase === "deleting") {
      if (text.length > 0) {
        timeout = setTimeout(() => setText(currentPhrase.slice(0, text.length - 1)), 30);
      } else {
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
        setPhase("typing");
      }
    }

    return () => clearTimeout(timeout);
  }, [text, phase, phraseIndex, phrases]);

  return (
    <span className="text-[#F59E0B]">
      {text}
      <span className="animate-pulse">|</span>
    </span>
  );
};

export default function LandingPage() {
  const phrases = [
    "Private Banking Redefined",
    "Instant Global Wire Routing",
    "Institutional Security Protocol",
    "24/7 Live Executive Support"
  ];

  const testimonials = [
    {
      id: 1,
      name: "Alu Gari",
      role: "Managing Director",
      company: "Gari Seafood Logistics",
      location: "Port Moresby, Papua New Guinea",
      text: "The USD/PGK clearance channel has revolutionized our import speed. Wire settlements that used to take three business days are now cleared in under four minutes. Exceptional speed and precision."
    },
    {
      id: 2,
      name: "Dr. Elizabeth Pemberton",
      role: "Director of International Funds",
      company: "Pemberton Holdings Ltd",
      location: "London, United Kingdom",
      text: "Securing capital liquidity routes through correspondent banking hubs became effortless after adopting this secure clearance gateway. The multi-stage verification keeps our board fully compliant."
    },
    {
      id: 3,
      name: "Marcus Vance",
      role: "Global Procurement Lead",
      company: "Vance Aerospace Parts",
      location: "Houston, Texas, United States",
      text: "Our military supply chain requires unparalleled security metrics. The transaction, verification, and absolute switch-code mechanism prevents single-point failure perfectly."
    },
    {
      id: 4,
      name: "Kalo Kepo",
      role: "Co-Founder",
      company: "Mount Hagen Coffee Cooperatives",
      location: "Western Highlands, Papua New Guinea",
      text: "We distribute premium Arabica coffee to worldwide roasters. Receiving overseas payments and converting them to Kina through their BPNG clearing channels has kept our local growers thriving."
    },
    {
      id: 5,
      name: "Victoria Sterling",
      role: "Chief Compliance Officer",
      company: "Sterling Trust Bankers",
      location: "Leeds, United Kingdom",
      text: "Adhering to demanding international AML directives is easier with their strict authorization standards. It's the cleanest clearing system we've integrated for our high-net-worth clients."
    },
    {
      id: 6,
      name: "Samuel L. Carter",
      role: "Head Treasury Manager",
      company: "Apex Oilfield Solutions",
      location: "Denver, Colorado, United States",
      text: "Excellent service. The live code monitoring allows our administrative controllers to supervise transfer authorization files securely and prevent clearance holds."
    },
    {
      id: 7,
      name: "Lohia Rarua",
      role: "Chief Executive Officer",
      company: "Papua Mining & Mineral Refineries",
      location: "Lae, Morobe Province, Papua New Guinea",
      text: "Large-scale mineral transactions depend heavily on quick clearance windows. This portal's specialized routing infrastructure has eliminated settlement lag entirely."
    },
    {
      id: 8,
      name: "Archibald Sterling",
      role: "Managing Partner",
      company: "Sterling & Croft Legal Services",
      location: "Manchester, United Kingdom",
      text: "We execute complex cross-border trust accounts. Their protocol's security architecture protects escrow assets from interception. Highly trusted advisory platform."
    },
    {
      id: 9,
      name: "Deanne G. Gallagher",
      role: "Lead Controller",
      company: "Gallagher Global Commodities",
      location: "Chicago, Illinois, United States",
      text: "Having direct control of our settlement codes from an interactive compliance panel is top-tier. Highly recommended for heavy trade finance businesses."
    },
    {
      id: 10,
      name: "Serah Tau",
      role: "Managing Director",
      company: "Tau Copra Exporters",
      location: "Kokopo, East New Britain, Papua New Guinea",
      text: "Paying international logistics teams right from our terminal in Kokopo is simple. Our capital remains secure throughout the entire multi-step routing path."
    },
    {
      id: 11,
      name: "James Sinclair",
      role: "Portfolio Advisor",
      company: "Sinclair Asset Management",
      location: "Edinburgh, United Kingdom",
      text: "Client confidentiality is of utmost importance to our firm. The multi-stage authorization codes are private, secure, and generated dynamically to defend accounts against spoofing."
    },
    {
      id: 12,
      name: "Brenda Miller",
      role: "Global Logistics VP",
      company: "PacifiCorp Shipping Lines",
      location: "Seattle, Washington, United States",
      text: "We move high-weight cargo across the Pacific daily. The currency-locked receipt generation has settled multiple disputes with custom agencies seamlessly."
    },
    {
      id: 13,
      name: "Gau Arua",
      role: "Financial Administrator",
      company: "Rigo Cocoa Growers Syndicate",
      location: "Central Province, Papua New Guinea",
      text: "The ability to run compliance reviews instantly over our cacao export orders has allowed us to scale settlements with our UK chocolate clients."
    },
    {
      id: 14,
      name: "Phyllis Thorne",
      role: "Senior Auditor",
      company: "Thorne & Associates UK",
      location: "Bristol, United Kingdom",
      text: "We audit thousands of global transactions. The ledger trails and compliance-locked certificates processed by this desk are pristine."
    },
    {
      id: 15,
      name: "Dr. Alan Kendrick",
      role: "Head of Infrastructure Projects",
      company: "Kendrick Power & Water Supply",
      location: "New York City, United States",
      text: "Capital allocation for infrastructure under global clearing rules is extremely rigorous. This platform guarantees complete transactional integrity."
    },
    {
      id: 16,
      name: "Vagi Nou",
      role: "Operations Director",
      company: "Motu Kairuku Logistics Corp",
      location: "Port Moresby, Papua New Guinea",
      text: "Moving freight from our harbors requires instantaneous, secure capital routing. The core clearing channels on this network are absolutely stable."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex flex-col relative overflow-hidden">
      
      {/* Deep Obsidian Grid Background & Glowing Amber Halos */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#f59e0b18_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b18_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />
      
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] bg-amber-500/20 blur-[140px] rounded-full pointer-events-none z-0"></div>
        <div className="absolute top-[40%] right-[5%] w-[600px] h-[600px] bg-amber-500/20 blur-[140px] rounded-full pointer-events-none z-0 animate-pulse [animation-duration:15s]"></div>
        <div className="absolute bottom-[10%] left-[30%] w-[600px] h-[600px] bg-amber-500/20 blur-[140px] rounded-full pointer-events-none z-0"></div>
      </div>

      {/* REAL-TIME REMITTANCE TICKER */}
      <div className="bg-[#121824]/80 backdrop-blur-md border-b border-amber-500/30 text-[10px] font-mono text-[#F59E0B] py-2 overflow-hidden whitespace-nowrap z-40 shadow-[0_0_15px_rgba(245,158,11,0.2)] relative">
        <div className="inline-block animate-[marquee_25s_linear_infinite]">
          • USD/PGK CORRIDOR STABLE • PORT MORESBY HUB: CLEARING UNDER 4 MINS • GBP JURISDICTION PROTOCOLS ACTIVE • SECURE TRANSFERS SECURED BY BPNG CORES • LEDGER TIMESTAMPS CALIBRATED • NO LAG REPORTED • USD/PGK CORRIDOR STABLE • PORT MORESBY HUB: CLEARING UNDER 4 MINS •
        </div>
      </div>

      {/* Hero Header */}
      <header className="py-6 px-6 sm:px-12 flex justify-between items-center border-b border-amber-500/20 bg-[#0B0F17]/50 backdrop-blur-xl relative z-10">
        <div className="flex items-center gap-5">
          <div className="w-10 h-10 bg-[#121824] text-[#F59E0B] border border-amber-500/30 hover:border-amber-500/60 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] flex items-center justify-center font-bold">
            <ShieldCheck size={22} />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-wider block drop-shadow-[0_0_5px_rgba(245,158,11,0.2)]">INTERNET SUPPORT TEAM</span>
            <span className="text-[7.5px] font-black tracking-[0.3em] block text-[#8E9BAE]">INTERNATIONAL TRANSFER</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link 
            to="/login" 
            className="text-xs font-bold uppercase tracking-wider text-[#8E9BAE] hover:text-[#F59E0B] hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] transition-colors"
          >
            Client Access
          </Link>
          <Link 
            to="/register" 
            className="px-4 py-2 bg-[#F59E0B] text-[#0B0F17] hover:bg-[#FF9500] hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] border border-amber-500/30 text-xs font-black uppercase tracking-wider transition-all rounded-sm"
          >
            Digital Portfolio Setup
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 sm:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 flex-grow">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold uppercase tracking-widest rounded-full shadow-[0_0_10px_rgba(16,185,129,0.1)]">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Core Routing Infrastructure Stable
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-white uppercase tracking-tight min-h-[120px]">
            <Typewriter phrases={phrases} />
          </h1>
          
          <p className="text-[#8E9BAE] text-sm leading-relaxed max-w-lg">
            Guaranteed secure financial clearances connecting Papua New Guinea with United States and United Kingdom jurisdictions. Authorize, settle, and track heavy trade remittances through correspondent channels protected by military-grade multi-stage key codes.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
            <Link 
              to="/register" 
              className="w-full sm:w-auto px-6 py-4 bg-[#F59E0B] text-[#0B0F17] hover:bg-[#FF9500] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] border border-amber-500/30 rounded-sm hover:scale-[1.02] transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3"
            >
              Request Portal Access <ArrowRight size={14} />
            </Link>
            <Link 
              to="/login" 
              className="w-full sm:w-auto px-6 py-4 bg-[#121824]/40 border border-amber-500/30 text-slate-200 hover:bg-[#121824]/80 hover:border-amber-500/60 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:text-white transition-all text-xs font-bold uppercase tracking-widest text-center backdrop-blur-sm rounded-sm"
            >
              Sign In to Terminal
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-10 border-t border-amber-500/20 mt-10">
            <div>
              <span className="block text-2xl font-extrabold text-[#F59E0B] drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">$2.4B+</span>
              <span className="text-[9px] text-[#8E9BAE] uppercase font-semibold">Volume Handled</span>
            </div>
            <div>
              <span className="block text-2xl font-extrabold text-white">4 Mins</span>
              <span className="text-[9px] text-[#8E9BAE] uppercase font-semibold">Standard Clearance</span>
            </div>
            <div>
              <span className="block text-2xl font-extrabold text-white">100%</span>
              <span className="text-[9px] text-[#8E9BAE] uppercase font-semibold">Stage Protection</span>
            </div>
          </div>
        </div>

        {/* Hero Visual Card Panel - Glassmorphic */}
        <div className="bg-[#0F172A]/60 backdrop-blur-xl rounded-xl border border-amber-500/30 p-8 shadow-[0_0_40px_rgba(245,158,11,0.15)] space-y-6 relative overflow-hidden group hover:border-amber-500/60 transition-all duration-500">
          <div className="absolute top-0 right-0 p-8 text-amber-500 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity duration-500">
            <Globe size={160} />
          </div>

          <div className="flex justify-between items-start relative z-10">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-[#8E9BAE] uppercase tracking-widest">CLEARANCE ROUTE</span>
              <h3 className="text-md font-bold tracking-tight text-white">KINA CHANNELS / PORT MORESBY</h3>
            </div>
            <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[8px] font-bold uppercase tracking-widest rounded shadow-[0_0_10px_rgba(16,185,129,0.1)]">
              Verified Core
            </span>
          </div>

          <div className="h-px bg-amber-500/20 w-full relative z-10" />

          <div className="space-y-6 relative z-10">
            <div className="bg-[#0B0F17]/60 backdrop-blur-md p-6 border border-amber-500/20 hover:border-amber-500/40 rounded-xl flex justify-between items-center shadow-[0_0_15px_rgba(245,158,11,0.05)] transition-colors">
              <div>
                <span className="block text-[8px] font-bold text-[#8E9BAE] uppercase tracking-widest">Base Rate</span>
                <span className="text-xs font-bold text-slate-200">1.00 PGK - 0.25 USD</span>
              </div>
              <div className="text-right">
                <span className="block text-[8px] font-bold text-[#8E9BAE] uppercase tracking-widest">Fee Rate</span>
                <span className="text-xs font-bold text-[#F59E0B]">0.05% Surcharge</span>
              </div>
            </div>

            <div className="bg-[#0B0F17]/60 backdrop-blur-md p-6 border border-amber-500/20 hover:border-amber-500/40 rounded-xl space-y-3 shadow-[0_0_15px_rgba(245,158,11,0.05)] transition-colors">
              <span className="block text-[8px] font-bold text-[#8E9BAE] uppercase tracking-widest">Jurisdictional Certifications</span>
              <div className="flex gap-3">
                <span className="px-2 py-0.5 bg-slate-900/80 text-[#8E9BAE] text-[9px] font-medium border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.1)]">BPNG Core Ready</span>
                <span className="px-2 py-0.5 bg-slate-900/80 text-[#8E9BAE] text-[9px] font-medium border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.1)]">US AML Approved</span>
                <span className="px-2 py-0.5 bg-slate-900/80 text-[#8E9BAE] text-[9px] font-medium border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.1)]">UK FCA Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature highlight Section - Executive Style */}
      <section className="py-20 bg-[#0B0F17]/40 backdrop-blur-md border-t border-amber-500/20 relative z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 text-center">
          <span className="text-[#F59E0B] font-bold text-[10px] uppercase tracking-[0.2em] block mb-2 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]">INTELLIGENT SYSTEM GATEWAY</span>
          <h2 className="text-3xl font-extrabold text-white uppercase tracking-tight">Triple-Stage Protocol Authorization</h2>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#F59E0B] to-transparent mx-auto mt-6 mb-12"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#0F172A]/60 backdrop-blur-xl p-8 rounded-xl border border-amber-500/20 text-left space-y-4 hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] transition-all duration-300">
              <div className="w-12 h-12 bg-[#0B0F17]/80 border border-amber-500/30 text-[#F59E0B] flex items-center justify-center font-bold font-mono shadow-[0_0_15px_rgba(245,158,11,0.2)] rounded-sm">01</div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Transaction Code (TC)</h3>
              <p className="text-xs text-[#8E9BAE] leading-relaxed">Initiates the ledger entry file on our cross-border routing database. Required for any initial remittance instruction.</p>
            </div>
            <div className="bg-[#0F172A]/60 backdrop-blur-xl p-8 rounded-xl border border-amber-500/20 text-left space-y-4 hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] transition-all duration-300">
              <div className="w-12 h-12 bg-[#0B0F17]/80 border border-amber-500/30 text-[#F59E0B] flex items-center justify-center font-bold font-mono shadow-[0_0_15px_rgba(245,158,11,0.2)] rounded-sm">02</div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Verification Code (VC)</h3>
              <p className="text-xs text-[#8E9BAE] leading-relaxed">Secondary clearance layer validating currency reserves and sender identity against global compliance archives.</p>
            </div>
            <div className="bg-[#0F172A]/60 backdrop-blur-xl p-8 rounded-xl border border-amber-500/20 text-left space-y-4 hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] transition-all duration-300">
              <div className="w-12 h-12 bg-[#0B0F17]/80 border border-amber-500/30 text-[#F59E0B] flex items-center justify-center font-bold font-mono shadow-[0_0_15px_rgba(245,158,11,0.2)] rounded-sm">03</div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Switch Code (SC)</h3>
              <p className="text-xs text-[#8E9BAE] leading-relaxed">Final routing approval code establishing a direct correspondent gateway for instantaneous funds release.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. EXACTLY 16 TESTIMONIALS SECTION - GLASSMORPHIC */}
      <section className="py-20 bg-[#0B0F17]/20 border-t border-amber-500/20 relative z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          <div className="text-center mb-16">
            <span className="text-[#F59E0B] font-bold text-[10px] uppercase tracking-[0.2em] block mb-2 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]">PROVEN CORPORATE TRUST</span>
            <h2 className="text-3xl font-extrabold text-white uppercase tracking-tight">Verified Jurisdictional Reviews</h2>
            <p className="text-xs text-[#8E9BAE] mt-3">Connecting Papua New Guinea, the United Kingdom, and the United States.</p>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#F59E0B] to-transparent mx-auto mt-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-[#0F172A]/60 backdrop-blur-xl p-6 rounded-xl border border-amber-500/20 flex flex-col justify-between space-y-6 hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] transition-all duration-300">
                <div className="space-y-3">
                  <div className="flex text-amber-400 gap-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} size={10} fill="#F59E0B" className="text-[#F59E0B] drop-shadow-[0_0_2px_rgba(245,158,11,0.8)]" />)}
                  </div>
                  <p className="text-[11px] text-slate-300 italic leading-relaxed">
                    "{t.text}"
                  </p>
                </div>

                <div className="pt-5 border-t border-amber-500/20 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#b37000] flex items-center justify-center text-[#0B0F17] font-black text-[10px] shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      {t.name}
                      <CheckCircle2 size={10} className="text-emerald-400 drop-shadow-[0_0_2px_rgba(16,185,129,0.8)]" />
                    </span>
                    <span className="block text-[9px] text-[#8E9BAE]">{t.role}, {t.company}</span>
                    <span className="block text-[8px] text-[#F59E0B] font-semibold tracking-wider uppercase mt-0.5">
                      {t.location}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 sm:px-12 bg-[#0B0F17]/90 backdrop-blur-xl text-[#8E9BAE] text-xs border-t border-amber-500/30 text-center relative z-10">
        <div className="max-w-7xl mx-auto space-y-6">
          <p className="uppercase tracking-widest text-[#F59E0B] text-[10px] font-bold drop-shadow-[0_0_2px_rgba(245,158,11,0.5)]">
            INTERNATIONAL TRANSFER OFFICE JURISDICTION DECK
          </p>
          <p className="max-w-3xl mx-auto leading-relaxed text-[10px] text-[#8E9BAE]">
            Deposits, remittances, and settlements instructions routing are secured in connection with local reserve clearinghouses of PNG (BPNG), the United Kingdom (BoE/FCA) and the United States (Fed reserve hubs). All credentials are compliant with AML directives. Continuous monitoring in effect.
          </p>
          <div className="h-px bg-amber-500/20 w-24 mx-auto" />
          <p className="text-[9px] text-[#8E9BAE]">
            © 2026 Internet Support Team. Protected by 256-bit AES encryption. Registered Port 3000.
          </p>
        </div>
      </footer>
    </div>
  );
}
