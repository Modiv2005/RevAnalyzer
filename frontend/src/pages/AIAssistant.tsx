import React, { useState, useEffect, useRef } from 'react';
import { useDatasetStore } from '../store/datasetStore';
import { useChatStore, ChatMessage } from '../store/chatStore';
import { 
  MessageSquareCode, 
  Send, 
  HelpCircle, 
  Sparkles, 
  Cpu, 
  Loader2, 
  Database,
  ArrowRight,
  BookOpen
} from 'lucide-react';

export default function AIAssistant() {
  const { selectedDataset } = useDatasetStore();
  const { messages, sessionId, isSending, setMessages, addMessage, setSending } = useChatStore();
  const [inputMsg, setInputMsg] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat window
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chat logs on load
  useEffect(() => {
    const token = localStorage.getItem('bi_token');
    if (!token) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/chat/history/${sessionId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchHistory();
  }, [sessionId]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    setInputMsg('');
    setSending(true);
    const token = localStorage.getItem('bi_token');

    // Append user message immediately
    const userMsg: ChatMessage = {
      id: "u_" + Math.random().toString(36).substring(2, 9),
      session_id: sessionId,
      message: text,
      sender: 'user',
      created_at: new Date().toISOString()
    };
    addMessage(userMsg);

    try {
      const res = await fetch('http://localhost:8000/api/v1/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: text,
          session_id: sessionId,
          dataset_id: selectedDataset?.id
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error("AI Assistant failed to reply.");

      const aiMsg: ChatMessage = {
        id: "ai_" + Math.random().toString(36).substring(2, 9),
        session_id: sessionId,
        message: data.answer,
        sender: 'ai',
        context_used_json: { context: data.context_used, used_openai: data.used_openai },
        created_at: new Date().toISOString()
      };
      addMessage(aiMsg);

    } catch (err) {
      const errMsg: ChatMessage = {
        id: "err_" + Math.random().toString(36).substring(2, 9),
        session_id: sessionId,
        message: "⚠️ Error contacting AI engine. Please verify the Python uvicorn server connection.",
        sender: 'ai',
        created_at: new Date().toISOString()
      };
      addMessage(errMsg);
    } finally {
      setSending(false);
    }
  };

  const promptTemplates = [
    { text: "Why did expenses spike?", icon: "🚨" },
    { text: "Predict next quarter revenue", icon: "📈" },
    { text: "Summarize corporate KPIs & profit margin", icon: "📊" },
    { text: "Explain sales decline anomaly", icon: "📉" }
  ];

  if (!selectedDataset) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center glass-panel p-8 rounded-3xl border border-darkBorder select-none">
        <MessageSquareCode className="w-12 h-12 text-blue-500 mb-4 animate-pulse" />
        <h3 className="text-base font-bold text-white font-outfit uppercase mb-2">No Active Ledger Selected</h3>
        <p className="text-xs text-gray-400 max-w-sm mb-6">
          To consult the grounded Conversational BI Assistant, select or generate a dataset in the Ingestion Center first.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col justify-between select-none animate-fade-in">
      
      {/* CHAT LOGS WINDOW */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-6">
        
        {messages.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center py-12 flex flex-col items-center">
            <div className="p-3 bg-blue-600/10 border border-blue-500/20 rounded-2xl text-blue-400 mb-6 animate-bounce">
              <Cpu className="w-8 h-8" />
            </div>
            
            <h3 className="font-outfit font-extrabold text-xl text-white mb-2">Conversational BI Grounded Assistant</h3>
            <p className="text-xs text-gray-400 mb-8 max-w-md leading-relaxed">
              I am grounded in <span className="text-blue-400 font-bold">{selectedDataset.filename}</span>. I run local vector lookups to inspect descriptive statistics, model forecasts, and anomaly flags to answer your queries.
            </p>

            <div className="grid grid-cols-2 gap-4 w-full">
              {promptTemplates.map(t => (
                <button
                  key={t.text}
                  onClick={() => handleSendMessage(t.text)}
                  className="p-4 text-left border border-darkBorder hover:border-blue-500/30 rounded-2xl bg-darkPanel/20 hover:bg-darkPanel/40 transition-all duration-200 group"
                >
                  <span className="text-lg mb-2 block">{t.icon}</span>
                  <p className="text-xs font-semibold text-white group-hover:text-blue-400 mb-1 leading-normal">{t.text}</p>
                  <span className="text-[9px] text-gray-500 font-bold uppercase flex items-center gap-1">
                    Ask AI Assistant <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </button>
              ))}
            </div>

          </div>
        ) : (
          messages.map((m: ChatMessage) => {
            const isUser = m.sender === 'user';
            return (
              <div key={m.id} className={`flex gap-4 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
                {/* ICON */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold font-outfit text-xs ${
                  isUser 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-400'
                }`}>
                  {isUser ? 'US' : 'AI'}
                </div>

                {/* TEXT BUBBLE */}
                <div className="space-y-3 flex-1 min-w-0">
                  <div className={`p-5 rounded-2xl border text-xs leading-relaxed ${
                    isUser 
                      ? 'bg-blue-600/15 border-blue-500/20 text-white font-medium shadow-lg shadow-blue-500/5' 
                      : 'bg-darkPanel/50 border-darkBorder text-gray-300'
                  }`}>
                    {/* Simplified markdown formatter for quick visual render */}
                    <div className="prose prose-invert prose-xs max-w-none">
                      {m.message.split('\n').map((line, idx) => {
                        if (line.startsWith('### ')) {
                          return <h3 key={idx} className="text-sm font-bold text-white mt-4 mb-2 first:mt-0 font-outfit uppercase tracking-wider">{line.replace('### ', '')}</h3>;
                        }
                        if (line.startsWith('#### ')) {
                          return <h4 key={idx} className="text-xs font-bold text-gray-200 mt-3 mb-1 font-outfit uppercase tracking-wider">{line.replace('#### ', '')}</h4>;
                        }
                        if (line.startsWith('- ')) {
                          return <li key={idx} className="ml-4 list-disc text-gray-300 py-0.5">{line.replace('- ', '')}</li>;
                        }
                        if (line.startsWith('|')) {
                          // Visual table formatting!
                          const cells = line.split('|').filter(c => c.trim().length > 0);
                          if (line.includes('---')) return null; // Skip divider
                          return (
                            <div key={idx} className="grid grid-cols-5 gap-2 bg-darkBg/30 p-2 border-b border-darkBorder first:rounded-t-lg last:rounded-b-lg text-[10px] font-bold text-white">
                              {cells.map((c, i) => <div key={i} className="truncate">{c.trim()}</div>)}
                            </div>
                          );
                        }
                        return <p key={idx} className="mb-2 leading-relaxed">{line}</p>;
                      })}
                    </div>
                  </div>

                  {/* SOURCE GROUNDING PANEL FOR AI MESSAGES */}
                  {!isUser && m.context_used_json?.context && (
                    <details className="text-[10px] text-gray-500 bg-darkPanel/10 border border-darkBorder rounded-xl overflow-hidden cursor-pointer transition-all duration-200">
                      <summary className="p-3 font-bold uppercase tracking-wider flex items-center gap-1.5 hover:text-gray-300 select-none">
                        <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                        <span>Source Groundings & Vector Context</span>
                      </summary>
                      <pre className="p-4 text-[9px] bg-darkBg/40 overflow-x-auto text-gray-400 select-all font-mono leading-normal whitespace-pre-wrap">
                        {m.context_used_json.context}
                      </pre>
                    </details>
                  )}
                </div>

              </div>
            );
          })
        )}
        
        {isSending && (
          <div className="flex gap-4 max-w-xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 animate-bounce">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl border border-darkBorder bg-darkPanel/30 text-xs text-gray-500 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>AI Data Scientist is formulating statistical report...</span>
            </div>
          </div>
        )}
        
        <div ref={chatBottomRef}></div>
      </div>

      {/* CHAT INPUT BAR */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputMsg); }}
        className="h-20 border-t border-darkBorder bg-darkPanel/20 flex items-center px-6 gap-4"
      >
        <div className="relative flex-1">
          <Database className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder={`Ask financial queries grounded in ${selectedDataset.filename}...`}
            value={inputMsg}
            onChange={e => setInputMsg(e.target.value)}
            disabled={isSending}
            className="w-full bg-darkBg border border-darkBorder rounded-2xl py-3 pl-11 pr-4 text-xs text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isSending || !inputMsg.trim()}
          className="p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl transition-all duration-200 glow-cobalt"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

    </div>
  );
}
