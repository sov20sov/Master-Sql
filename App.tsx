
import React, { useState, useEffect, useRef, useMemo, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Link, useParams, useLocation } from 'react-router-dom';
import { 
  BookOpen, Code, Home, GraduationCap, Moon, Sun, Menu, X, CheckCircle, Play, HelpCircle, 
  FileText, AlertTriangle, Instagram, Sparkles, RefreshCw, MessageCircle, Clock, ArrowLeft, Award, Database, PlusCircle, Trash2, Key, Save, Layers, Table, Info, RotateCcw, Download, Copy, ChevronRight, ChevronLeft, ArrowUp, ArrowDown, ArrowUpDown,
  XCircle, ExternalLink, ChevronDown, Terminal, PlayCircle, ArrowRight,
  Layout as AlignLeft, Search
} from 'lucide-react';
import { courseData, resources, referenceMaterials, dictionaryTerms } from './data';
import { executeMockSql, resetDb, getDbSchema } from './services/mockSql';
import { UserProgress, Lesson, QuizQuestion } from './types';

// --- Constants ---
const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
  'CREATE', 'TABLE', 'DROP', 'ALTER', 'ADD', 'COLUMN', 'CONSTRAINT', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES',
  'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'CROSS', 'ON',
  'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'TOP', 'DISTINCT',
  'AND', 'OR', 'NOT', 'NULL', 'IS', 'IN', 'BETWEEN', 'LIKE', 'AS',
  'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'CAST', 'CONVERT', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END'
];

// --- Theme Context ---
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

// --- Animation Components & Hooks ---

// Scroll Reveal Component
const ScrollReveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className = "" }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect(); // Only animate once
      }
    }, { 
      threshold: 0.15, // Trigger when 15% visible
      rootMargin: "0px 0px -50px 0px" // Offset slightly for better effect
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={ref} 
      style={{ transitionDelay: `${delay}ms` }} 
      className={`reveal-hidden ${isVisible ? 'reveal-visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

// Page Transition Wrapper
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  return (
    <div key={location.pathname} className="animate-fade-in-up w-full">
      {children}
    </div>
  );
};

// Particle Background Effect
const ParticleBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      {/* Dynamic Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-900/20 rounded-full blur-[120px] animate-float opacity-60"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 dark:bg-cyan-900/20 rounded-full blur-[120px] animate-float opacity-60" style={{ animationDelay: '-3s' }}></div>
      <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-purple-500/10 dark:bg-purple-900/10 rounded-full blur-[100px] animate-pulse-glow opacity-40"></div>
      
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      
      {/* Floating Particles (CSS Only for performance) */}
      {[...Array(15)].map((_, i) => (
        <div 
          key={i}
          className="absolute rounded-full bg-slate-400/30 dark:bg-cyan-400/30 blur-[1px]"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 4 + 1}px`,
            height: `${Math.random() * 4 + 1}px`,
            animation: `float ${Math.random() * 10 + 10}s linear infinite`,
            animationDelay: `-${Math.random() * 10}s`,
            opacity: Math.random() * 0.5 + 0.1
          }}
        />
      ))}
    </div>
  );
};

// --- Helper Components ---

// SimpleMarkdown Component
const SimpleMarkdown: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;
  const elements: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|```[\s\S]*?```|\n)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      elements.push(content.substring(lastIndex, match.index));
    }

    const m = match[0];
    if (m.startsWith('```')) {
      const code = m.slice(3, -3).replace(/^sql\n/i, '');
      elements.push(
        <pre key={match.index} className="block bg-slate-900 dark:bg-slate-950 text-slate-100 p-3 rounded-xl my-2 overflow-x-auto text-xs font-mono border border-slate-200 dark:border-slate-800/60 shadow-inner" dir="ltr">
          <code>{code}</code>
        </pre>
      );
    } else if (m.startsWith('`')) {
        elements.push(<code key={match.index} className="bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded text-sm font-mono text-cyan-600 dark:text-cyan-400 font-bold border border-slate-200 dark:border-slate-700" dir="ltr">{m.slice(1, -1)}</code>);
    } else if (m.startsWith('**')) {
        elements.push(<strong key={match.index} className="font-bold text-slate-900 dark:text-cyan-100">{m.slice(2, -2)}</strong>);
    } else if (m === '\n') {
        elements.push(<br key={match.index} />);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    elements.push(content.substring(lastIndex));
  }

  return <>{elements}</>;
};

