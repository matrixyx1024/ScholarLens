import { GoogleGenAI, Type } from "@google/genai";
import { PaperAnalysis } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to sanitize base64 string (remove data URL prefix)
const cleanBase64 = (dataUrl: string) => {
  return dataUrl.split(',')[1] || dataUrl;
};

export const analyzePaperStructure = async (fileData: string, mimeType: string): Promise<PaperAnalysis> => {
  const model = "gemini-2.5-flash";

  const prompt = `
    请你作为一名资深的学术审稿人和教授，深度分析这份研究论文。
    请提取以下关键信息，并以严格的 JSON 格式返回：
    1. title: 论文标题 (中文翻译后的标题)
    2. summary: 核心内容摘要 (200字以内，通俗易懂)
    3. keyContributions: 核心贡献点列表 (数组，列出3-5个主要创新或贡献)
    4. methodology: 研究方法论 (简述使用了什么模型、算法或实验设计)
    5. targetAudience: 适合阅读的人群 (如：NLP研究员、本科生等)
    6. futureWork: 论文提到的未来工作或局限性
    
    请确保所有返回的文本内容都是**中文**。
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64(fileData)
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyContributions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            methodology: { type: Type.STRING },
            targetAudience: { type: Type.STRING },
            futureWork: { type: Type.STRING }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as PaperAnalysis;
    }
    throw new Error("No analysis generated");
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const chatWithPaper = async (
  history: { role: 'user' | 'model'; content: string }[],
  message: string,
  fileData: string,
  mimeType: string
): Promise<string> => {
  const model = "gemini-2.5-flash"; // Flash is fast and good for chat with context

  // We send the file content with every request in a stateless manner or chat session.
  // For simplicity and robustness with large files in this demo, we will use generateContent with history included manually,
  // or use the chat API. The chat API is better for history management.
  
  // However, sending the PDF base64 in every chat turn can use a lot of bandwidth/tokens if not cached.
  // Ideally, we use the File API from Google to upload once. 
  // Given the constraints of this environment (client-side only, no persistent backend storage), 
  // we will pass the file data in the 'contents' of the chat generation for the context.

  // To optimize, we will construct a prompt that includes history.
  
  const chatHistory = history.map(h => ({
    role: h.role,
    parts: [{ text: h.content }]
  }));

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        {
            role: 'user',
            parts: [
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: cleanBase64(fileData)
                    }
                },
                { text: "这是我正在阅读的论文。请根据这篇论文回答后续问题。" }
            ]
        },
        {
            role: 'model',
            parts: [{ text: "好的，我已经阅读了论文内容。请问您有什么关于这篇论文的问题？我将用中文为您解答。" }]
        },
        ...chatHistory,
        {
          role: 'user',
          parts: [{ text: message }]
        }
      ],
      config: {
        systemInstruction: "你是一个专业的学术助手。请根据提供的论文内容回答用户的问题。如果回答涉及论文中的公式或复杂概念，请用通俗易懂的中文解释。如果用户询问代码实现但论文未提供，请根据原理提供伪代码或概念代码。"
      }
    });

    return response.text || "抱歉，我无法回答这个问题。";
  } catch (error) {
    console.error("Chat failed:", error);
    return "发生错误，请重试。";
  }
};
