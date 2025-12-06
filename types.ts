export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface PaperAnalysis {
  title: string;
  summary: string;
  keyContributions: string[];
  methodology: string;
  targetAudience: string;
  futureWork: string;
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  ANALYZING = 'ANALYZING',
  DASHBOARD = 'DASHBOARD',
  ERROR = 'ERROR'
}

export interface UploadedFile {
  name: string;
  type: string;
  data: string; // Base64
}
