import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Layers, 
  Server, 
  Database, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Workflow, 
  ArrowRight,
  Globe,
  Radio,
  FileCode,
  HardDrive
} from 'lucide-react';
import { Question, SystemDesignSection } from '../types';
import { systemDesignQuestions } from '../data/systemDesignQuestions';

interface SystemDesignViewProps {
  onSelectQuestion: (question: Question) => void;
}

export const SystemDesignView: React.FC<SystemDesignViewProps> = ({ onSelectQuestion }) => {
  const [selectedDesignId, setSelectedDesignId] = useState<string>(systemDesignQuestions[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'architecture' | 'frontend' | 'backend' | 'database' | 'failures'>('architecture');

  const selectedQuestion = systemDesignQuestions.find(q => q.id === selectedDesignId) || systemDesignQuestions[0];
  const details = selectedQuestion?.systemDesignDetails;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-fuchsia-950/40 via-slate-900 to-slate-900 border border-fuchsia-500/20 rounded-3xl p-6 sm:p-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-400 text-xs font-semibold">
          <LayoutGrid className="w-3.5 h-3.5" /> Full-Stack System Design Blueprints
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Enterprise Practical System Architectures
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Real-world architectural blueprints with deep-dives into Angular frontends, ASP.NET Core microservices, Redis/SQL databases, event streaming, and failure mitigations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar: Blueprint Selection Menu */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            System Design Problems ({systemDesignQuestions.length})
          </span>
          <div className="space-y-2">
            {systemDesignQuestions.map((item) => {
              const isSelected = item.id === selectedDesignId;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedDesignId(item.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-fuchsia-600/15 border-fuchsia-500/50 shadow-lg text-white'
                      : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-400">
                      {item.topic}
                    </span>
                    <h3 className="text-xs font-bold text-white line-clamp-1">
                      {item.question.replace('System Design: ', '')}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Main Blueprint Content Area */}
        <div className="lg:col-span-8 space-y-6">
          {selectedQuestion && details && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              
              {/* Question Header */}
              <div className="space-y-2 border-b border-slate-800 pb-5">
                <span className="text-xs font-bold uppercase text-fuchsia-400 tracking-wider">
                  {selectedQuestion.topic}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                  {selectedQuestion.question}
                </h2>
                <p className="text-xs text-slate-300 italic pt-1">
                  <strong>Elevator Pitch: </strong>"{selectedQuestion.shortAnswer}"
                </p>
              </div>

              {/* Functional & Non-Functional Requirements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Functional Requirements
                  </span>
                  <ul className="space-y-1">
                    {details.requirements.functional.map((f, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                    Non-Functional SLA / Scale
                  </span>
                  <ul className="space-y-1">
                    {details.requirements.nonFunctional.map((nf, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                        <span>{nf}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none text-xs font-bold">
                <button
                  onClick={() => setActiveTab('architecture')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all ${
                    activeTab === 'architecture' ? 'bg-fuchsia-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Architecture Overview
                </button>
                <button
                  onClick={() => setActiveTab('frontend')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all ${
                    activeTab === 'frontend' ? 'bg-fuchsia-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Frontend & API Design
                </button>
                <button
                  onClick={() => setActiveTab('backend')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all ${
                    activeTab === 'backend' ? 'bg-fuchsia-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Backend & Async Messaging
                </button>
                <button
                  onClick={() => setActiveTab('database')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all ${
                    activeTab === 'database' ? 'bg-fuchsia-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Database & Caching
                </button>
                <button
                  onClick={() => setActiveTab('failures')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all ${
                    activeTab === 'failures' ? 'bg-fuchsia-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Failures & Trade-offs
                </button>
              </div>

              {/* Tab 1: Architecture Overview */}
              {activeTab === 'architecture' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-300 uppercase">End-to-End Dataflow:</span>
                    <p className="text-xs sm:text-sm text-fuchsia-300 font-mono leading-relaxed">
                      {details.architectureOverview}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-300 uppercase">Conversational Explanation:</span>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                      {selectedQuestion.interviewAnswer}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: Frontend & API Design */}
              {activeTab === 'frontend' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-sky-400 uppercase flex items-center gap-1.5">
                      <Globe className="w-4 h-4" /> Angular Frontend Architecture
                    </span>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {details.frontendDesign}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-indigo-400 uppercase flex items-center gap-1.5">
                      <FileCode className="w-4 h-4" /> REST API Endpoints & Contract
                    </span>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-mono">
                      {details.apiDesign}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 3: Backend & Async Messaging */}
              {activeTab === 'backend' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-indigo-400 uppercase flex items-center gap-1.5">
                      <Server className="w-4 h-4" /> ASP.NET Core Backend Services
                    </span>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {details.backendServices}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-rose-400 uppercase flex items-center gap-1.5">
                      <Workflow className="w-4 h-4" /> Async Event Streams (RabbitMQ / Kafka)
                    </span>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {details.messagingAndAsync}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 4: Database & Caching */}
              {activeTab === 'database' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
                      <Database className="w-4 h-4" /> Database Schema & Data Models
                    </span>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {details.databaseSchema}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                      <HardDrive className="w-4 h-4" /> Multi-Tier Caching Strategy (Redis & CDN)
                    </span>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {details.cachingAndPerformance}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 5: Failure Scenarios & Trade-offs */}
              {activeTab === 'failures' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-rose-400 uppercase flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> Failure Scenarios & Mitigations
                    </span>
                    <ul className="space-y-2 pt-1">
                      {Array.isArray(details.failureScenariosAndMitigations) ? (
                        details.failureScenariosAndMitigations.map((fail: any, i: number) => (
                          <li key={i} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                            <span className="text-rose-400 font-bold">•</span>
                            <span>{fail}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                          {details.failureScenariosAndMitigations}
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Architectural Trade-offs
                    </span>
                    <ul className="space-y-2 pt-1">
                      {Array.isArray(details.tradeOffs) ? (
                        details.tradeOffs.map((to: any, i: number) => (
                          <li key={i} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                            <span className="text-amber-400 font-bold">•</span>
                            <span>{to}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                          {details.tradeOffs}
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {/* View Full Question Detail CTA */}
              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => onSelectQuestion(selectedQuestion)}
                  className="px-5 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-fuchsia-600/20"
                >
                  Open in Dedicated Practice Mode <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
};
