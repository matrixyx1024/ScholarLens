import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { UploadedFile } from '../types';

interface FileUploadProps {
  onFileSelect: (file: UploadedFile) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processFile = (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('请上传 PDF 格式的文件');
      return;
    }
    if (file.size > 20 * 1024 * 1024) { // 20MB limit
        setError('文件大小不能超过 20MB');
        return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as string;
      onFileSelect({
        name: file.name,
        type: file.type,
        data: data
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div 
        className={`relative flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-2xl transition-all duration-300 ease-in-out
          ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-white hover:bg-slate-50'}
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag} 
        onDragLeave={handleDrag} 
        onDragOver={handleDrag} 
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
            {isLoading ? (
                 <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-4" />
            ) : (
                <div className="bg-indigo-100 p-4 rounded-full mb-4">
                    <Upload className="w-10 h-10 text-indigo-600" />
                </div>
            )}
          
          <p className="mb-2 text-xl font-semibold text-slate-700">
            {isLoading ? '正在解析论文...' : '点击或拖拽 PDF 文件到此处'}
          </p>
          <p className="mb-6 text-sm text-slate-500">
             支持 arxiv.org 下载的 PDF 文件
          </p>
          
          {!isLoading && (
            <>
                <label 
                    htmlFor="dropzone-file" 
                    className="cursor-pointer py-2.5 px-6 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    选择文件
                </label>
                <input 
                    id="dropzone-file" 
                    type="file" 
                    className="hidden" 
                    accept="application/pdf"
                    onChange={handleChange}
                />
            </>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mt-4 flex items-center p-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
          <AlertCircle className="flex-shrink-0 inline w-4 h-4 mr-3" />
          <span className="font-medium">错误：</span> {error}
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-4">
        <h4 className="flex items-center text-sm font-semibold text-blue-800 mb-2">
            <FileText className="w-4 h-4 mr-2" />
            关于你提到的论文 (arXiv:2506.06326)
        </h4>
        <p className="text-sm text-blue-700 leading-relaxed">
            由于浏览器安全限制，应用无法直接从 arXiv 下载 PDF。请先点击链接下载论文，然后将 PDF 文件上传到这里。
        </p>
        <a 
            href="https://arxiv.org/pdf/2506.06326" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
            打开 arXiv 2506.06326 (新窗口) &rarr;
        </a>
      </div>
    </div>
  );
};

export default FileUpload;
