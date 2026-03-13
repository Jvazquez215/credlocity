import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { toast } from 'sonner';
import {
  LayoutDashboard, Menu, Wallet, Banknote, Handshake, Shield,
  GraduationCap, PenTool, MessageCircle, CreditCard, Users,
  FileText, ChevronRight, Search, BookOpen, Info, AlertTriangle,
  Lightbulb, ArrowRight, ChevronDown, ChevronUp, Table
} from 'lucide-react';
import { Input } from '../../../components/ui/input';

const ICON_MAP = {
  LayoutDashboard, Menu, Wallet, Banknote, Handshake, Shield,
  GraduationCap, PenTool, MessageCircle, CreditCard, Users,
  FileText, BookOpen
};

const CATEGORY_META = {
  'getting-started': { label: 'Getting Started', color: 'bg-blue-500' },
  'operations': { label: 'Operations', color: 'bg-emerald-500' },
  'finance': { label: 'Finance & Billing', color: 'bg-amber-500' },
  'hr': { label: 'HR & Training', color: 'bg-violet-500' },
  'legal': { label: 'Legal', color: 'bg-red-500' },
  'marketing': { label: 'Marketing & Content', color: 'bg-pink-500' },
  'admin': { label: 'Administration', color: 'bg-slate-600' },
};

