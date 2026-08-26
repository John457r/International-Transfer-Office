import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ArrowRight, Star, Globe, TrendingUp, Users, Award, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
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
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col relative overflow-hidden">
      
      {/* 4. REAL-TIME REMITTANCE TICKER */}
      <div className="bg-[#1E293B] border-b border-[#3B82F6]/30 text-[10px] font-mono text-[#3B82F6] py-2 overflow-hidden whitespace-nowrap z-40 shadow-sm">
        <div className="inline-block animate-[marquee_25s_linear_infinite]">
          • USD/PGK CORRIDOR STABLE • PORT MORESBY HUB: CLEARING UNDER 4 MINS • GBP JURISDICTION PROTOCOLS ACTIVE • SECURE TRANSFERS SECURED BY BPNG CORES • LEDGER TIMESTAMPS CALIBRATED • NO LAG REPORTED • USD/PGK CORRIDOR STABLE • PORT MORESBY HUB: CLEARING UNDER 4 MINS •
        </div>
      </div>

      {/* Hero Header */}
      <header className="py-6 px-6 sm:px-12 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-5">
          <div className="w-10 h-10 bg-[#1E293B] text-[#3B82F6] border border-[#3B82F6] flex items-center justify-center font-bold">
            <ShieldCheck size={22} />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-wider block">ITO BANK</span>
            <span className="text-[7.5px] font-black tracking-[0.3em] block text-slate-400">INTERNATIONAL TRANSFER</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link 
            to="/login" 
            className="text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors"
          >
            Client Access
          </Link>
          <Link 
            to="/register" 
            className="px-4 py-2 bg-[#3B82F6] text-[#0F172A] hover:bg-[#60A5FA] text-xs font-black uppercase tracking-wider transition-all"
          >
            Digital Portfolio Setup
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 sm:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold uppercase tracking-widest rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Core Routing Infrastructure Stable
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-white uppercase tracking-tight">
            Seamless Cross-Border <br/>
            <span className="text-[#3B82F6]">Remittance Clearing</span>
          </h1>
          
          <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
            Guaranteed secure financial clearances connecting Papua New Guinea with United States and United Kingdom jurisdictions. Authorize, settle, and track heavy trade remittances through correspondent channels protected by military-grade multi-stage key codes.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
            <Link 
              to="/register" 
              className="w-full sm:w-auto px-6 py-4 bg-[#3B82F6] text-[#0F172A] hover:bg-[#60A5FA] hover:scale-[1.02] transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3"
            >
              Request Portal Access <ArrowRight size={14} />
            </Link>
            <Link 
              to="/login" 
              className="w-full sm:w-auto px-6 py-4 border border-slate-600 text-slate-200 hover:bg-[#1E293B]/60 hover:text-white transition-all text-xs font-bold uppercase tracking-widest text-center"
            >
              Sign In to Terminal
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-10 border-t border-slate-800">
            <div>
              <span className="block text-2xl font-extrabold text-[#3B82F6]">$2.4B+</span>
              <span className="text-[9px] text-slate-400 uppercase font-semibold">Volume Handled</span>
            </div>
            <div>
              <span className="block text-2xl font-extrabold text-white">4 Mins</span>
              <span className="text-[9px] text-slate-400 uppercase font-semibold">Standard Clearance</span>
            </div>
            <div>
              <span className="block text-2xl font-extrabold text-white">100%</span>
              <span className="text-[9px] text-slate-400 uppercase font-semibold">Stage Protection</span>
            </div>
          </div>
        </div>

        {/* Hero Visual Card Panel */}
        <div className="bg-[#1E293B] rounded-xl border border-[#3B82F6]/20 p-8 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-slate-800 opacity-20 pointer-events-none">
            <Globe size={160} />
          </div>

          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">CLEARANCE ROUTE</span>
              <h3 className="text-md font-bold tracking-tight">KINA CHANNELS / PORT MORESBY</h3>
            </div>
            <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[8px] font-bold uppercase tracking-widest rounded">
              Verified Core
            </span>
          </div>

          <div className="h-0.5 bg-slate-800 w-full" />

          <div className="space-y-6">
            <div className="bg-[#0F172A]/50 p-6 border border-slate-700/50 rounded-lg flex justify-between items-center">
              <div>
                <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Base Rate</span>
                <span className="text-xs font-bold text-slate-200">1.00 PGK - 0.25 USD</span>
              </div>
              <div className="text-right">
                <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Fee Rate</span>
                <span className="text-xs font-bold text-emerald-400">0.05% Surcharge</span>
              </div>
            </div>

            <div className="bg-[#0F172A]/50 p-6 border border-slate-700/50 rounded-lg space-y-3">
              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Jurisdictional Certifications</span>
              <div className="flex gap-3">
                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[9px] font-medium border border-slate-700">BPNG Core Ready</span>
                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[9px] font-medium border border-slate-700">US AML Approved</span>
                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[9px] font-medium border border-slate-700">UK FCA Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature highlight Section */}
      <section className="py-16 bg-[#0F172A] border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 text-center">
          <span className="text-[#3B82F6] font-bold text-[10px] uppercase tracking-[0.2em] block mb-2">INTELLIGENT SYSTEM GATEWAY</span>
          <h2 className="text-3xl font-extrabold text-white uppercase tracking-tight">Triple-Stage Protocol Authorization</h2>
          <div className="h-0.5 w-16 bg-[#3B82F6] mx-auto mt-4 mb-10"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#1E293B] p-6 rounded-lg border border-slate-800 text-left space-y-3">
              <div className="w-10 h-10 bg-[#0F172A] border border-[#3B82F6]/30 text-[#3B82F6] flex items-center justify-center font-bold font-mono">01</div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Transaction Code (TC)</h3>
              <p className="text-xs text-slate-400">Initiates the ledger entry file on our cross-border routing database. Required for any initial remittance instruction.</p>
            </div>
            <div className="bg-[#1E293B] p-6 rounded-lg border border-slate-800 text-left space-y-3">
              <div className="w-10 h-10 bg-[#0F172A] border border-[#3B82F6]/30 text-[#3B82F6] flex items-center justify-center font-bold font-mono">02</div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Verification Code (VC)</h3>
              <p className="text-xs text-slate-400">Secondary clearance layer validating currency reserves and sender identity against global compliance archives.</p>
            </div>
            <div className="bg-[#1E293B] p-6 rounded-lg border border-slate-800 text-left space-y-3">
              <div className="w-10 h-10 bg-[#0F172A] border border-[#3B82F6]/30 text-[#3B82F6] flex items-center justify-center font-bold font-mono">03</div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Switch Code (SC)</h3>
              <p className="text-xs text-slate-400">Final routing approval code establishing a direct correspondent gateway for instantaneous funds release.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. EXACTLY 16 TESTIMONIALS SECTION */}
      <section className="py-20 bg-[#1E293B]/30 border-t border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          <div className="text-center mb-16">
            <span className="text-[#3B82F6] font-bold text-[10px] uppercase tracking-[0.2em] block mb-2">PROVEN CORPORATE TRUST</span>
            <h2 className="text-3xl font-extrabold text-white uppercase tracking-tight">Verified Jurisdictional Reviews</h2>
            <p className="text-xs text-slate-400 mt-2">Connecting Papua New Guinea, the United Kingdom, and the United States.</p>
            <div className="h-0.5 w-16 bg-[#3B82F6] mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-[#1E293B] p-6 rounded-lg border border-[#3B82F6]/10 flex flex-col justify-between space-y-6 hover:border-[#3B82F6]/30 transition-all shadow-md">
                <div className="space-y-3">
                  <div className="flex text-amber-400 gap-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} size={10} fill="#3B82F6" className="text-[#3B82F6]" />)}
                  </div>
                  <p className="text-[11px] text-slate-300 italic leading-relaxed">
                    "{t.text}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <span className="block text-xs font-bold text-white">{t.name}</span>
                  <span className="block text-[9px] text-slate-400">{t.role}, {t.company}</span>
                  <span className="block text-[8px] text-[#3B82F6] font-semibold tracking-wider uppercase mt-1">
                    {t.location}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 sm:px-12 bg-[#0F172A] text-slate-500 text-xs border-t border-slate-800 text-center">
        <div className="max-w-7xl mx-auto space-y-6">
          <p className="uppercase tracking-widest text-[#3B82F6] text-[10px] font-bold">
            INTERNATIONAL TRANSFER OFFICE JURISDICTION DECK
          </p>
          <p className="max-w-3xl mx-auto leading-relaxed text-[10px] text-slate-400">
            Deposits, remittances, and settlements instructions routing are secured in connection with local reserve clearinghouses of PNG (BPNG), the United Kingdom (BoE/FCA) and the United States (Fed reserve hubs). All credentials are compliant with AML directives. Continuous monitoring in effect.
          </p>
          <div className="h-px bg-slate-800 w-24 mx-auto" />
          <p className="text-[9px] text-slate-600">
            © 2026 International Transfer Office. Protected by 256-bit AES encryption. Registered Port 3000.
          </p>
        </div>
      </footer>

    </div>
  );
}
