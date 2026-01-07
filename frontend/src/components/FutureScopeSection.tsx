import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Database, 
  Cpu, 
  Brain, 
  TestTube, 
  Repeat, 
  BarChart2, 
  GraduationCap, 
  Briefcase, 
  BookOpen,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const scopes = [
  {
    id: 1,
    title: "Universal Multi-Language Framework",
    icon: Globe,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    current: ["JavaScript", "SQL", "Config/JSON", "API payloads"],
    future: ["Python", "Java", "C/C++", "Go", "Rust", "PHP", "Ruby", "Kotlin", "Swift", "Bash", "Docker", "K8s", "Terraform", "GraphQL", "Solidity"],
    impact: "One platform for polyglot enterprises."
  },
  {
    id: 2,
    title: "Security Stress Testing",
    icon: Database,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/20",
    desc: "Analyze thousands of code samples to study vulnerability patterns and secure coding maturity trends.",
    impact: "Data-driven security decisions for organizations."
  },
  {
    id: 3,
    title: "LLM-Aware Dataset Generation",
    icon: Sparkles,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
    desc: "Generate high-quality labeled datasets (secure vs insecure pairs) to train security-aware LLMs.",
    impact: "Reduces hallucinations in AI coding tools."
  },
  {
    id: 4,
    title: "Custom Secure Coding LLMs",
    icon: Brain,
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/20",
    desc: "Fine-tuned models trained on defensive data. AI never gains detection authority or generates exploits.",
    impact: "AI that explains security like a senior engineer."
  },
  {
    id: 5,
    title: "Secure LLM Benchmarking Lab",
    icon: TestTube,
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
    desc: "Test how LLMs respond to insecure code and measure hallucination rates.",
    impact: "Positions platform at the AI-security intersection."
  },
  {
    id: 6,
    title: "Autonomous Learning Loops",
    icon: Repeat,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/20",
    desc: "Human-in-the-loop validation enriches datasets and improves AI explanations over time.",
    impact: "Continuous improvement without exploitation."
  },
  {
    id: 7,
    title: "Cross-Language Risk Intelligence",
    icon: BarChart2,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
    desc: "Compare risk across languages (e.g., Java vs Node.js) with language-specific risk heatmaps.",
    impact: "Enterprise-grade insight for CTOs."
  },
  {
    id: 8,
    title: "AI-Assisted Education Platform",
    icon: GraduationCap,
    color: "text-pink-400",
    bg: "bg-pink-400/10",
    border: "border-pink-400/20",
    desc: "Personalized learning paths and secure coding challenges for universities and corporate training.",
    impact: "Ideal for developer onboarding."
  },
  {
    id: 9,
    title: "Industry-Scale Applications",
    icon: Briefcase,
    color: "text-indigo-400",
    bg: "bg-indigo-400/10",
    border: "border-indigo-400/20",
    desc: "Adoption in DevSecOps, AI coding assistants, secure IDE extensions, and compliance tooling.",
    impact: "Broad industry applicability."
  },
  {
    id: 10,
    title: "Research & Academic Scope",
    icon: BookOpen,
    color: "text-teal-400",
    bg: "bg-teal-400/10",
    border: "border-teal-400/20",
    desc: "Studies on vulnerability evolution, secure pattern mining, and ethical AI in cybersecurity.",
    impact: "Perfect for PhD research and conferences."
  }
];

export const FutureScopeSection = () => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <section id="roadmap" className="py-32 px-6 border-t border-white/5 bg-[#0B0F19] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-20 text-center velocity-skew">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-mono mb-4">
            <Sparkles size={12} />
            <span>VISION 2026 // ROADMAP</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
            Future <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Horizons</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Pioneering the intersection of static analysis, ethical AI, and secure engineering education.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scopes.map((scope) => (
            <motion.div
              key={scope.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: scope.id * 0.05 }}
              onMouseEnter={() => setHoveredId(scope.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`relative p-8 rounded-2xl border ${scope.border} bg-black/40 backdrop-blur-sm group hover:bg-white/5 transition-all duration-300`}
            >
              {/* Hover Glow Effect */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${scope.bg} to-transparent rounded-2xl pointer-events-none`} />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-xl ${scope.bg} flex items-center justify-center ${scope.color} border ${scope.border}`}>
                    <scope.icon size={24} />
                  </div>
                  <span className="text-[10px] font-mono text-gray-600 border border-gray-800 px-2 py-1 rounded">
                    0{scope.id}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">
                  {scope.title}
                </h3>

                {scope.current && (
                  <div className="mb-4">
                    <div className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-wider">Coverage Expansion</div>
                    <div className="flex flex-wrap gap-2">
                      {scope.current.map(l => (
                        <span key={l} className="text-[10px] px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">{l}</span>
                      ))}
                      <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700 flex items-center gap-1">
                        +15 more <ChevronRight size={8} />
                      </span>
                    </div>
                  </div>
                )}

                <p className="text-gray-400 text-sm leading-relaxed mb-4 min-h-[60px]">
                  {scope.desc || scope.impact}
                </p>

                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 group-hover:text-gray-300 transition-colors">
                  <span className={`w-1.5 h-1.5 rounded-full ${scope.color.replace('text-', 'bg-')}`} />
                  {scope.impact.split(' ').slice(0, 5).join(' ')}...
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
