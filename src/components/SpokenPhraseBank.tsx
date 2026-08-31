import React, { useState } from 'react';
import { 
  MessageSquare, 
  Volume2, 
  Sparkles, 
  Copy, 
  Check, 
  BookOpen, 
  ShieldCheck, 
  ArrowRight,
  HelpCircle
} from 'lucide-react';

interface PhraseCategory {
  title: string;
  description: string;
  color: string;
  phrases: {
    phrase: string;
    whenToUse: string;
    exampleUsage: string;
  }[];
}

const phraseCategories: PhraseCategory[] = [
  {
    title: 'Natural Openers & Framing',
    description: 'Avoid robotic definitions. Start your answer like an experienced software engineer describing how things work in practice.',
    color: 'emerald',
    phrases: [
      {
        phrase: '“The way I usually think about it is...”',
        whenToUse: 'At the start of any conceptual question to sound natural and structured.',
        exampleUsage: '“The way I usually think about DbContext in EF Core is as a combination of Unit of Work and Repository patterns.”'
      },
      {
        phrase: '“At a high level, the main idea is...”',
        whenToUse: 'When summarizing a complex concept before diving into the details.',
        exampleUsage: '“At a high level, the main idea behind JWT is stateless authentication—the server signs the payload with a secret key so it doesn\'t need to query a session database on every request.”'
      },
      {
        phrase: '“In my day-to-day work with .NET / Angular, we typically...”',
        whenToUse: 'Anchors your answer in real-world professional experience rather than textbook theory.',
        exampleUsage: '“In my day-to-day work with Angular, we typically use RxJS `debounceTime` and `switchMap` for search typeaheads to prevent request flooding.”'
      },
      {
        phrase: '“The core difference comes down to...”',
        whenToUse: 'When asked "What is the difference between X and Y?" (e.g. IQueryable vs IEnumerable, Scoped vs Transient).',
        exampleUsage: '“The core difference comes down to where the filtering happens: IQueryable executes the WHERE clause on SQL Server, while IEnumerable executes it in memory in C#.”'
      }
    ]
  },
  {
    title: 'Explaining Trade-offs & Nuances (Senior Level)',
    description: 'Proving you understand real-world consequences, bottlenecks, and engineering trade-offs.',
    color: 'amber',
    phrases: [
      {
        phrase: '“The trade-off here is between X and Y...”',
        whenToUse: 'Demonstrates architectural maturity when discussing performance vs consistency.',
        exampleUsage: '“The trade-off here is between read latency and data freshness: Redis caching gives us sub-10ms responses, but we need an invalidation strategy for stale records.”'
      },
      {
        phrase: '“In a small application that works fine, but at scale...”',
        whenToUse: 'Explaining why a simple solution fails under load.',
        exampleUsage: '“In a small application, saving files to local disk works fine, but at scale in Kubernetes with multiple pods, you need object storage like Azure Blob or S3.”'
      },
      {
        phrase: '“One pitfall to watch out for is...”',
        whenToUse: 'Highlighting common junior mistakes and edge cases.',
        exampleUsage: '“One pitfall to watch out for with EF Core is the N+1 query issue when iterating over navigation properties without `.Include()`.”'
      },
      {
        phrase: '“While X gives us convenience, the downside is...”',
        whenToUse: 'Evaluating tools like Lazy Loading, AutoMapper, or ORMs objectively.',
        exampleUsage: '“While Lazy Loading gives us convenience, the downside is hidden database roundtrips that kill performance in loops.”'
      }
    ]
  },
  {
    title: 'Troubleshooting & Scenario Triage',
    description: 'Sounding calm, methodical, and senior during live diagnostic and outage questions.',
    color: 'sky',
    phrases: [
      {
        phrase: '“The first place I would look is...”',
        whenToUse: 'Starting a troubleshooting scenario systematically.',
        exampleUsage: '“The first place I would look is the browser Network tab timing waterfall to isolate whether the 3-second delay is in TTFB or Content Download.”'
      },
      {
        phrase: '“I would follow a top-down diagnostic approach...”',
        whenToUse: 'Describing an organized investigation strategy.',
        exampleUsage: '“I would follow a top-down diagnostic approach: check the API gateway access logs, inspect APM distributed traces, and check SQL lock waits.”'
      },
      {
        phrase: '“To prevent this from failing catastrophically, we use...”',
        whenToUse: 'Introducing resilience patterns like Circuit Breakers, Retries, or Fallbacks.',
        exampleUsage: '“To prevent a downstream payment outage from exhausting our thread pool, we wrap the HTTP client in a Polly Circuit Breaker.”'
      }
    ]
  },
  {
    title: 'Buying Time Gracefully & Asking Clarifying Questions',
    description: 'How to pause without awkward silence or clarify ambiguous requirements.',
    color: 'violet',
    phrases: [
      {
        phrase: '“That’s a great question. Let me think through the two main approaches...”',
        whenToUse: 'Buys 5–10 seconds of thinking time while sounding confident and composed.',
        exampleUsage: '“That’s a great question. Let me think through the two main approaches: synchronous RPC via REST versus asynchronous event publishing with RabbitMQ.”'
      },
      {
        phrase: '“Before diving into the architecture, let me clarify the scale and SLA requirements...”',
        whenToUse: 'System design questions to define functional and non-functional requirements first.',
        exampleUsage: '“Before diving into the architecture, let me clarify the traffic: are we optimizing for 1,000 writes per minute or a high-throughput read-heavy workload?”'
      },
      {
        phrase: '“Are we optimizing for immediate consistency or high availability?”',
        whenToUse: 'CAP theorem and distributed system trade-offs.',
        exampleUsage: '“Are we optimizing for strong consistency during checkout, or is eventual consistency acceptable for product reviews?”'
      }
    ]
  }
];

export const SpokenPhraseBank: React.FC = () => {
  const [copiedPhrase, setCopiedPhrase] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPhrase(text);
    setTimeout(() => setCopiedPhrase(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
          <MessageSquare className="w-3.5 h-3.5" /> Spoken English Interview Toolkit
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Phrases to Sound Natural, Confident & Senior
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          Technical interviews are conversations, not exams. Using these conversational transitions and architectural framing phrases will help you explain complex full-stack concepts clearly, smoothly, and without sounding rehearsed.
        </p>
      </div>

      {/* Phrase Categories */}
      <div className="space-y-6">
        {phraseCategories.map((cat, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-5 shadow-sm">
            
            <div className="space-y-1 border-b border-slate-100 pb-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-indigo-600" />
                {cat.title}
              </h2>
              <p className="text-xs text-slate-500">{cat.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cat.phrases.map((item, pIdx) => {
                const isCopied = copiedPhrase === item.phrase;
                return (
                  <div 
                    key={pIdx}
                    className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3 hover:border-slate-300 transition-colors flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900 tracking-tight">
                          {item.phrase}
                        </span>
                        <button
                          onClick={() => handleCopy(item.phrase)}
                          className="p-1.5 rounded bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
                          title="Copy Phrase"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="text-xs text-indigo-700 font-medium">
                        <strong>When to use: </strong>{item.whenToUse}
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 italic">
                      <strong className="text-slate-400 not-italic">Example: </strong>
                      {item.exampleUsage}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
