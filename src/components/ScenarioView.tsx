import React from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  Terminal, 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  Globe, 
  Layers, 
  Database,
  Code2
} from 'lucide-react';
import { Question } from '../types';
import { scenariosQuestions } from '../data/scenariosQuestions';

interface ScenarioViewProps {
  onSelectQuestion: (question: Question) => void;
}

export const ScenarioView: React.FC<ScenarioViewProps> = ({ onSelectQuestion }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Real-World Diagnostic Scenarios
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Cross-Stack Troubleshooting & System Triage
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          The most critical questions in Senior & Full-Stack interviews are realistic "broken system" scenarios. Practice debugging latency spikes, out-of-order Angular responses, and downstream microservice outages.
        </p>
      </div>

      {/* Grid of Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scenariosQuestions.map((q) => (
          <div
            key={q.id}
            onClick={() => onSelectQuestion(q)}
            className="bg-white hover:border-indigo-300 border border-slate-200 rounded-xl p-6 cursor-pointer shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase border border-indigo-100">
                  {q.topic}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-600">
                  {q.difficulty}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                {q.question}
              </h2>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
                <strong className="text-slate-800">Core Solution: </strong>
                {q.shortAnswer}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{q.keyPointsToMention.length} Key Diagnostic Steps</span>
              </div>

              <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Open Full Triage Plan <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
