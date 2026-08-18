import React from 'react';
import {
  Shield,
  Bot,
  UserCheck,
  Building2,
  Lock,
  BookOpen,
  Globe,
  Sparkles,
  ChevronDown,
  Activity,
} from 'lucide-react';
import { LanguageConfig, UserRole } from '../types';
import { SUPPORTED_LANGUAGES } from '../data/mockData';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  currentLanguage: string;
  onLanguageChange: (langCode: string) => void;
  pendingApprovalsCount: number;
  onOpenKnowledgeBase: () => void;
  onOpenAuditTrail: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  currentLanguage,
  onLanguageChange,
  pendingApprovalsCount,
  onOpenKnowledgeBase,
  onOpenAuditTrail,
}) => {
  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) ||
    SUPPORTED_LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Problem Statement ID */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold tracking-tight text-white">
                  SOA S1 Agentic Platform
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-md">
                  SOAIDEATHON-S1
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Human-in-the-Loop Agentic AI for Autonomous Institutional Service Delivery
              </p>
            </div>
          </div>

          {/* Center / Right controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Knowledge Base Button */}
            <button
              id="btn-knowledge-base"
              onClick={onOpenKnowledgeBase}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-all"
              title="View Verified Institutional By-Laws & Policies"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Verified Policies</span>
            </button>

            {/* Audit Trail Button */}
            <button
              id="btn-audit-trail"
              onClick={onOpenAuditTrail}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-all"
              title="View Cryptographic Action Trail"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Cryptographic Trail</span>
            </button>

            {/* Language Selector */}
            <div className="relative group">
              <div className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800/90 border border-slate-700 rounded-lg text-xs cursor-pointer hover:bg-slate-700">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-medium text-slate-200">{currentLangObj.flag} {currentLangObj.nativeName}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <div className="absolute right-0 mt-1 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 hidden group-hover:block z-50">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  Multilingual AI Engine
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => onLanguageChange(lang.code)}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                      currentLanguage === lang.code
                        ? 'bg-indigo-600/30 text-indigo-300 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>
                      {lang.flag} {lang.nativeName}
                    </span>
                    <span className="text-[10px] text-slate-400">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Multi-Role Switcher Tabs */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center space-x-1">
              <button
                id="role-student"
                onClick={() => onRoleChange('student')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  currentRole === 'student'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Student</span>
              </button>

              <button
                id="role-approver"
                onClick={() => onRoleChange('approver')}
                className={`relative px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  currentRole === 'approver'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">HITL Approver</span>
                {pendingApprovalsCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-bold animate-pulse">
                    {pendingApprovalsCount}
                  </span>
                )}
              </button>

              <button
                id="role-admin"
                onClick={() => onRoleChange('admin')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  currentRole === 'admin'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Governance</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
