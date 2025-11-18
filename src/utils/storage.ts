import type { ChatSession } from '../types/chat';

const STORAGE_KEY = 'ai_chat_sessions';
const RETENTION_DAYS = 5;

export const saveSessions = (sessions: ChatSession[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
};

export const loadSessions = (): ChatSession[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [];
  }

  try {
    const sessions: ChatSession[] = JSON.parse(stored);
    // Remove sessions older than 5 days
    const cutoffTime = Date.now() - (RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const filteredSessions = sessions.filter(
      session => session.lastMessageAt > cutoffTime
    );

    // Save filtered sessions back
    if (filteredSessions.length !== sessions.length) {
      saveSessions(filteredSessions);
    }

    return filteredSessions;
  } catch (error) {
    console.error('Failed to load sessions:', error);
    return [];
  }
};

export const saveSession = (session: ChatSession): void => {
  const sessions = loadSessions();
  const existingIndex = sessions.findIndex(s => s.id === session.id);

  if (existingIndex >= 0) {
    sessions[existingIndex] = session;
  } else {
    sessions.push(session);
  }

  saveSessions(sessions);
};

export const deleteSession = (sessionId: string): void => {
  const sessions = loadSessions();
  const filtered = sessions.filter(s => s.id !== sessionId);
  saveSessions(filtered);
};
