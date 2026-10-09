import React, { useState } from 'react';
import { 
  Code2, 
  FileCode, 
  Upload, 
  Sparkles, 
  Layout, 
  Palette, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  Copy,
  Layers,
  Monitor
} from 'lucide-react';

export default function App() {
  const [copied, setCopied] = useState(false);

  const sampleTemplateTypes = [
    {
      title: 'Landing Page & Showcase',
      desc: 'High-converting hero section, features grid, pricing table, and testimonials.',
      icon: Layout,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'Personal Portfolio & Resume',
      desc: 'Sleek dark/light theme, interactive project showcase, skills, and contact form.',
      icon: Monitor,
      color: 'from-violet-500 to-purple-600',
    },
    {
      title: 'SaaS / Web App Dashboard',
      desc: 'Sidebar navigation, analytics charts, data tables, and user settings.',
      icon: Layers,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'E-Commerce / Storefront',
      desc: 'Product catalog, filtering, shopping cart drawer, and checkout flow.',
      icon: Sparkles,
      color: 'from-amber-500 to-orange-600',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold text-white tracking-tight flex items-center gap-2">
                Web Studio
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Ready
                </span>
              </span>
              <p className="text-xs text-slate-400">Ready to modify, build, or redesign your website</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            Live Preview Active
          </div>
        </div>
      </header>

      {/* Main Hero & Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-12 flex flex-col justify-center">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ready for your files, requirements, or code</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Yes, I can modify your <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-teal-300 bg-clip-text text-transparent">website files</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Please share the code or tell me what changes you’d like to make. You can paste your HTML, CSS, JavaScript, or React code, or describe the website you want to build.
          </p>
        </div>

        {/* Action / Input Guidance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Code2 className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">1. Paste Existing Code</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Have existing HTML, CSS, JavaScript, or Tailwind code? Simply paste it in the chat and I will insert and configure it right into your project.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4">
              <Palette className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">2. Request Modifications</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Need changes like adding new sections, updating colors, making it responsive for mobile, adding forms, animations, or fixing styling? Just let me know what to adjust!
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4">
              <Layout className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">3. Build from Scratch</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Describe what kind of website you need (e.g. portfolio, SaaS landing page, restaurant menu, booking tool, agency site) and I will craft the full site for you.
            </p>
          </div>
        </div>

        {/* Inspiration / Quick Starts */}
        <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Popular Website Types</h3>
              <p className="text-sm text-slate-400">Tell me if you want any of these, or specify your own custom design:</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sampleTemplateTypes.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx}
                  className="group relative bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 rounded-xl p-4 transition-all duration-200 cursor-pointer"
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${item.color} flex items-center justify-center text-white mb-3 shadow-md`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="font-medium text-white text-sm mb-1 group-hover:text-indigo-300 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        Google AI Studio Web Editor • Send your code or design requirements in the chat anytime!
      </footer>
    </div>
  );
}

