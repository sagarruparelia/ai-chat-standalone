export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  lastMessageAt: number;
  messages: ChatMessage[];
}

export interface ChatRequest {
  session_id: string;
  prompt: string;
  lat?: number;
  lng?: number;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface ChatConfig {
  apiUrl: string;
}
