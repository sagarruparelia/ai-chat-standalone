import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';

export const generateSessionId = async (): Promise<string> => {
  // Get IP address (simplified - using a random component for demo)
  const ipComponent = await getIpAddress();

  // Get GMT date
  const gmtDate = new Date().toISOString().split('T')[0].replace(/-/g, '');

  // Generate unique ID
  const uniqueId = uuidv4().split('-')[0];

  return `${ipComponent}_${gmtDate}_${uniqueId}`;
};

const getIpAddress = async (): Promise<string> => {
  try {
    // Try to get IP from ipify service
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip.replace(/\./g, '-');
  } catch (error) {
    // Fallback to a hash of user agent + timestamp
    const fallback = btoa(navigator.userAgent + Date.now()).substring(0, 12);
    return fallback.replace(/[^a-zA-Z0-9]/g, '');
  }
};

export const getUserId = (): string => {
  let userId = Cookies.get('ai_chat_user_id');

  if (!userId) {
    userId = uuidv4();
    // Set cookie for 1 year
    Cookies.set('ai_chat_user_id', userId, { expires: 365 });
  }

  return userId;
};

export const getApiUrl = (): string => {
  // Check URL parameter first
  const urlParams = new URLSearchParams(window.location.search);
  const serverUrl = urlParams.get('server');

  if (serverUrl) {
    // Store in localStorage for future use
    localStorage.setItem('ai_chat_api_url', serverUrl);
    return serverUrl;
  }

  // Check localStorage
  const storedUrl = localStorage.getItem('ai_chat_api_url');
  if (storedUrl) {
    return storedUrl;
  }

  // Return default
  return 'https://example.com/v1/chat';
};
