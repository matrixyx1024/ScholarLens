import React from 'react';
import { PaperAnalysis } from '../types';
import { Lightbulb, Target, BookOpen, Compass, Layers } from 'lucide-react';

interface AnalysisViewProps {
  analysis: PaperAnalysis;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ analysis }) => {
  return (
    <div className="h-full overflow-y-auto pr-2 custom-scrollbar space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900 serif mb-4 leading-tight">
          {analysis.title}
        </h1>
        <div className="flex items-start space-x-3 text-slate-700 bg-slate-50 p-4 rounded-xl">
          <BookOpen className="w-5 h-5 text-indigo-500 mt-1 flex-shrink-0" />
          <div>
            <span className="font-semibold block text-sm text-slate-900 mb-1">核心摘要</span>
            <p className="text-sm leading-relaxed text-slate-600">{analysis.summary}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center mb-4">
          <Lightbulb className="w-5 h-5 text-amber-500 mr-2" />
          <h2 className="text-lg font-bold text-slate-900">核心贡献</h2>
        </div>
        <ul className="space-y-3">
          {analysis.keyContributions.map((point, idx) => (
            <li key={idx} className="flex items-start text-sm text-slate-700">
              <span className="inline-flex items-center justify-center w-5 h-5 mr-3 text-xs font-bold text-amber-600 bg-amber-100 rounded-full flex-shrink-0">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center mb-3">
            <Layers className="w-5 h-5 text-blue-500 mr-2" />
            <h2 className="text-lg font-bold text-slate-900">研究方法</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            {analysis.methodology}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center mb-3">
            <Target className="w-5 h-5 text-emerald-500 mr-2" />
            <h2 className="text-lg font-bold text-slate-900">目标受众</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            {analysis.targetAudience}
          </p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center mb-3">
            <Compass className="w-5 h-5 text-purple-500 mr-2" />
            <h2 className="text-lg font-bold text-slate-900">未来展望</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            {analysis.futureWork}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
