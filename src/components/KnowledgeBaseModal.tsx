import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Tag,
  Calendar,
  Building,
  ArrowRight,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import { KnowledgeBaseItem } from '../types';
import { VERIFIED_KNOWLEDGE_BASE } from '../data/mockData';

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPolicyForPrompt?: (prompt: string, category: string) => void;
}

export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({
  isOpen,
  onClose,
  onSelectPolicyForPrompt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const filteredItems = VERIFIED_KNOWLEDGE_BASE.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.clauseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleTestPolicy = (item: KnowledgeBaseItem) => {
    let testPrompt = '';
    if (item.category === 'academic') {
      testPrompt = 'I need an urgent official stamped academic transcript of all 6 completed semesters for my foreign university visa appointment.';
    } else if (item.category === 'laboratory') {
      testPrompt = 'Reserve 4x NVIDIA A100 GPU nodes on the research cluster for 12 hours tonight (18:00 - 06:00) under project CS-2026-AI.';
    } else if (item.category === 'maintenance') {
      testPrompt = 'Emergency: The AC unit in Hostel 4 Room 402 is smoking and water is leaking directly over the main 230V socket.';
    } else {
      testPrompt = 'My attendance in Distributed Systems is 73.5% due to 5 days hospitalization at SUM Hospital. I want to appeal for condonation under Section 4.2B.';
    }

    if (onSelectPolicyForPrompt) {
      onSelectPolicyForPrompt(testPrompt, item.category);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Verified Institutional Knowledge Base & RAG Index
              </h3>
              <p className="text-xs text-slate-400">
                Official University Statutes, Academic By-Laws & Lab Safety Codes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by keywords, clauses (e.g. §3.1, A100, attendance, AC smoke)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'academic', 'laboratory', 'maintenance', 'grievance'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* List of Knowledge Items */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {filteredItems.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No matching institutional clauses found. Try different search terms.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all shadow-md"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 rounded">
                      {item.clauseCode}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">{item.title}</h4>
                  </div>
                  <button
                    onClick={() => handleTestPolicy(item)}
                    className="px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all whitespace-nowrap"
                    title="Load an AI scenario testing this policy"
                  >
                    <span>Test in Agent</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <p className="text-xs text-slate-300 mb-2 leading-relaxed">{item.summary}</p>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 font-serif leading-relaxed">
                  &ldquo;{item.fullText}&rdquo;
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <Building className="w-3 h-3" />
                      <span>{item.authority}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Effective: {item.effectiveDate}</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {item.tags.map((t) => (
                      <span key={t} className="px-1.5 py-0.5 bg-slate-900 rounded text-slate-400">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>All policies verified and cryptographically indexed for Agentic RAG</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
