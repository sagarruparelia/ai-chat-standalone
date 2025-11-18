import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { ChatSession, ChatMessage as ChatMessageType } from '../types/chat';
import { ChatSidebar } from '../components/chat/ChatSidebar';
import { ChatMessage } from '../components/chat/ChatMessage';
import { ChatInput } from '../components/chat/ChatInput';
import { getChatService } from '../services/chatService';
import { generateSessionId, getApiUrl, getUserId } from '../utils/session';
import { getLocation } from '../utils/location';
import { loadSessions, saveSession, deleteSession as removeSession } from '../utils/storage';
import './Chat.css';

export const Chat = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize user and load sessions
  useEffect(() => {
    getUserId(); // This creates cookie if doesn't exist
    const loadedSessions = loadSessions();
    setSessions(loadedSessions);

    // Start with a new chat if no sessions exist
    if (loadedSessions.length === 0) {
      createNewChat();
    } else {
      // Load the most recent session
      const mostRecent = loadedSessions.sort((a, b) => b.lastMessageAt - a.lastMessageAt)[0];
      setCurrentSession(mostRecent);
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages, streamingContent]);

  const createNewChat = async () => {
    const sessionId = await generateSessionId();
    const newSession: ChatSession = {
      id: sessionId,
      title: 'New Chat',
      createdAt: Date.now(),
      lastMessageAt: Date.now(),
      messages: [],
    };

    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    setCurrentSession(newSession);
    setStreamingContent('');
  };

  const selectSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
      setStreamingContent('');
    }
  };

  const deleteSession = (sessionId: string) => {
    removeSession(sessionId);
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);

    if (currentSession?.id === sessionId) {
      if (updatedSessions.length > 0) {
        setCurrentSession(updatedSessions[0]);
      } else {
        createNewChat();
      }
    }
  };

  const updateSessionTitle = (session: ChatSession, firstMessage: string) => {
    // Generate title from first message (max 50 chars)
    const title = firstMessage.length > 50
      ? firstMessage.substring(0, 50) + '...'
      : firstMessage;

    return { ...session, title };
  };

  const sendMessage = async (content: string) => {
    if (!currentSession || isLoading) return;

    setIsLoading(true);
    setStreamingContent('');

    // Add user message
    const userMessage: ChatMessageType = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    let updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, userMessage],
      lastMessageAt: Date.now(),
    };

    // Update title if this is the first message
    if (currentSession.messages.length === 0) {
      updatedSession = updateSessionTitle(updatedSession, content);
    }

    setCurrentSession(updatedSession);
    saveSession(updatedSession);
    setSessions(sessions.map(s => s.id === updatedSession.id ? updatedSession : s));

    // Get location
    const location = await getLocation();

    // Get API URL
    const apiUrl = getApiUrl();
    const chatService = getChatService(apiUrl);

    // Prepare request
    const request = {
      session_id: currentSession.id,
      prompt: content,
      ...(location && { lat: location.lat, lng: location.lng }),
    };

    // Create assistant message placeholder
    const assistantMessageId = uuidv4();

    try {
      await chatService.sendMessage(
        request,
        (streamContent) => {
          // Update streaming content
          setStreamingContent(streamContent);
        },
        (error) => {
          console.error('Error sending message:', error);
          setStreamingContent('Sorry, an error occurred while processing your request.');
        },
        () => {
          // On complete, save the final message
          const assistantMessage: ChatMessageType = {
            id: assistantMessageId,
            role: 'assistant',
            content: streamingContent,
            timestamp: Date.now(),
          };

          const finalSession = {
            ...updatedSession,
            messages: [...updatedSession.messages, assistantMessage],
            lastMessageAt: Date.now(),
          };

          setCurrentSession(finalSession);
          saveSession(finalSession);
          setSessions(sessions.map(s => s.id === finalSession.id ? finalSession : s));
          setStreamingContent('');
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <ChatSidebar
        sessions={sessions}
        currentSessionId={currentSession?.id || null}
        onSelectSession={selectSession}
        onNewChat={createNewChat}
        onDeleteSession={deleteSession}
      />

      <div className="chat-main">
        {currentSession ? (
          <>
            <div className="messages-container">
              {currentSession.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}

              {streamingContent && (
                <ChatMessage
                  message={{
                    id: 'streaming',
                    role: 'assistant',
                    content: streamingContent,
                    timestamp: Date.now(),
                  }}
                />
              )}

              {isLoading && !streamingContent && (
                <div className="loading-indicator">
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <ChatInput
              onSend={sendMessage}
              disabled={isLoading}
              placeholder={isLoading ? 'AI is thinking...' : 'Type your message...'}
            />
          </>
        ) : (
          <div className="empty-chat">
            <h2>Welcome to AI Chat</h2>
            <p>Start a new conversation to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};