// Error Banner Component
const ErrorBanner: React.FC<{ error: string | null; onClose: () => void }> = ({ error, onClose }) => {
  if (!error) return null;
  
  return (
    <div className="fixed bottom-24 md:bottom-12 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-3xl animate-scale-in">
      <div className="bg-red-50/90 dark:bg-[#2d1a1a]/90 border border-red-500/30 rounded-2xl shadow-2xl p-4 flex items-start gap-4 backdrop-blur-xl cinematic-shadow">
        <div className="bg-red-500/20 dark:bg-red-900/30 p-2 rounded-full shrink-0 animate-pulse">
           <XCircle className="w-6 h-6 text-red-600 dark:text-red-500" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-red-800 dark:text-red-300 text-sm mb-1 font-mono tracking-wide">Execution Error</h4>
          <p className="font-mono text-sm text-red-700 dark:text-red-200 opacity-90 break-all leading-relaxed">{error}</p>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <button onClick={onClose} className="p-1.5 hover:bg-red-500/10 dark:hover:bg-white/10 rounded-lg transition-colors self-end text-red-600 dark:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ResultViewer Component
const ResultViewer: React.FC<{ result: any; hideStatusBar?: boolean; isLoading?: boolean; simpleMode?: boolean }> = ({ result, hideStatusBar = false, isLoading = false, simpleMode = false }) => {
  const [activeTab, setActiveTab] = useState<'results' | 'messages'>('results');
  const [sortConfig, setSortConfig] = useState<{ colIndex: number; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 100;

  useEffect(() => {
    if (result) {
        if (!result.error && result.columns && result.columns.length > 0) {
            setActiveTab('results');
        } else {
            setActiveTab('messages');
        }
        setCurrentPage(1);
        setSortConfig(null);
    }
  }, [result]);

  const sortedRows = useMemo(() => {
    if (!result || !result.rows) return [];
    let rows = [...result.rows];
    if (sortConfig) {
      rows.sort((a, b) => {
        const valA = a[sortConfig.colIndex];
        const valB = b[sortConfig.colIndex];
        if (valA === valB) return 0;
        if (valA === null) return 1;
        if (valB === null) return -1;
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
        }
        return sortConfig.direction === 'asc' ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
      });
    }
    return rows;
  }, [result, sortConfig]);

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedRows.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedRows, currentPage]);

  const totalPages = Math.ceil(sortedRows.length / rowsPerPage);

  const handleSort = (index: number) => {
    setSortConfig(current => {
      if (current?.colIndex === index) {
        return { colIndex: index, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { colIndex: index, direction: 'asc' };
    });
  };

  const handleCopy = () => {
    if (!result || !result.rows) return;
    const headers = result.columns.join('\t');
    const rows = result.rows.map((r: any[]) => r.map((c: any) => c === null ? 'NULL' : c).join('\t')).join('\n');
    navigator.clipboard.writeText(`${headers}\n${rows}`);
  };

  const handleDownloadCsv = () => {
    if (!result || !result.columns || !result.rows) return;
    const headers = result.columns.join(',');
    const rows = result.rows.map((r: any[]) => r.map((c: any) => c === null ? '' : `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'query_results.csv';
    link.click();
  };

  if (isLoading) {
    return (
      <div className="h-full w-full bg-white dark:bg-[#1e1e1e] p-4 font-mono overflow-hidden" dir="ltr">
        <div className="flex items-center gap-2 mb-4 animate-pulse">
           <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
           <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
        <div className="space-y-2 animate-pulse">
           <div className="h-8 w-full bg-slate-100 dark:bg-slate-800 rounded mb-4"></div>
           {[1,2,3,4,5,6].map(i => (
              <div key={i} className="flex gap-1" style={{ animationDelay: `${i * 100}ms` }}>
                 <div className="h-6 w-8 bg-slate-50 dark:bg-slate-800/50 rounded"></div>
                 <div className="h-6 flex-1 bg-slate-50 dark:bg-slate-800/50 rounded"></div>
                 <div className="h-6 flex-1 bg-slate-50 dark:bg-slate-800/50 rounded"></div>
                 <div className="h-6 flex-1 bg-slate-50 dark:bg-slate-800/50 rounded"></div>
              </div>
           ))}
        </div>
      </div>
    );
  }

  if (!result) return null;

  if (result.error) {
     return (
         <div className="h-full flex flex-col bg-white dark:bg-[#1e1e1e] p-4 animate-fade-in-up">
            <div className="text-red-600 dark:text-red-400 font-mono text-xs whitespace-pre-wrap">
                Msg 102, Level 15, State 1, Line 1
                <br />
                {result.error}
            </div>
         </div>
     );
  }

  const hasData = result.columns && result.columns.length > 0;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1e1e1e] font-sans text-xs">
      {!simpleMode && (
        <div className="flex items-center justify-between px-2 bg-slate-50 dark:bg-[#252526] border-b border-slate-200 dark:border-[#333333] select-none h-9 shrink-0">
           <div className="flex items-center h-full gap-1">
              <button 
                  onClick={() => hasData && setActiveTab('results')}
                  disabled={!hasData}
                  className={`h-full px-3 flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'results' ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-white dark:bg-[#1e1e1e]' : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#2a2d2e] disabled:opacity-50 disabled:cursor-not-allowed'}`}
              >
                 <Table className="w-3.5 h-3.5" />
                 <span className="font-bold">Results</span>
              </button>
              <button 
                  onClick={() => setActiveTab('messages')}
                  className={`h-full px-3 flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'messages' ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-white dark:bg-[#1e1e1e]' : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#2a2d2e]'}`}
              >
                 <MessageCircle className="w-3.5 h-3.5" />
                 <span className="font-bold">Messages</span>
              </button>
           </div>
           {activeTab === 'results' && hasData && (
              <div className="flex items-center gap-1">
                  <button onClick={handleDownloadCsv} className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-[#333]" title="Export CSV">
                      <Download className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={handleCopy} className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-[#333]" title="Copy to Clipboard">
                      <Copy className="w-3.5 h-3.5" />
                  </button>
              </div>
           )}
        </div>
      )}

      <div className="flex-1 overflow-hidden relative bg-white dark:bg-[#1e1e1e]">
         {(simpleMode || activeTab === 'results') && hasData ? (
             <div className="absolute inset-0 flex flex-col animate-fade-in-up">
                 <div className="flex-1 overflow-auto scrollbar-vscode relative">
                    <table className="min-w-full border-collapse text-left">
                        <thead className="sticky top-0 z-10 shadow-sm">
                            <tr>
                                {!simpleMode && (
                                   <th className="sticky left-0 z-20 w-10 bg-slate-100 dark:bg-[#252526] border-b border-r border-slate-200 dark:border-[#333] text-center text-slate-500 dark:text-slate-400 text-[10px] font-mono">#</th>
                                )}
                                {result.columns.map((col: string, idx: number) => (
                                    <th key={idx} className="bg-slate-50 dark:bg-[#252526] border-b border-slate-100 dark:border-[#333] px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap cursor-pointer hover:bg-slate-100 dark:hover:bg-[#2a2d2e] select-none group transition-colors" onClick={() => handleSort(idx)}>
                                        <div className="flex items-center gap-2">
                                            {simpleMode && <ArrowUpDown className="w-3 h-3 text-slate-400" />}
                                            {col}
                                            <span className="transition-opacity opacity-0 group-hover:opacity-50">
                                               {sortConfig?.colIndex === idx ? (sortConfig.direction === 'desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />) : null}
                                            </span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-[#1e1e1e]">
                           {paginatedRows.map((row: any[], rIdx: number) => (
                               <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-[#2a2d2e] transition-colors border-b border-slate-100 dark:border-[#2d2d2d] last:border-0 group">
                                   {!simpleMode && (
                                     <td className="sticky left-0 z-10 px-2 py-1 border-b border-r border-slate-200 dark:border-[#333] bg-slate-50 dark:bg-[#252526] group-hover:bg-slate-100 dark:group-hover:bg-[#2a2d2e] text-center text-slate-400 dark:text-slate-500 font-mono text-[10px] select-none transition-colors">
                                        {(currentPage - 1) * rowsPerPage + rIdx + 1}
                                     </td>
                                   )}
                                   {result.columns.map((_: any, cIdx: number) => {
                                      const val = row[cIdx];
                                      const isNum = typeof val === 'number';
                                      const isNull = val === null || val === undefined;
                                      return (
                                          <td key={cIdx} className={`px-4 py-3 text-slate-600 dark:text-[#d4d4d4] whitespace-nowrap overflow-hidden text-ellipsis max-w-xs ${isNum ? 'text-left font-mono' : 'text-left'}`}>
                                              {isNull ? <span className="text-[10px] text-slate-400 italic">NULL</span> : String(val)}
                                          </td>
                                      )
                                   })}
                               </tr>
                           ))}
                        </tbody>
                    </table>
                 </div>
                 {totalPages > 1 && (
                     <div className="border-t border-slate-200 dark:border-[#333] bg-slate-50 dark:bg-[#252526] px-2 py-1 flex items-center justify-end gap-2 shrink-0">
                         <span className="text-[10px] text-slate-500 dark:text-slate-400">Page {currentPage} of {totalPages}</span>
                         <div className="flex gap-1">
                             <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1 hover:bg-slate-200 dark:hover:bg-[#3e3e42] rounded disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
                             <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-1 hover:bg-slate-200 dark:hover:bg-[#3e3e42] rounded disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                         </div>
                     </div>
                 )}
             </div>
         ) : (
            <div className="p-6 font-mono text-sm text-slate-700 dark:text-slate-300 animate-scale-in">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                       {hasData ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Info className="w-5 h-5 text-blue-500" />}
                    </div>
                    <div className="space-y-1">
                       <p className="font-bold">{result.message || "Command executed successfully."}</p>
                       {hasData && <p className="text-slate-500 dark:text-slate-400">({result.rows.length} rows affected)</p>}
                       <p className="text-xs text-slate-400 mt-2">Completion time: {new Date().toLocaleTimeString()}</p>
                    </div>
                </div>
            </div>
         )}
      </div>

      {!hideStatusBar && !simpleMode && (
        <div className="bg-[#007acc] text-white px-3 py-0.5 text-[10px] flex items-center justify-between shrink-0 select-none">
            <div className="flex gap-4">
               {hasData ? (
                   <span>{result.rows.length} rows</span>
               ) : (
                   <span>Commands completed successfully.</span>
               )}
            </div>
            <div className="flex gap-4">
               <span>Ln 1, Col 1</span>
               <span>00:00:00</span>
            </div>
        </div>
      )}
    </div>
  );
};

// SqlEditor Component
interface Candidate {
  label: string;
  type: 'keyword' | 'table' | 'column';
}

const SuggestionIcon = ({ type }: { type: 'keyword' | 'table' | 'column' }) => {
  switch (type) {
    case 'table': return <Table className="w-3 h-3 text-blue-400" />;
    case 'column': return <Code className="w-3 h-3 text-green-400" />;
    case 'keyword': return <Key className="w-3 h-3 text-purple-400" />;
    default: return null;
  }
};

const SqlEditor: React.FC<{ code: string; setCode: (c: string) => void; onExecute: () => void; schema?: any }> = ({ code, setCode, onExecute, schema }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<{ list: Candidate[]; activeIndex: number; visible: boolean; top: number; left: number }>({
    list: [], activeIndex: 0, visible: false, top: 0, left: 0
  });

  const candidates = useMemo(() => {
    const list: Candidate[] = [];
    SQL_KEYWORDS.forEach(k => list.push({ label: k, type: 'keyword' }));
    if (schema && schema.tables) {
      schema.tables.forEach((t: any) => {
        if (!list.find(x => x.label === t.name && x.type === 'table')) {
            list.push({ label: t.name, type: 'table' });
        }
        t.columns.forEach((c: any) => {
            if (!list.find(x => x.label === c.name && x.type === 'column')) {
                list.push({ label: c.name, type: 'column' });
            }
        });
      });
    }
    return list;
  }, [schema]);

  const getCaretCoordinates = () => {
    if (!textareaRef.current || !mirrorRef.current) return { top: 0, left: 0 };
    const textarea = textareaRef.current;
    const mirror = mirrorRef.current;

    const style = window.getComputedStyle(textarea);
    mirror.style.width = style.width;
    mirror.style.font = style.font;
    mirror.style.padding = style.padding;
    mirror.style.border = style.border;
    mirror.style.lineHeight = style.lineHeight;
    mirror.style.whiteSpace = 'pre-wrap';
    mirror.style.wordWrap = 'break-word';
    
    const text = textarea.value.substring(0, textarea.selectionEnd);
    mirror.textContent = text;

    const span = document.createElement('span');
    span.textContent = '.';
    mirror.appendChild(span);

    return {
        top: span.offsetTop - textarea.scrollTop,
        left: span.offsetLeft - textarea.scrollLeft
    };
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCode(val);

    const caretPos = e.target.selectionEnd;
    const textBeforeCaret = val.substring(0, caretPos);
    // Split including dot for table.column logic
    const words = textBeforeCaret.split(/[\s,();.]+/);
    const currentWord = words[words.length - 1];

    if (currentWord.length > 0) {
        const matches = candidates.filter(c => c.label.toUpperCase().startsWith(currentWord.toUpperCase())).slice(0, 10);
        if (matches.length > 0) {
            const coords = getCaretCoordinates();
            const paddingTop = 16; 
            const paddingLeft = 16;
            
            setSuggestions({
                list: matches,
                activeIndex: 0,
                visible: true,
                top: coords.top + paddingTop + 20, 
                left: coords.left + paddingLeft
            });
            return;
        }
    }
    setSuggestions(prev => ({ ...prev, visible: false }));
  };

  const applySuggestion = (suggestion: Candidate) => {
      if (!textareaRef.current) return;
      const textarea = textareaRef.current;
      const caretPos = textarea.selectionEnd;
      const text = textarea.value;
      
      let start = caretPos - 1;
      // Include dot in delimiters so we replace only the part after the dot if needed
      while (start >= 0 && !/[\s,();.]/.test(text[start])) {
          start--;
      }
      start++;

      const newText = text.substring(0, start) + suggestion.label + text.substring(caretPos);
      setCode(newText);
      setSuggestions(prev => ({ ...prev, visible: false }));
      
      setTimeout(() => {
          textarea.focus();
          const newCaretPos = start + suggestion.label.length;
          textarea.setSelectionRange(newCaretPos, newCaretPos);
      }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (suggestions.visible) {
          if (e.key === 'ArrowDown') {
              e.preventDefault();
              setSuggestions(prev => {
                  const nextIndex = (prev.activeIndex + 1) % prev.list.length;
                  scrollToItem(nextIndex);
                  return { ...prev, activeIndex: nextIndex };
              });
          } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setSuggestions(prev => {
                  const nextIndex = (prev.activeIndex - 1 + prev.list.length) % prev.list.length;
                  scrollToItem(nextIndex);
                  return { ...prev, activeIndex: nextIndex };
              });
          } else if (e.key === 'Enter' || e.key === 'Tab') {
              e.preventDefault();
              applySuggestion(suggestions.list[suggestions.activeIndex]);
          } else if (e.key === 'Escape') {
              setSuggestions(prev => ({ ...prev, visible: false }));
          }
      } else {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              onExecute();
          }
      }
  };

  const scrollToItem = (index: number) => {
      if (listRef.current) {
          const item = listRef.current.children[index] as HTMLElement;
          if (item) {
              item.scrollIntoView({ block: 'nearest' });
          }
      }
  };

  return (
    <div className="h-full w-full relative">
        <textarea 
            ref={textareaRef}
            value={code}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onBlur={() => setTimeout(() => setSuggestions(prev => ({ ...prev, visible: false })), 200)}
            className="w-full h-full bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm p-4 resize-none focus:outline-none relative z-10 text-left"
            spellCheck={false}
            dir="ltr"
        />
        <div 
            ref={mirrorRef}
            className="absolute top-0 left-0 -z-10 opacity-0 pointer-events-none font-mono text-sm p-4 whitespace-pre-wrap break-words w-full h-full overflow-hidden"
            style={{ visibility: 'hidden' }}
        />
        {suggestions.visible && (
            <div 
                ref={listRef}
                className="absolute bg-[#252526] border border-[#454545] shadow-2xl rounded-md z-[100] overflow-y-auto flex flex-col min-w-[180px] max-w-[300px] max-h-[200px] animate-scale-in"
                style={{ top: suggestions.top, left: suggestions.left }}
            >
                {suggestions.list.map((item, idx) => (
                    <button 
                        key={idx}
                        className={`px-3 py-1.5 text-left text-xs font-mono flex items-center gap-2 w-full transition-colors shrink-0 ${idx === suggestions.activeIndex ? 'bg-[#04395e] text-white' : 'text-[#cccccc] hover:bg-[#2a2d2e]'}`}
                        onClick={() => applySuggestion(item)}
                        onMouseDown={(e) => e.preventDefault()} 
                    >
                       <span className="shrink-0 opacity-80"><SuggestionIcon type={item.type} /></span>
                       <span className="truncate">{item.label}</span>
                       <span className="ml-auto text-[9px] text-gray-500 uppercase">{item.type}</span>
                    </button>
                ))}
            </div>
        )}
    </div>
  )
}

// --- Pages ---

const HomePage = () => {
  const [showHeavyVisuals, setShowHeavyVisuals] = useState(false);

  useEffect(() => {
    // Defer loading of heavy visual components (3D card, voice note) 
    // to prioritize LCP (Largest Contentful Paint) of the main text.
    const timer = setTimeout(() => {
      setShowHeavyVisuals(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden font-sans text-slate-900 dark:text-slate-100">
        
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-20">
          {/* Hero Section */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
            
            {/* Text Content - Renders Immediately */}
            <div className="space-y-8 text-center lg:text-right relative z-10 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100/50 dark:bg-cyan-900/30 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold mb-2 backdrop-blur-sm animate-scale-in delay-100">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>منصة تعليمية ذكية 100%</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900 dark:text-white reveal-hidden reveal-visible transition-all duration-1000">
               تعلم قواعد البيانات
              </h1>
              <h1 className="text-5xl lg:text-4.5xl font-black leading-tight tracking-tight mb-20 gradient-text animate-pulse-glow">
                 من الصفر الى الاحتراف
              </h1>
              
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto lg:mx-0 animate-fade-in-up delay-200">
                ابدأ رحلتك في تعلم SQL Server وادخل سوق العمل بثقة. منصة "SQL Master" هي محطتك الأولى للتعلم العملي والتطبيقي، مع محاكي كود فوري.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 animate-fade-in-up delay-300">
                <Link 
                  to="/learn" 
                  className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl font-bold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-1 transition-all overflow-hidden btn-interaction"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    ابدأ التعلم الآن <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                
                <Link 
                  to="/playground" 
                  className="px-8 py-4 bg-white/80 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-slate-500 rounded-2xl font-bold backdrop-blur-sm transition-all hover:-translate-y-1 flex items-center gap-2 btn-interaction"
                >
                  <Terminal className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  جرب المحاكي
                </Link>
              </div>

            </div>

            {/* Visual Content (3D Illustration Placeholder) - Deferred */}
            {showHeavyVisuals && (
              <div className="relative z-10 hidden lg:block animate-float delay-500">
                <div className="relative w-full aspect-square max-w-[600px] mx-auto [perspective:1000px]">
                   {/* Abstract decorative elements */}
                   <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse-glow"></div>
                   
                   {/* Main Card */}
                   <div className="absolute top-1/4.5 right-1/5.5 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] glass-morphism rounded-3xl shadow-2xl flex flex-col overflow-hidden [transform:rotateY(12deg)_rotateX(6deg)] hover:[transform:rotateY(0deg)_rotateX(0deg)] transition-transform duration-700">
                      <div className="h-10 bg-slate-100/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 flex items-center px-4 gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                      </div>
                      <div className="flex-1 p-6 font-mono text-sm space-y-2 text-slate-600 dark:text-slate-300" dir="ltr">
                        <div className="flex gap-2"><span className="text-purple-600 dark:text-purple-400">SELECT</span> <span className="text-cyan-600 dark:text-cyan-400">*</span> <span className="text-purple-600 dark:text-purple-400">FROM</span> <span className="text-yellow-600 dark:text-yellow-400">Future</span></div>
                        <div className="flex gap-2"><span className="text-purple-600 dark:text-purple-400">WHERE</span> <span className="text-blue-600 dark:text-blue-400">Skill</span> <span className="text-slate-500 dark:text-slate-400">=</span> <span className="text-green-600 dark:text-green-400">'SQL_Master'</span>;</div>
                        <div className="mt-4 pt-4 border-t border-dashed border-slate-300 dark:border-slate-700/50 text-xs text-slate-500">
                           <span className="text-green-600 dark:text-green-500">✔ 1 row affected</span><br/>
                           Completion time: 0.001s
                        </div>
                        {/* Simulated Chart */}
                        <div className="mt-6 flex items-end gap-2 h-24 pt-4">
                           <div className="w-8 bg-slate-300 dark:bg-slate-700/50 rounded-t h-[40%] transition-all duration-1000 hover:h-[45%]"></div>
                           <div className="w-8 bg-slate-300 dark:bg-slate-700/50 rounded-t h-[60%] transition-all duration-1000 hover:h-[65%]"></div>
                           <div className="w-8 bg-cyan-500/50 rounded-t h-[85%] relative transition-all duration-1000 hover:h-[90%] group">
                              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">You</div>
                           </div>
                           <div className="w-8 bg-slate-300 dark:bg-slate-700/50 rounded-t h-[50%] transition-all duration-1000 hover:h-[55%]"></div>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            )}
          </div>

          {/* Developer Note - Deferred */}
          {showHeavyVisuals && (
            <div className="mb-24">
            </div>
          )}

          {/* Features Section */}
          <ScrollReveal>
            <div className="text-center mb-16 space-y-4">
               <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">لماذا تختار <span className="gradient-text">SQL Master</span></h2>
               <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">صممنا كل جزء في المنصة ليخدم هدفاً واحداً: جعل تعلم قواعد البيانات أسهل وأمتع.</p>
            </div>
          </ScrollReveal>

          <section className="grid md:grid-cols-3 gap-8">
             {[
               { 
                 icon: GraduationCap, 
                 color: "text-orange-500 dark:text-orange-400", 
                 bg: "bg-orange-500/10",
                 title: "محتوى أكاديمي متخصص", 
                 desc: "شرح شامل يغطي كافة المفاهيم الأساسية والمتقدمة التي تحتاجها في رحلة تعلمك." 
               },
               { 
                 icon: Code, 
                 color: "text-blue-500 dark:text-blue-400", 
                 bg: "bg-blue-500/10",
                 title: "بيئة تطبيق متكاملة", 
                 desc: "لا حاجة لتثبيت برامج معقدة. اكتب كود SQL ونفذه مباشرة في المتصفح مع محاكي يحاكي بيئة العمل الحقيقية." 
               },
               { 
                 icon: Sparkles, 
                 color: "text-purple-500 dark:text-purple-400", 
                 bg: "bg-purple-500/10",
                 title: "تطبيق عملي فوري", 
                 desc: "تعلم من خلال الممارسة المباشرة مع أمثلة حية وتمارين تفاعلية تعزز فهمك للمادة." 
               }
             ].map((feature, idx) => (
               <ScrollReveal key={idx} delay={idx * 150}>
                 <div className="group relative glass-morphism p-8 rounded-3xl hover-card">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none"></div>
                    <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                       <feature.icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">{feature.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                       {feature.desc}
                    </p>
                 </div>
               </ScrollReveal>
             ))}
          </section>
        </div>
      </div>
    </PageTransition>
  );
};

const LearnPage = () => {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-12 pb-10 px-6 pt-10">
         <ScrollReveal>
           <div className="text-center space-y-4">
              <h1 className="text-4xl font-black text-slate-900 dark:text-white">مسار التعلم</h1>
              <p className="text-slate-600 dark:text-slate-400">دروس مرتبة بتسلسل منطقي لتأخذك من الصفر الى مستوى متقدم.</p>
           </div>
         </ScrollReveal>

         <div className="space-y-12">
            {courseData.map((module, mIdx) => (
               <div key={module.id} className="space-y-6">
                  <ScrollReveal delay={mIdx * 100}>
                    <div className="flex items-center gap-4">
                       <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent"></div>
                       <h2 className="text-lg font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider bg-white/50 dark:bg-slate-900/50 backdrop-blur px-6 py-1 rounded-full border border-slate-200 dark:border-slate-800">{module.title}</h2>
                       <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent"></div>
                    </div>
                  </ScrollReveal>
                  <div className="grid gap-4">
                     {module.lessons.map((lesson, lIdx) => (
                        <ScrollReveal key={lesson.id} delay={lIdx * 100}>
                          <Link to={`/learn/${lesson.id}`} className="group glass-morphism p-6 rounded-2xl hover-card flex items-center gap-6 relative overflow-hidden">
                             {/* Background Glow */}
                             <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-colors"></div>
                             
                             <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 group-hover:bg-cyan-100/50 dark:group-hover:bg-cyan-900/20 transition-colors shrink-0 border border-slate-200 dark:border-slate-700">
                                <BookOpen className="w-8 h-8" />
                             </div>
                             <div className="flex-1 relative z-10">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{lesson.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">{lesson.description}</p>
                                <div className="flex items-center gap-4 mt-3">
                                   <div className="flex items-center gap-1 text-xs font-bold text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                                      <Clock className="w-3.5 h-3.5" />
                                      {lesson.durationMinutes} دقيقة
                                   </div>
                                   <div className="flex items-center gap-1 text-xs font-bold text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                                      <HelpCircle className="w-3.5 h-3.5" />
                                      {lesson.quiz.length} أسئلة
                                   </div>
                                </div>
                             </div>
                             <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-cyan-600 group-hover:border-cyan-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
                                <ArrowLeft className="w-5 h-5" />
                             </div>
                          </Link>
                        </ScrollReveal>
                     ))}
                  </div>
               </div>
            ))}
         </div>
      </div>
    </PageTransition>
  );
};

const LessonPage = () => {
  const { lessonId } = useParams<{lessonId: string}>();
  const [activeTab, setActiveTab] = useState<'content' | 'quiz'>('content');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Flatten course data to find lesson and neighbors
  const { lesson, prevLesson, nextLesson } = useMemo(() => {
    const allLessons = courseData.flatMap(m => m.lessons);
    const index = allLessons.findIndex(l => l.id === lessonId);
    
    if (index === -1) return { lesson: null, prevLesson: null, nextLesson: null };

    return {
      lesson: allLessons[index],
      prevLesson: index > 0 ? allLessons[index - 1] : null,
      nextLesson: index < allLessons.length - 1 ? allLessons[index + 1] : null
    };
  }, [lessonId]);

  // Scroll to top when lesson changes
  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveTab('content');
    setQuizAnswers({});
    setShowResults(false);
  }, [lessonId]);

  // Update progress bar
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (currentScroll / totalHeight) * 100));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Init
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!lesson) return <div className="p-8 text-center text-red-500">Lesson not found</div>;

  const handleOptionSelect = (qId: number, optionIdx: number) => {
    if (showResults) return;
    setQuizAnswers(prev => ({...prev, [qId]: optionIdx}));
  };

  const calculateScore = () => {
    let score = 0;
    lesson.quiz.forEach(q => {
      if (quizAnswers[q.id] === q.correctAnswer) score++;
    });
    return score;
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto pb-20 relative px-6 pt-6">
         {/* Progress Bar (Visible only on content tab) */}
         <div className={`fixed top-16 left-0 w-full h-1.5 bg-slate-200 dark:bg-slate-800 z-40 transition-opacity duration-300 ${activeTab === 'content' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div 
               className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-100 ease-out shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
               style={{ width: `${scrollProgress}%` }}
            />
         </div>

         <div className="flex items-center justify-between mb-6 animate-fade-in-up">
            <Link to="/learn" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 font-bold text-sm transition-colors">
                <ArrowRight className="w-4 h-4" /> العودة للدروس
            </Link>
         </div>

         <div className="glass-morphism rounded-3xl overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="p-8 border-b border-slate-200/50 dark:border-white/5 bg-white/50 dark:bg-white/5 backdrop-blur-md">
               <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 leading-tight">{lesson.title}</h1>
               <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">{lesson.description}</p>
               
               <div className="flex gap-3 mt-8">
                  <button 
                    onClick={() => setActiveTab('content')}
                    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 btn-interaction ${activeTab === 'content' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'}`}
                  >
                     المحتوى التعليمي
                  </button>
                  <button 
                    onClick={() => { setActiveTab('quiz'); window.scrollTo(0, 0); }}
                    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 btn-interaction ${activeTab === 'quiz' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'}`}
                  >
                     الاختبار القصير
                     <span className="bg-slate-300 dark:bg-slate-900/50 px-2 py-0.5 rounded-md text-[10px] border border-black/5 dark:border-white/10">{lesson.quiz.length}</span>
                  </button>
               </div>
            </div>

            {/* Content Tab */}
            {activeTab === 'content' && (
               <div className="p-8 space-y-12">
                  {lesson.sections.map((section, idx) => (
                     <ScrollReveal key={idx} delay={idx * 100}>
                       <div className="space-y-6">
                          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                             <span className="w-8 h-8 rounded-lg bg-cyan-100/50 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-sm font-black border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]">{idx + 1}</span>
                             {section.title}
                          </h2>
                          <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-loose">
                             <SimpleMarkdown content={section.content} />
                          </div>
                          {section.codeExample && (
                             <div className="mt-4 bg-[#0d1117] rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700/50 group" dir="ltr">
                                <div className="bg-slate-800/50 px-4 py-2 text-xs text-slate-400 font-mono border-b border-slate-700/50 flex items-center justify-between">
                                   <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div><div className="w-2 h-2 rounded-full bg-yellow-500"></div><div className="w-2 h-2 rounded-full bg-green-500"></div> SQL Example</span>
                                   <button className="hover:text-white transition-colors opacity-0 group-hover:opacity-100"><Copy className="w-3 h-3" /></button>
                                </div>
                                <pre className="p-6 overflow-x-auto text-sm font-mono text-cyan-100 bg-transparent">
                                   <code>{section.codeExample}</code>
                                </pre>
                             </div>
                          )}
                          {section.image && (
                             <img src={section.image} alt={section.title} className="rounded-xl shadow-lg border border-slate-200 dark:border-slate-700/50 w-full hover:scale-[1.01] transition-transform duration-500" />
                          )}
                       </div>
                     </ScrollReveal>
                  ))}
                  
                  <div className="pt-8 border-t border-slate-200/50 dark:border-white/5 flex flex-col sm:flex-row items-center justify-end gap-4">
                     <button 
                       onClick={() => { setActiveTab('quiz'); window.scrollTo(0, 0); }}
                       className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20 btn-interaction"
                     >
                        انتقل للاختبار <ArrowLeft className="w-5 h-5" />
                     </button>
                  </div>
               </div>
            )}

            {/* Quiz Tab */}
            {activeTab === 'quiz' && (
               <div className="p-8 space-y-8">
                  {showResults && (
                     <div className={`p-6 rounded-2xl mb-8 flex flex-col md:flex-row items-center gap-4 animate-scale-in ${calculateScore() === lesson.quiz.length ? 'bg-green-100 dark:bg-green-500/10 border border-green-500/30 text-green-800 dark:text-green-300' : 'bg-orange-100 dark:bg-orange-500/10 border border-orange-500/30 text-orange-800 dark:text-orange-300'}`}>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                           <div className="p-3 bg-white dark:bg-slate-900/50 rounded-full shadow-sm shrink-0 backdrop-blur-sm">
                              {calculateScore() === lesson.quiz.length ? <Award className="w-8 h-8 text-green-600 dark:text-green-500" /> : <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-500" />}
                           </div>
                           <div className="flex-1">
                              <h3 className="font-bold text-xl">نتيجتك: {calculateScore()} من {lesson.quiz.length}</h3>
                              <p className="text-sm opacity-90">{calculateScore() === lesson.quiz.length ? 'ممتاز! لقد استوعبت الدرس بالكامل.' : 'حاول مراجعة الدرس مرة أخرى لتحسين نتيجتك.'}</p>
                           </div>
                        </div>
                        <div className="flex gap-2 mr-auto mt-4 md:mt-0 w-full md:w-auto justify-end">
                           <button 
                              onClick={() => { setShowResults(false); setQuizAnswers({}); }}
                              className="px-4 py-2 bg-white/80 dark:bg-slate-900/50 rounded-lg font-bold text-sm shadow-sm hover:bg-white dark:hover:bg-slate-900 transition-colors border border-black/5 dark:border-white/5"
                           >
                              إعادة الاختبار
                           </button>
                           {nextLesson && (
                              <Link 
                                 to={`/learn/${nextLesson.id}`}
                                 className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg font-bold text-sm shadow-sm transition-colors flex items-center gap-2"
                              >
                                 الدرس التالي <ChevronLeft className="w-4 h-4" />
                              </Link>
                           )}
                        </div>
                     </div>
                  )}

                  <div className="space-y-6">
                     {lesson.quiz.map((q, idx) => (
                        <ScrollReveal key={q.id} delay={idx * 50}>
                          <div className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-cyan-500/30 dark:hover:border-white/10 transition-colors">
                             <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6 flex gap-3">
                                <span className="text-cyan-600 dark:text-cyan-500">{idx + 1}.</span> {q.question}
                             </h3>
                             <div className="space-y-3">
                                {q.options.map((opt, optIdx) => {
                                   const isSelected = quizAnswers[q.id] === optIdx;
                                   const isCorrect = q.correctAnswer === optIdx;
                                   const showCorrect = showResults && isCorrect;
                                   const showWrong = showResults && isSelected && !isCorrect;

                                   return (
                                      <button
                                         key={optIdx}
                                         onClick={() => handleOptionSelect(q.id, optIdx)}
                                         disabled={showResults}
                                         className={`w-full text-right p-4 rounded-xl border font-medium transition-all duration-300 flex items-center justify-between ${
                                            showCorrect ? 'border-green-500/50 bg-green-100 dark:bg-green-500/10 text-green-800 dark:text-green-300' :
                                            showWrong ? 'border-red-500/50 bg-red-100 dark:bg-red-500/10 text-red-800 dark:text-red-300' :
                                            isSelected ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.1)]' :
                                            'border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
                                         }`}
                                      >
                                         <span>{opt}</span>
                                         {showCorrect && <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 animate-scale-in" />}
                                         {showWrong && <XCircle className="w-5 h-5 text-red-600 dark:text-red-500 animate-scale-in" />}
                                         {!showResults && isSelected && <div className="w-4 h-4 bg-cyan-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]" />}
                                      </button>
                                   );
                                })}
                             </div>
                             {showResults && q.explanation && (
                                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded-xl text-sm flex gap-2 border border-blue-200 dark:border-blue-500/20 animate-fade-in-up">
                                   <Info className="w-5 h-5 shrink-0" />
                                   <p>{q.explanation}</p>
                                </div>
                             )}
                          </div>
                        </ScrollReveal>
                     ))}
                  </div>

                  {!showResults && (
                     <button 
                        onClick={() => setShowResults(true)}
                        disabled={Object.keys(quizAnswers).length < lesson.quiz.length}
                        className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-700 dark:disabled:to-slate-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-cyan-900/20 disabled:shadow-none transition-all btn-interaction disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        عرض النتائج
                     </button>
                  )}
               </div>
            )}

            {/* Navigation Footer */}
            <div className="p-6 md:p-8 border-t border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                    {prevLesson ? (
                        <Link 
                            to={`/learn/${prevLesson.id}`}
                            className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-cyan-500 dark:hover:border-cyan-500 group transition-all duration-300 flex-1 sm:max-w-xs"
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/30 text-slate-500 dark:text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                <ChevronRight className="w-5 h-5" />
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-0.5">الدرس السابق</div>
                                <div className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{prevLesson.title}</div>
                            </div>
                        </Link>
                    ) : <div className="flex-1 sm:max-w-xs" />}

                    {nextLesson ? (
                        <Link 
                            to={`/learn/${nextLesson.id}`}
                            className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-cyan-500 dark:hover:border-cyan-500 group transition-all duration-300 flex-1 sm:max-w-xs"
                        >
                            <div className="text-left flex-1">
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-0.5">الدرس التالي</div>
                                <div className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{nextLesson.title}</div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/30 text-slate-500 dark:text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                <ChevronLeft className="w-5 h-5" />
                            </div>
                        </Link>
                    ) : (
                        <Link 
                            to="/learn"
                            className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 group transition-all duration-300 flex-1 sm:max-w-xs"
                        >
                            <div className="text-left flex-1">
                                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mb-0.5">أكملت المسار</div>
                                <div className="text-sm font-bold text-emerald-800 dark:text-emerald-300">العودة للقائمة</div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-800/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                        </Link>
                    )}
                </div>
            </div>
         </div>
      </div>
    </PageTransition>
  );
};

const AboutPage = () => {
  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto space-y-8 p-6 pb-20 pt-10">
         <ScrollReveal>
           <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-cyan-500/30 mb-6 animate-float">
                 SM
              </div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white">عن SQL Master</h1>
           </div>
         </ScrollReveal>
         
         <ScrollReveal delay={200}>
           <div className="glass-morphism p-8 rounded-3xl space-y-6 text-lg leading-relaxed text-slate-700 dark:text-slate-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
              <p>
                نحن منصة تعليمية تم تصميمها خصيصًا للمساعدة على تعلّم أساسيات قواعد البيانات Microsoft SQL Server
                
                 بأسلوب بسيط وواضح يبدأ معك من الصفر.
              </p>
              <p>
                 نهدف إلى تقديم محتوى عملي يناسب المتعلم الذي يبدأ رحلته الأولى في عالم قواعد البيانات، من خلال شرح مفاهيم الدرس خطوة بخطوة، ثم تقديم أمثلة حقيقية، وأسئلة اختبارية تساعدك على تثبيت الفهم واكتساب المهارة بثقة.
              </p>
              <p>
                 نحن نؤمن بأن تعلّم قواعد البيانات لا يحتاج تعقيد، بل يحتاج أسلوب مبسط، أمثلة واضحة، وتجربة تفاعلية تجعل الطالب قادرًا على كتابة الأكواد بنفسه وتجربة النتائج داخل الموقع. لذلك صُمِّم هذا الموقع ليكون تجربة تعليمية كاملة تجمع بين الفهم النظري والتطبيق العملي.
              </p>

              <div className="pt-4 border-t border-slate-200 dark:border-white/5 flex items-center gap-2">
                 <span className="text-sm text-slate-500">قام بتطويره:</span>
                 <span className="font-bold text-cyan-600 dark:text-cyan-400">المطور حسين محمد</span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white pt-4">لمن صُمّم هذا الموقع؟</h3>
              <ul className="space-y-3">
                 {[
                   " المبتدئين ",
                   "أي شخص يريد فهم قواعد البيانات من البداية",
                   "من يرغب بتجربة تنفيذ أكواد SQL بشكل تفاعلي وسهل"
                 ].map((item, idx) => (
                   <li key={idx} className="flex items-center gap-3">
                     <div className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20">
                        <CheckCircle className="w-3.5 h-3.5" />
                     </div>
                     <span>{item}</span>
                   </li>
                 ))}
              </ul>
           </div>
         </ScrollReveal>
      </div>
    </PageTransition>
  );
};

const ResourcesPage = () => {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto p-6 pb-20 pt-10">
         <ScrollReveal>
           <div className="text-center space-y-4 mb-12">
              <h1 className="text-4xl font-black text-slate-900 dark:text-white">المصادر التعليمية</h1>
              <p className="text-slate-600 dark:text-slate-400">مجموعة مختارة من المصادر والمحاضرات لمساعدتك في رحلة التعلم.</p>
           </div>
         </ScrollReveal>

         <div className="grid md:grid-cols-2 gap-6">
            {resources.map((res, idx) => (
               <ScrollReveal key={idx} delay={idx * 100}>
                 <a 
                    href={res.link}
                    target={res.type === 'Internal' ? '_self' : '_blank'}
                    rel="noreferrer"
                    className="group glass-morphism p-6 rounded-2xl hover-card flex items-start gap-4 transition-all duration-300"
                 >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${res.type === 'YouTube' ? 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-500 group-hover:bg-red-200 dark:group-hover:bg-red-500/20' : 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-500 group-hover:bg-blue-200 dark:group-hover:bg-blue-500/20'}`}>
                       {res.type === 'YouTube' ? <PlayCircle className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                    </div>
                    <div>
                       <h3 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{res.title}</h3>
                       <div className="flex items-center gap-2 text-xs font-bold">
                          <span className={`px-2 py-0.5 rounded-full border ${res.type === 'YouTube' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20' : 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20'}`}>
                             {res.type}
                          </span>
                          {res.type !== 'Internal' && <ExternalLink className="w-3 h-3 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-white transition-colors" />}
                       </div>
                    </div>
                 </a>
               </ScrollReveal>
            ))}
         </div>
      </div>
    </PageTransition>
  );
};

const ReferencePage = () => {
  const { refId } = useParams<{refId: string}>();
  const material = referenceMaterials.find(r => r.id === refId);

  if (!material) return <div className="p-8 text-center text-red-500">Material not found</div>;

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto p-6 pb-20 pt-10">
         <Link to="/resources" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 mb-6 font-bold text-sm transition-colors animate-fade-in-up">
            <ArrowRight className="w-4 h-4" /> العودة للمصادر
         </Link>

         <div className="glass-morphism rounded-3xl overflow-hidden animate-scale-in delay-100">
            <div className="p-8 border-b border-slate-200/50 dark:border-white/5 bg-white/50 dark:bg-white/5">
               <h1 className="text-3xl font-black text-slate-900 dark:text-white">{material.title}</h1>
            </div>
            
            <div className="p-8 space-y-10">
               {material.sections.map((section, idx) => (
                  <ScrollReveal key={idx} delay={idx * 100}>
                    <div className="space-y-4">
                       <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 flex items-center justify-center text-sm font-black border border-purple-200 dark:border-purple-500/30">{idx + 1}</span>
                          {section.heading}
                       </h2>
                       <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-loose">
                          <SimpleMarkdown content={section.content} />
                       </div>
                       {section.code && (
                          <div className="mt-4 bg-[#0d1117] rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700/50" dir="ltr">
                             <div className="bg-slate-800/50 px-4 py-2 text-xs text-slate-400 font-mono border-b border-slate-700/50">
                                SQL Query
                             </div>
                             <pre className="p-4 overflow-x-auto text-sm font-mono text-cyan-100 bg-transparent">
                                <code>{section.code}</code>
                             </pre>
                          </div>
                       )}

                       {section.table && (
                          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-lg">
                             <table className="w-full text-sm text-left">
                                <thead className="bg-slate-100 dark:bg-slate-800/80">
                                   <tr>
                                      {section.table.headers.map((h, i) => (
                                         <th key={i} className="px-4 py-3 font-bold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">{h}</th>
                                      ))}
                                   </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 bg-white dark:bg-slate-900/30">
                                   {section.table.rows.map((row, rIdx) => (
                                      <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                         {row.map((cell, cIdx) => (
                                            <td key={cIdx} className="px-4 py-3 text-slate-600 dark:text-slate-300 font-mono">{cell}</td>
                                         ))}
                                      </tr>
                                   ))}
                                </tbody>
                             </table>
                          </div>
                       )}
                    </div>
                  </ScrollReveal>
               ))}
            </div>
         </div>
      </div>
    </PageTransition>
  );
};


const PlaygroundPage = () => {
  const { state } = useLocation();
  const [code, setCode] = useState(() => {
    if (state && state.initialSql) {
      return state.initialSql;
    }
    return `-- مرحبا بك في المحاكي!
-- 1. عرض الطلاب من قاعدة البيانات الجامعية (UniversityDB)
SELECT * FROM STUDENTS;

-- 2. للانتقال لقاعدة بيانات المتجر (ShopDB)
-- USE ShopDB;
-- SELECT * FROM PRODUCTS;

-- 3. للانتقال لقاعدة بيانات المكتبة (LibraryDB)
-- USE LibraryDB;
-- SELECT * FROM BOOKS;`;
  });

  const [showWelcome, setShowWelcome] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (state && state.initialSql) {
      setCode(state.initialSql);
    }
  }, [state]);

  const [result, setResult] = useState<any>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  
  // Schema now includes availableDbs
  const [schema, setSchema] = useState<any>({ tables: [], currentDb: '', availableDbs: [] });
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});
  
  // State for mobile layout orientation
  const [mobileView, setMobileView] = useState<'editor' | 'results'>('editor');

  const [dbDropdownOpen, setDbDropdownOpen] = useState(false);

  const fetchSchema = () => {
    const dbSchema = getDbSchema();
    setSchema(dbSchema);
    // Auto-expand all tables initially for better visibility
    const initialExpanded = dbSchema.tables.reduce((acc: any, t: any) => ({ ...acc, [t.name]: false }), {});
    // Keep previously expanded state if exists, else expand first table
    if (Object.keys(expandedTables).length === 0 && dbSchema.tables.length > 0) {
        initialExpanded[dbSchema.tables[0].name] = true;
    }
    setExpandedTables(prev => ({ ...initialExpanded, ...prev }));
  };

  useEffect(() => {
    const timer = setTimeout(fetchSchema, 10);
    return () => clearTimeout(timer);
  }, []);

  const toggleTable = (tableName: string) => {
    setExpandedTables(prev => ({ ...prev, [tableName]: !prev[tableName] }));
  };

  const handleExecute = () => {
    setIsExecuting(true);
    setErrorBanner(null);
    setResult(null);
    // Switch to results view on mobile automatically when running
    if (window.innerWidth < 1024) {
      setMobileView('results');
    }
    
    setTimeout(() => {
        const res = executeMockSql(code);
        setResult(res);
        if(res.error) setErrorBanner(res.error);
        setIsExecuting(false);
        fetchSchema(); // Refresh schema in case of USE DB or DDL
    }, 50);
  };

  const handleSwitchDb = (dbName: string) => {
    const res = executeMockSql(`USE ${dbName};`);
    setResult(res); // Optional: show "Changed database context" message in results
    fetchSchema();
    setDbDropdownOpen(false);
  };

  const handleReset = () => {
    if(window.confirm("هل أنت متأكد من إعادة ضبط جميع قواعد البيانات؟")) {
      const res = resetDb();
      setResult(res);
      setCode("-- System Reset\nUSE UniversityDB;\nSELECT * FROM STUDENTS;");
      fetchSchema();
    }
  };

  const handleCreateTableTemplate = () => {
    setCode(`-- إنشاء جدول جديد
CREATE TABLE NEW_TABLE (
    ID INT PRIMARY KEY IDENTITY(1,1),
    NAME VARCHAR(50) NOT NULL,
    CREATED_AT DATETIME DEFAULT GETDATE()
);

-- عرض الجدول الجديد
SELECT * FROM NEW_TABLE;`);
    // On mobile, switch to editor to see the inserted code
    if (window.innerWidth < 1024) {
      setMobileView('editor');
      setSidebarOpen(false);
    }
  };

  const handleFormat = () => {
    let formatted = code;
    const keywords = [
        'SELECT', 'DISTINCT', 'TOP', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 
        'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'CROSS JOIN', 'JOIN', 'ON', 
        'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'DELETE', 'CREATE TABLE', 'DROP TABLE', 'ALTER TABLE',
        'ADD', 'CONSTRAINT', 'PRIMARY KEY', 'FOREIGN KEY', 'REFERENCES', 
        'AND', 'OR', 'IN', 'BETWEEN', 'LIKE', 'IS', 'NULL', 'NOT', 'AS', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN',
        'USE', 'DATABASE'
    ];

    keywords.sort((a, b) => b.length - a.length).forEach(kw => {
        const regex = new RegExp(`\\b${kw.replace(/ /g, '\\s+')}\\b`, 'gi');
        formatted = formatted.replace(regex, kw);
    });

    const blockKeywords = [
        'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 
        'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 
        'CREATE TABLE', 'DROP TABLE', 'ALTER TABLE', 'USE'
    ];

    blockKeywords.forEach(kw => {
        const regex = new RegExp(`(?<!^)\\s+(${kw})\\b`, 'g');
        formatted = formatted.replace(regex, `\n$1`);
    });
    
    formatted = formatted.replace(/\s*;\s*/g, ';\n');
    setCode(formatted.trim());
  };

  const handleDownloadJSON = () => {
    if (!result || !result.rows) return;
    const jsonString = JSON.stringify(result.rows.map((row: any[]) => {
      const obj: any = {};
      result.columns.forEach((col: string, i: number) => obj[col] = row[i]);
      return obj;
    }), null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'query_results.json';
    link.click();
  };

  const handleDownloadCSV = () => {
    if (!result || !result.rows) return;
    const headers = result.columns.join(',');
    const rows = result.rows.map((r: any[]) => r.map((c: any) => c === null ? '' : `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'query_results.csv';
    link.click();
  };

  return (
    <PageTransition>
      {/* Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-700 animate-scale-in relative max-h-[85vh] overflow-y-auto">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
                <div className="p-6 md:p-8 text-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 text-cyan-600 dark:text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-pulse">
                        <Database className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-3 md:mb-4">بيئة العمل المتكاملة</h2>
                    <div className="space-y-4 text-slate-600 dark:text-slate-300 text-sm leading-loose">
                        <p>
                            أهلاً بك في محاكي SQL Master. لقد قمنا بتجهيز <strong>3 قواعد بيانات</strong> متكاملة لتتدرب عليها:
                        </p>
                        <div className="grid grid-cols-1 gap-2 text-xs text-left bg-slate-50 dark:bg-black/20 p-3 rounded-xl border border-slate-200 dark:border-white/5">
                           <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> <span className="font-bold text-slate-700 dark:text-slate-200">UniversityDB</span>: (الافتراضية) للطلاب والدورات.</div>
                           <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> <span className="font-bold text-slate-700 dark:text-slate-200">ShopDB</span>: للمنتجات والطلبات.</div>
                           <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500"></div> <span className="font-bold text-slate-700 dark:text-slate-200">LibraryDB</span>: للكتب والإعارات.</div>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl p-3 text-amber-800 dark:text-amber-200 text-xs font-bold flex gap-2 items-start text-right">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <p>
                                يمكنك التنقل بين قواعد البيانات باستخدام القائمة الجانبية أو بكتابة الأمر <span className="font-mono bg-white dark:bg-black/20 px-1 py-0.5 rounded mx-1 dir-ltr"> USE أي استخدام قاعدة البيانات </span> <br/> <br/>

                                <p> ملاحظة :- لا يمكنك انشاء قاعدة بيانات من اختيارك وبالطريقة التي تريدها بسبب سياسة عمل هذا المحاكي لذلك قمنا بأعداد ثلال قواعد بيانات يمكنك من خلالها التدرب على الاوامر </p>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[#252526] border-t border-slate-200 dark:border-[#333] flex justify-center sticky bottom-0">
                    <button 
                        onClick={() => setShowWelcome(false)}
                        className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95"
                    >
                        ابدأ التدريب 🚀
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Main Container - Adjusted height for mobile viewports */}
      <div className="flex h-[calc(100dvh-64px)] lg:h-[calc(100vh-64px)] overflow-hidden font-sans text-right relative" dir="rtl">
         
         {/* Mobile Sidebar Backdrop */}
         {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity" 
              onClick={() => setSidebarOpen(false)}
            />
         )}

         {/* Sidebar / Schema Explorer */}
         <div className={`
            fixed inset-y-0 right-0 z-50 w-[85vw] max-w-[320px] bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700/50 flex flex-col shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out
            lg:static lg:w-64 lg:translate-x-0 
            ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
         `}>
            {/* Database Switcher Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 shrink-0 bg-white dark:bg-[#1e1e1e]">
               <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold">
                     <Layers className="w-4 h-4 text-cyan-500" />
                     <span className="text-sm">قاعدة البيانات</span>
                  </div>
                  {/* Close Sidebar Button (Mobile) */}
                  <button 
                      onClick={() => setSidebarOpen(false)}
                      className="lg:hidden p-1.5 text-slate-400 hover:text-red-500 transition-colors bg-slate-100 dark:bg-slate-800 rounded-lg"
                  >
                      <X className="w-5 h-5" />
                  </button>
               </div>
               
               <div className="relative">
                  <button 
                    onClick={() => setDbDropdownOpen(!dbDropdownOpen)}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 hover:border-cyan-500 transition-colors shadow-sm"
                  >
                     <span className="flex items-center gap-2">
                        <Database className="w-3.5 h-3.5 text-cyan-500" />
                        {schema.currentDb || 'Loading...'}
                     </span>
                     <ChevronDown className="w-4 h-4 opacity-50" />
                  </button>
                  
                  {dbDropdownOpen && (
                     <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden animate-scale-in origin-top">
                        {schema.availableDbs?.map((dbName: string) => (
                           <button
                              key={dbName}
                              onClick={() => handleSwitchDb(dbName)}
                              className={`w-full text-right px-3 py-2.5 text-sm flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${schema.currentDb === dbName ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 font-bold' : 'text-slate-600 dark:text-slate-300'}`}
                           >
                              <div className={`w-1.5 h-1.5 rounded-full ${schema.currentDb === dbName ? 'bg-cyan-500' : 'bg-slate-400'}`}></div>
                              {dbName}
                           </button>
                        ))}
                     </div>
                  )}
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
               {schema.tables && schema.tables.length > 0 ? (
                 schema.tables.map((t: any) => (
                 <div key={t.name} className="border border-slate-200 dark:border-slate-700/50 rounded-lg overflow-hidden bg-white dark:bg-slate-800/30">
                    <button onClick={() => toggleTable(t.name)} className="w-full flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                       <div className="flex items-center gap-2 overflow-hidden">
                          <Table className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-500 transition-colors shrink-0" />
                          <span className="font-bold text-slate-700 dark:text-slate-300 text-xs truncate dir-ltr">{t.name}</span>
                       </div>
                       {expandedTables[t.name] ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />}
                    </button>
                    {expandedTables[t.name] && (
                       <div className="bg-slate-50 dark:bg-slate-900/50 p-2 space-y-1 border-t border-slate-200 dark:border-slate-700/50 animate-scale-in origin-top">
                          {t.columns.map((c: any) => (
                             <div key={c.name} className="flex justify-between items-center px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800/50 group/col">
                                <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 truncate dir-ltr max-w-[120px]" title={c.name}>{c.name}</span>
                                <div className="flex items-center gap-1">
                                   {c.key === 'PK' && <span className="text-[8px] text-yellow-600 dark:text-yellow-500 font-bold px-1 bg-yellow-100 dark:bg-yellow-900/20 rounded">PK</span>}
                                   <span className="text-[8px] font-bold text-slate-400 group-hover/col:text-cyan-500 transition-colors">{c.type}</span>
                                </div>
                             </div>
                          ))}
                       </div>
                    )}
                 </div>
               ))
               ) : (
                  <div className="text-center py-10 text-slate-400 text-xs">
                     لا توجد جداول
                  </div>
               )}
            </div>
            
            <div className="p-3 border-t border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900 text-center">
               <button onClick={handleCreateTableTemplate} className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center justify-center gap-1 w-full py-2">
                  <PlusCircle className="w-3 h-3" /> إنشاء جدول جديد
               </button>
            </div>
         </div>

         {/* Main Content Area */}
         <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-950 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            
            {/* Mobile Tab Switcher */}
            <div className="lg:hidden flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e1e1e] text-slate-500 dark:text-slate-400">
               <button 
                 onClick={() => setMobileView('editor')}
                 className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all relative ${mobileView === 'editor' ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-slate-50 dark:bg-slate-800/50' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}
               >
                 <span className="flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    المحرر
                 </span>
               </button>
               <button 
                 onClick={() => setMobileView('results')}
                 className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all relative ${mobileView === 'results' ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-slate-50 dark:bg-slate-800/50' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}
               >
                 <span className="flex items-center justify-center gap-2">
                    <Table className="w-4 h-4" />
                    النتائج
                    {result?.rows?.length > 0 && <span className="absolute top-2 left-1/2 -ml-8 bg-cyan-500 text-white text-[9px] px-1.5 py-0.5 rounded-full shadow-sm animate-scale-in">{result.rows.length}</span>}
                 </span>
               </button>
            </div>

            {/* Toolbar */}
            <div className="h-14 bg-[#1e1e1e] flex justify-between items-center px-4 shrink-0 border-b border-slate-700 dark:border-slate-800 gap-4 overflow-x-auto scrollbar-hide">
               
               {/* Left Controls (RTL: Right Side) */}
               <div className="flex items-center gap-3 text-slate-400 shrink-0">
                  {/* Toggle Sidebar Button (Mobile) */}
                  <button 
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                  >
                    <Database className="w-5 h-5" />
                  </button>

                  <div className="flex items-center bg-black/20 rounded-lg p-1 border border-slate-700/50">
                      <button onClick={handleFormat} className="p-2 hover:text-cyan-400 transition-colors" title="تنسيق الكود"><AlignLeft className="w-4 h-4" /></button>
                      <div className="w-px h-4 bg-slate-700 mx-1"></div>
                      <button onClick={() => setCode('')} className="p-2 hover:text-red-400 transition-colors" title="مسح الكود"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  
                  <button 
                    onClick={handleExecute} 
                    disabled={isExecuting} 
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:shadow-none active:scale-95 border border-emerald-500/50"
                  >
                      {isExecuting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                      <span className="hidden sm:inline">تشغيل</span>
                      <span className="sm:hidden">Run</span>
                  </button>
               </div>
               
               {/* Right Controls (RTL: Left Side) */}
               <div className="flex items-center gap-2 shrink-0">
                   <button onClick={handleReset} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors border border-transparent hover:border-slate-600" title="إعادة تعيين كامل">
                      <RotateCcw className="w-4 h-4" />
                   </button>
               </div>
            </div>

            <div className={`
               flex-1 relative bg-[#1e1e1e]
               ${mobileView === 'editor' ? 'block h-full' : 'hidden lg:block'}
            `}>
               <SqlEditor code={code} setCode={setCode} onExecute={handleExecute} schema={schema} />
            </div>

            <div className={`
               flex-col bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 lg:h-1/2 transition-all duration-300
               ${mobileView === 'results' ? 'flex flex-1 h-full animate-slide-up' : 'hidden lg:flex'}
            `}>
               <div className="h-12 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-800/50">
                  <div className="flex gap-2">
                     <button onClick={handleDownloadJSON} disabled={!result?.rows?.length} className="p-1.5 sm:px-3 sm:py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] sm:text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-50">
                        <FileText className="w-3.5 h-3.5" /> JSON
                     </button>
                     <button onClick={handleDownloadCSV} disabled={!result?.rows?.length} className="p-1.5 sm:px-3 sm:py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] sm:text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-50">
                        <Table className="w-3.5 h-3.5" /> CSV
                     </button>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="font-bold text-slate-800 dark:text-white text-xs">النتائج</span>
                     {result?.rows?.length > 0 && <span className="bg-cyan-500 text-white text-[10px] px-2 py-0.5 rounded-full font-mono">{result.rows.length}</span>}
                  </div>
               </div>
               <div className="flex-1 overflow-hidden p-0 relative">
                   <ResultViewer result={result} hideStatusBar simpleMode isLoading={isExecuting} />
               </div>
            </div>
         </div>
         <ErrorBanner error={errorBanner} onClose={() => setErrorBanner(null)} />
      </div>
    </PageTransition>
  );
};

const SqlDictionaryPage = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("الكل");

  // Extract categories
  const categories = useMemo(() => ["الكل", ...Array.from(new Set(dictionaryTerms.map(t => t.category)))], []);

  const filtered = useMemo(() => dictionaryTerms.filter(item =>
    (activeCategory === "الكل" || item.category === activeCategory) &&
    (item.term.toLowerCase().includes(search.toLowerCase()) || 
     item.definition.toLowerCase().includes(search.toLowerCase()))
  ), [search, activeCategory]);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto min-h-screen p-4 md:p-6 pb-24 pt-6 md:pt-10">

        {/* Header */}
        <ScrollReveal>
          <div className="text-center space-y-3 md:space-y-4 mb-8">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white text-2xl md:text-3xl font-black shadow-lg shadow-cyan-500/30 animate-float">
              SQL
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white">قاموس SQL</h1>
            <p className="text-sm md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              مرجع سريع لأوامر SQL — تعريف مختصر + مثال مباشر
            </p>
          </div>
        </ScrollReveal>

        {/* Sticky Search & Filter Section */}
        <div className="sticky top-14 md:top-16 z-30 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl py-2 md:py-4 -mx-4 px-4 md:mx-0 md:px-0 space-y-3 md:space-y-4 border-b border-slate-200/50 dark:border-slate-800/50 mb-6 transition-all">
            {/* Search */}
            <div className="relative max-w-2xl mx-auto">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="ابحث عن أمر..."
                className="w-full pr-10 pl-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all shadow-sm text-sm md:text-base text-slate-900 dark:text-white placeholder:text-slate-400"
                />
            </div>

            {/* Categories - Horizontal Scroll on Mobile */}
            <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide md:flex-wrap md:justify-center md:pb-0">
                {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-bold border whitespace-nowrap transition-all duration-300 flex-shrink-0
                    ${activeCategory === cat
                        ? "bg-cyan-600 text-white border-cyan-600 shadow-md shadow-cyan-500/25"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-cyan-500"}`}
                >
                    {cat}
                </button>
                ))}
            </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => (
            <ScrollReveal key={item.id} delay={Math.min(idx * 50, 300)}>
              <div className="glass-morphism p-5 md:p-8 rounded-2xl md:rounded-3xl space-y-4 md:space-y-6 relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-300 h-full flex flex-col">

                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-blue-600 opacity-50 group-hover:opacity-100 transition-opacity" />

                <div className="flex justify-between items-start">
                  <div>
                      <div className="flex items-center gap-2 mb-1">
                         <span className="text-[10px] md:text-xs font-bold px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 border border-cyan-100 dark:border-cyan-800/50">{item.category}</span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white font-mono">{item.term}</h3>
                  </div>
                  {/* Actions */}
                  <Link to="/playground" state={{ initialSql: item.example }} className="p-2 md:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-white hover:bg-cyan-600 transition-all shadow-sm" title="تشغيل في المحاكي">
                    <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                  </Link>
                </div>

                <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed">{item.definition}</p>

                <div className="bg-[#0f172a] text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-inner group-code flex-1 flex flex-col" dir="ltr">
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-800/50 border-b border-slate-700/50">
                     <span className="text-[10px] md:text-xs text-slate-400 font-bold font-mono">SQL</span>
                     <button
                        onClick={() => copy(item.example)}
                        className="text-[10px] md:text-xs flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                     >
                        <Copy className="w-3 h-3" /> Copy
                     </button>
                  </div>
                  <div className="p-3 md:p-4 overflow-x-auto flex-1">
                     <code className="text-xs md:text-sm font-mono text-cyan-100 whitespace-pre">{item.example}</code>
                  </div>
                </div>

                {(item.note || item.commonMistakes) && (
                    <div className="space-y-3 text-xs md:text-sm">
                        {item.note && (
                        <div className="text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50 flex gap-2 items-start">
                            <Info className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{item.note}</span>
                        </div>
                        )}

                        {item.commonMistakes && (
                        <div className="text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-800/50 flex gap-2 items-start">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{item.commonMistakes}</span>
                        </div>
                        )}
                    </div>
                )}

                {item.relatedLessonId && (
                  <div className="pt-3 md:pt-4 border-t border-slate-100 dark:border-slate-800 text-xs md:text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>درس مرتبط</span>
                    </div>
                    <Link to={`/learn/${item.relatedLessonId}`} className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline flex items-center gap-1">
                      الذهاب للدرس <ArrowLeft className="w-3 h-3" />
                    </Link>
                  </div>
                )}

              </div>
            </ScrollReveal>
          ))
         ) : (
            <div className="col-span-full py-20 text-center text-slate-400 flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 opacity-50" />
                </div>
                <p>لا توجد نتائج بحث مطابقة</p>
                <button onClick={() => {setSearch(''); setActiveCategory('الكل')}} className="mt-4 text-cyan-500 hover:underline text-sm">مسح البحث</button>
            </div>
         )}
        </div>

      </div>
    </PageTransition>
  );
};

// --- Footer ---

const Footer = () => {
  return (
    <footer className="bg-gradient-to-t from-slate-100 to-white dark:from-[#020617] dark:to-[#0f172a] border-t border-slate-200 dark:border-white/5 pt-16 pb-8 mt-auto relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2 space-y-6">
             <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
                    <Database className="w-5 h-5" />
                 </div>
                 <span className="font-black text-2xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">
                    SQL Master
                 </span>
             </div>
             <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-sm font-medium">
                منصتك لتعلم قواعد البيانات بأسلوب احترافي ومبسط. مصممة خصيصاً لطلاب الجامعات والمبتدئين لربط النظرية بالتطبيق العملي.
             </p> 
          </div>
          
          <ScrollReveal delay={100}>
            <div>
               <h4 className="font-bold text-slate-900 dark:text-white mb-6 text-lg">روابط سريعة</h4>
               <ul className="space-y-4 text-sm">
                  <li><Link to="/learn" className="text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-cyan-500 transition-colors"></span>الدروس التعليمية</Link></li>
                  <li><Link to="/playground" className="text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-cyan-500 transition-colors"></span>محاكي الكود</Link></li>
                  <li><Link to="/dictionary" className="text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-cyan-500 transition-colors"></span>قاموس SQL</Link></li>
                  <li><Link to="/resources" className="text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-cyan-500 transition-colors"></span>المصادر الخارجية</Link></li>
               </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-6 text-lg">تواصل معنا</h4>
              <ul className="space-y-4 text-sm">
                <li>
                  <a href="https://wa.me/qr/KULU5RTZ4LYPP1" target="_blank" className="flex items-center gap-3 text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/10 flex items-center justify-center group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20.52 3.48A11.87 11.87 0 0 0 12 .6 11.4 11.4 0 0 0 .6 11.9a11.28 11.28 0 0 0 1.56 5.8L0 24l6.53-1.7a11.94 11.94 0 0 0 5.47 1.39h.05A11.43 11.43 0 0 0 23.4 12a11.87 11.87 0 0 0-2.88-8.52ZM12 21.3a9.86 9.86 0 0 1-5-.1l-.36-.1-3.87 1 1-3.77-.12-.38a9.48 9.48 0 0 1 1.32-9A9.7 9.7 0 0 1 12 2.7a9.76 9.76 0 0 1 9.9 9.75A9.87 9.87 0 0 1 12 21.3Zm5.44-7.33c-.3-.15-1.77-.87-2.04-.97s-.47-.15-.67.15-.77.97-.94 1.17-.35.22-.65.07a8.2 8.2 0 0 1-2.41-1.48 9.12 9.12 0 0 1-1.69-2.1c-.17-.3 0-.46.13-.6s.3-.35.44-.52.2-.3.3-.52a.55.55 0 0 0 0-.52c-.08-.15-.67-1.62-.92-2.22s-.5-.5-.67-.5h-.57a1.1 1.1 0 0 0-.77.37 3.25 3.25 0 0 0-1 2.41 5.68 5.68 0 0 0 1.2 2.92 13.13 13.13 0 0 0 5.04 4.41 17.2 17.2 0 0 0 1.68.62 4 4 0 0 0 1.83.12 3.07 3.07 0 0 0 2-1.42 2.46 2.46 0 0 0 .17-1.42c-.08-.15-.27-.22-.57-.37Z" /></svg>
                    </div>
                    واتساب
                  </a>
                </li>
                <li>
                  <a href="https://www.instagram.com/1husth" target="_blank" className="flex items-center gap-3 text-slate-500 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-pink-50 dark:bg-pink-900/10 flex items-center justify-center group-hover:bg-pink-100 dark:group-hover:bg-pink-900/30 transition-colors">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3h10zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm4.5-3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/></svg>
                    </div>
                    إنستغرام
                  </a>
                </li>
                <li>
                  <a href="https://t.me/husTh1" target="_blank" className="flex items-center gap-3 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-sky-50 dark:bg-sky-900/10 flex items-center justify-center group-hover:bg-sky-100 dark:group-hover:bg-sky-900/30 transition-colors">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9.04 15.65L8.9 18.88a1 1 0 0 0 .79-.38l2.38-2.28 4.93 3.58c.9.5 1.54.24 1.77-.84l3.2-14.93v0c.28-1.32-.48-1.84-1.36-1.53L1.78 9.27C.38 9.81.4 10.62 1.51 10.95l5.53 1.72 12.85-8.1-10.1 11.08-.75-.4z" /></svg>
                    </div>
                    تلغرام
                  </a>
                </li>
              </ul>
            </div>
          </ScrollReveal>
        </div>
        
        <div className="border-t border-slate-200 dark:border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
           <p className="text-slate-500 dark:text-slate-400 text-xs font-mono tracking-wide">
              © {new Date().getFullYear()} SQL Master All rights reserved
           </p>
           <p className="text-slate-500 dark:text-slate-400 text-xs font-mono flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-800">
             <span className=" font-bold text-slate-700 dark:text-slate-200">Hussain Mohammed</span> Made with by 
           </p>
        </div>
      </div>
    </footer>
  );
};
// --- NavBar ---
const NavBar = ({ theme, toggleTheme }: { theme: 'light' | 'dark', toggleTheme: () => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: '/learn', label: 'مسار التعلم', icon: BookOpen },
    { to: '/playground', label: 'المحاكي', icon: Terminal },
    { to: '/dictionary', label: 'القاموس', icon: BookOpen },
    { to: '/resources', label: 'المصادر', icon: Layers },
    { to: '/about', label: 'عن الموقع', icon: Info },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
             <div className="w-8 h-8 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-black shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform duration-300">
               SM
             </div>
             <span className="font-black text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400 group-hover:to-cyan-600 dark:group-hover:to-white transition-all">
               SQL Master
             </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
             {links.map(link => {
               const isActive = location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to));
               return (
                 <Link 
                   key={link.to} 
                   to={link.to} 
                   className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all duration-300 btn-interaction ${
                     isActive 
                       ? 'bg-slate-100 dark:bg-white/10 text-cyan-600 dark:text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
                       : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
                   }`}
                 >
                   <link.icon className={`w-4 h-4 ${isActive ? 'fill-current' : ''}`} />
                   {link.label}
                 </Link>
               );
             })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
             <button 
               onClick={toggleTheme}
               className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors overflow-hidden relative"
               aria-label="Toggle Theme"
             >
               <div className="relative w-5 h-5">
                 <Sun className={`w-5 h-5 absolute inset-0 transition-all duration-500 ${theme === 'dark' ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`} />
                 <Moon className={`w-5 h-5 absolute inset-0 transition-all duration-500 ${theme === 'light' ? 'opacity-0 -rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`} />
               </div>
             </button>
             
             {/* Mobile Menu Button */}
             <button 
               onClick={() => setIsMenuOpen(!isMenuOpen)}
               className="md:hidden p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
             >
               {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
             </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 px-4 py-2 space-y-1 animate-fade-in-up">
           {links.map(link => {
             const isActive = location.pathname === link.to;
             return (
               <Link 
                 key={link.to} 
                 to={link.to}
                 onClick={() => setIsMenuOpen(false)}
                 className={`block px-4 py-3 rounded-xl text-base font-bold flex items-center gap-3 transition-colors ${
                   isActive 
                     ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' 
                     : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                 }`}
               >
                 <link.icon className="w-5 h-5" />
                 {link.label}
               </Link>
             );
           })}
        </div>
      )}
    </nav>
  );
};

// --- App Entry Point ---
export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
      
      // System preference detection
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Logic from AppLayout (Particles delay)
  const [mountParticles, setMountParticles] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setMountParticles(true);
    }, 800); 
    return () => clearTimeout(timer);
  }, []);

  return (
    <HashRouter>
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500 font-sans ${theme}`} dir="rtl">
           {/* Particle Background */}
           <div className={`transition-opacity duration-1000 ${mountParticles ? 'opacity-100' : 'opacity-0'}`}>
             {mountParticles && <ParticleBackground />}
           </div>

           <NavBar theme={theme} toggleTheme={toggleTheme} />
           
           <main>
             <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/learn" element={<LearnPage />} />
                <Route path="/learn/:lessonId" element={<LessonPage />} />
                <Route path="/resources" element={<ResourcesPage />} />
                <Route path="/dictionary" element={<SqlDictionaryPage />} />
                <Route path="/reference/:refId" element={<ReferencePage />} />
                <Route path="/playground" element={<PlaygroundPage />} />
                <Route path="/about" element={<AboutPage />} />
             </Routes>
           </main>
           
           <Footer />
        </div>
      </ThemeContext.Provider>
    </HashRouter>
  );
}
