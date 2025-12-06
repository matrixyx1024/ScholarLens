import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import AnalysisView from './components/AnalysisView';
import ChatInterface from './components/ChatInterface';
import { AppState, PaperAnalysis, Message, UploadedFile } from './types';
import { analyzePaperStructure, chatWithPaper } from './services/geminiService';
import { GraduationCap, ArrowLeft, RefreshCw } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [analysis, setAnalysis] = useState<PaperAnalysis | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatSending, setIsChatSending] = useState(false);

  // File selection handler
  const handleFileSelect = async (file: UploadedFile) => {
    setUploadedFile(file);
    setAppState(AppState.ANALYZING);

    try {
      // Step 1: Get initial structured analysis
      const analysisResult = await analyzePaperStructure(file.data, file.type);
      setAnalysis(analysisResult);
      setAppState(AppState.DASHBOARD);
    } catch (error) {
      console.error(error);
      setAppState(AppState.ERROR);
    }
  };

  // Chat handler
  const handleSendMessage = async (text: string) => {
    if (!uploadedFile) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsChatSending(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const responseText = await chatWithPaper(history, text, uploadedFile.data, uploadedFile.type);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsChatSending(false);
    }
  };

  const resetApp = () => {
    setAppState(AppState.UPLOAD);
    setUploadedFile(null);
    setAnalysis(null);
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={resetApp}>
            <div className="bg-indigo-600 p-2 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">ScholarLens</h1>
                <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">AI Research Assistant</p>
            </div>
          </div>
          
          {appState !== AppState.UPLOAD && (
            <button 
              onClick={resetApp}
              className="flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              分析新论文
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Upload View */}
        {appState === AppState.UPLOAD && (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
            <div className="text-center mb-10 max-w-2xl">
              <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                深度理解每一篇<span className="text-indigo-600">学术论文</span>
              </h2>
              <p className="text-lg text-slate-600">
                上传 PDF，立刻获取核心摘要、创新点分析，并与 AI 进行深度问答。
                <br />
                <span className="text-sm opacity-75 mt-2 block">Powered by Gemini 2.5 Flash</span>
              </p>
            </div>
            <FileUpload onFileSelect={handleFileSelect} isLoading={false} />
          </div>
        )}

        {/* Analyzing View */}
        {appState === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] animate-pulse">
             <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full"></div>
                <GraduationCap className="w-20 h-20 text-indigo-600 relative z-10" />
             </div>
            <h3 className="mt-8 text-2xl font-bold text-slate-800">正在研读论文...</h3>
            <p className="mt-2 text-slate-500">AI 正在分析核心架构、提取关键贡献和方法论</p>
          </div>
        )}

        {/* Dashboard View */}
        {appState === AppState.DASHBOARD && analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
            {/* Left: Analysis Summary (Scrollable) */}
            <div className="lg:col-span-7 h-full overflow-hidden">
               <AnalysisView analysis={analysis} />
            </div>

            {/* Right: Chat Interface (Fixed height) */}
            <div className="lg:col-span-5 h-full">
              <ChatInterface 
                messages={messages} 
                onSendMessage={handleSendMessage}
                isSending={isChatSending}
              />
            </div>
          </div>
        )}

        {/* Error View */}
        {appState === AppState.ERROR && (
           <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
            <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-center max-w-md">
                <h3 className="text-lg font-bold text-red-800 mb-2">分析失败</h3>
                <p className="text-red-600 mb-6">可能是文件过大、格式不支持或 API 暂时不可用。</p>
                <button 
                    onClick={resetApp}
                    className="inline-flex items-center px-4 py-2 bg-white border border-red-200 rounded-lg text-red-700 hover:bg-red-50 font-medium transition-colors"
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    重试
                </button>
            </div>
           </div>
        )}

      </main>
    </div>
  );
}