const AnnotatedScreenshot = ({ block }) => {
  const [activeAnnotation, setActiveAnnotation] = useState(null);
  if (!block.annotations || block.annotations.length === 0) return null;

  return (
    <div className="my-4" data-testid="annotated-screenshot">
      <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl border-2 border-slate-300 overflow-hidden" style={{ minHeight: 220 }}>
        {block.image_url ? (
          <img src={block.image_url} alt={block.alt_text} className="w-full" />
        ) : (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <div className="text-center">
              <LayoutDashboard className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">{block.alt_text}</p>
              <p className="text-xs mt-1">Screenshot reference area</p>
            </div>
          </div>
        )}
        {block.annotations.map((ann, i) => (
          <button
            key={i}
            className={`absolute w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer transition-all z-10 ${activeAnnotation === i ? 'bg-blue-600 text-white scale-125 ring-4 ring-blue-200' : 'bg-white text-blue-700 border-2 border-blue-500 hover:bg-blue-600 hover:text-white shadow-lg'}`}
            style={{ left: `${ann.x}%`, top: `${ann.y}%`, transform: 'translate(-50%, -50%)' }}
            onClick={() => setActiveAnnotation(activeAnnotation === i ? null : i)}
            data-testid={`annotation-marker-${ann.num}`}
          >
            {ann.num}
          </button>
        ))}
      </div>
      <div className="mt-3 space-y-1.5">
        {block.annotations.map((ann, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${activeAnnotation === i ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}
            onClick={() => setActiveAnnotation(activeAnnotation === i ? null : i)}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${activeAnnotation === i ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>{ann.num}</span>
            <p className="text-sm text-gray-700 leading-relaxed">{ann.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const ContentBlock = ({ block }) => {
  const [expanded, setExpanded] = useState(true);

  if (block.type === 'text') {
    return (
      <div className="mb-5">
        {block.title && <h3 className="text-lg font-semibold text-gray-900 mb-2">{block.title}</h3>}
        <p className="text-sm text-gray-600 leading-relaxed">{block.content}</p>
      </div>
    );
  }

  if (block.type === 'screenshot') {
    return <AnnotatedScreenshot block={block} />;
  }

  if (block.type === 'callout') {
    const styles = {
      info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: Info, iconColor: 'text-blue-500' },
      warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertTriangle, iconColor: 'text-amber-500' },
      tip: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: Lightbulb, iconColor: 'text-emerald-500' },
    };
    const s = styles[block.variant] || styles.info;
    const Icon = s.icon;
    return (
      <div className={`${s.bg} border ${s.border} rounded-lg p-4 mb-5 flex items-start gap-3`}>
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${s.iconColor}`} />
        <p className="text-sm text-gray-700 leading-relaxed">{block.content}</p>
      </div>
    );
  }

  if (block.type === 'list') {
    return (
      <div className="mb-5">
        {block.title && <h3 className="text-lg font-semibold text-gray-900 mb-2">{block.title}</h3>}
        <ul className="space-y-2">
          {block.items?.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
              <ArrowRight className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (block.type === 'table') {
    return (
      <div className="mb-5">
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 mb-2 text-lg font-semibold text-gray-900 hover:text-blue-600">
          <Table className="w-4 h-4" />
          {block.title}
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {expanded && (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>{block.headers?.map((h, i) => <th key={i} className="px-3 py-2 text-left font-semibold text-gray-700 border-b">{h}</th>)}</tr>
              </thead>
              <tbody>
                {block.rows?.map((row, ri) => (
                  <tr key={ri} className="hover:bg-gray-50 border-b last:border-0">
                    {row.map((cell, ci) => <td key={ci} className="px-3 py-2 text-gray-600">{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default function DocumentCenter() {
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const res = await api.get('/documentation/sections');
      setSections(res.data);
      if (res.data.length > 0) setActiveSection(res.data[0].id);
    } catch (err) {
      console.error('Error loading documentation:', err);
      toast.error('Failed to load documentation');
    } finally {
      setLoading(false);
    }
  };

  const grouped = sections.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  const filteredSections = search
    ? sections.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase()) ||
        s.content_blocks?.some(b => (b.content || '').toLowerCase().includes(search.toLowerCase()) || (b.title || '').toLowerCase().includes(search.toLowerCase()))
      )
    : sections;

  const filteredGrouped = filteredSections.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  const currentSection = sections.find(s => s.id === activeSection);
  const currentIndex = sections.findIndex(s => s.id === activeSection);

  if (loading) {
    return <div className="flex items-center justify-center min-h-96"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="flex h-[calc(100vh-64px)]" data-testid="document-center">
      {/* Left Navigation */}
      <div className="w-72 bg-white border-r flex-shrink-0 overflow-y-auto">
        <div className="p-4 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-gray-900">Document Center</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search docs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-sm"
              data-testid="doc-search"
            />
          </div>
        </div>
        <nav className="p-3">
          {Object.entries(filteredGrouped).map(([cat, items]) => {
            const meta = CATEGORY_META[cat] || { label: cat, color: 'bg-gray-500' };
            return (
              <div key={cat} className="mb-4">
                <div className="flex items-center gap-2 px-2 mb-1.5">
                  <div className={`w-2 h-2 rounded-full ${meta.color}`} />
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{meta.label}</span>
                </div>
                {items.map(section => {
                  const Icon = ICON_MAP[section.icon] || FileText;
                  const isActive = section.id === activeSection;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-all ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                      data-testid={`doc-nav-${section.slug}`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className="truncate">{section.title}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {currentSection ? (
          <div className="max-w-3xl mx-auto py-8 px-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-6">
              <span>Document Center</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-gray-500">{CATEGORY_META[currentSection.category]?.label || currentSection.category}</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-gray-700 font-medium">{currentSection.title}</span>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentSection.title}</h1>
              <p className="text-base text-gray-500">{currentSection.description}</p>
            </div>

            {/* Content Blocks */}
            <div className="bg-white rounded-xl border p-6 shadow-sm">
              {currentSection.content_blocks?.map((block, i) => (
                <ContentBlock key={i} block={block} />
              ))}
            </div>

            {/* Navigation Footer */}
            <div className="flex justify-between mt-8 pt-4 border-t">
              {currentIndex > 0 ? (
                <button onClick={() => setActiveSection(sections[currentIndex - 1].id)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600">
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  {sections[currentIndex - 1].title}
                </button>
              ) : <div />}
              {currentIndex < sections.length - 1 ? (
                <button onClick={() => setActiveSection(sections[currentIndex + 1].id)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600">
                  {sections[currentIndex + 1].title}
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : <div />}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Select a section to view documentation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
