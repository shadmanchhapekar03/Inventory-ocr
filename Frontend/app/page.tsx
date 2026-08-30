'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen px-6 py-16 max-w-6xl mx-auto space-y-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2.5rem] p-14 md:p-20 shadow-[0_40px_100px_rgba(0,255,247,0.08)]">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-violet-400/10 to-rose-400/5" />
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-cyan-400/15 blur-[80px]" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-rose-400/10 blur-[60px]" />
        <div className="relative z-10 text-center">
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] mb-6">
            <span className="neon-text block">Inventory</span>
            <span className="block text-white/90 text-5xl md:text-7xl font-black">Management System</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-xl mx-auto font-light leading-relaxed">
            AI-powered image recognition. Barcode scanning. Label reading. Zero typing. Gen-Z speed.
          </p>
          <div className="flex gap-4 justify-center mt-8">
            <Link href="/upload" className="px-8 py-4 rounded-2xl font-black text-black bg-gradient-to-r from-cyan-400 to-violet-400 shadow-[0_0_40px_rgba(0,255,247,0.4)] hover:shadow-[0_0_60px_rgba(0,255,247,0.6)] hover:-translate-y-1 transition-all duration-300 text-lg">
              Start Upload →
            </Link>
            <Link href="/data" className="px-8 py-4 rounded-2xl font-bold text-white border border-slate-700 hover:border-cyan-400/60 hover:-translate-y-1 transition-all duration-300 bg-slate-900/30 backdrop-blur-md text-lg">
              View Inventory
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="grid md:grid-cols-3 gap-6">
        {[
          { icon: '📸', title: 'Smart Upload', desc: 'Drop product + label photos. AI reads barcode and text automatically.' },
          { icon: '✏️', title: 'Review & Edit', desc: 'Check extracted data. Fix anything before saving to sheets.' },
          { icon: '📊', title: 'View & Manage', desc: 'Search, filter, sort, and export your full inventory.' },
        ].map((card) => (
          <div key={card.title} className="theme-card p-8 shadow-xl shadow-cyan-900/5 hover:-translate-y-2 transition-all duration-500 group">
            <div className="text-5xl mb-5 group-hover:scale-110 transition-transform duration-300">{card.icon}</div>
            <h3 className="text-xl font-black text-white mb-3">{card.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </section>

      {/* How It Works */}
      <section className="theme-card p-10 shadow-2xl shadow-cyan-900/10">
        <h2 className="text-4xl font-black mb-10 tracking-tight">
          <span className="neon-text">How It Works</span>
        </h2>
        <div className="space-y-8">
          {[
            { num: '01', title: 'Upload Images', desc: 'Select product photo (with barcode) and label photo (MRP, batch, dates).' },
            { num: '02', title: 'AI Extraction', desc: 'Barcode scanning + OCR reads details. No manual typing required.' },
            { num: '03', title: 'Review Data', desc: 'Edit any fields, check validation warnings, confirm accuracy.' },
            { num: '04', title: 'Save & Track', desc: 'Data saved to Google Sheets. View, filter, and export anytime.' },
          ].map((step) => (
            <div key={step.num} className="flex gap-5 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-violet-400/20 border border-cyan-400/20 flex items-center justify-center text-cyan-300 font-black text-lg shadow-[0_0_20px_rgba(0,255,247,0.15)]">
                {step.num}
              </div>
              <div>
                <h3 className="font-black text-lg text-white mb-1">{step.title}</h3>
                <p className="text-slate-500 text-sm">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
