import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isSending: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isSending }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isSending) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-white">
        <h2 className="text-lg font-bold text-slate-800 flex items-center">
          <Bot className="w-5 h-5 mr-2 text-indigo-600" />
          论文问答助手
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          你可以询问关于公式、实验数据或特定段落的含义
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50">
        {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <p className="text-sm">试着问：</p>
                <div className="flex flex-wrap gap-2 justify-center mt-3">
                    <button onClick={() => onSendMessage("这篇论文最核心的公式是什么？")} className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors">
                        核心公式是什么？
                    </button>
                    <button onClick={() => onSendMessage("作者是如何验证他们的理论的？")} className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors">
                        实验验证方法？
                    </button>
                </div>
            </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mx-2 
                ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
              </div>
              
              <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                }`}
              >
                {msg.role === 'user' ? (
                  msg.content
                ) : (
                  <div className="markdown-body">
                    <ReactMarkdown 
                        components={{
                            // Basic styling for markdown elements
                            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                            li: ({node, ...props}) => <li className="mb-1" {...props} />,
                            strong: ({node, ...props}) => <span className="font-bold" {...props} />,
                            code: ({node, ...props}) => <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono text-slate-700" {...props} />,
                        }}
                    >
                        {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start w-full">
             <div className="flex flex-row">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center mx-2">
                    <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center">
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400 mr-2" />
                    <span className="text-xs text-slate-500">正在思考...</span>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的问题..."
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm custom-scrollbar"
            rows={2}
          />
          <button
            type="button" // handled by form submit or keydown
            onClick={handleSubmit}
            disabled={!input.trim() || isSending}
            className={`absolute right-3 bottom-3 p-1.5 rounded-lg transition-colors
              ${input.trim() && !isSending ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
            `}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="text-center mt-2">
            <span className="text-[10px] text-slate-400">AI 可能会产生错误，请以原文为准。</span>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
