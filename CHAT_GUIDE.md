# AI Chat Application Guide

## Overview

A modern, standalone AI chat application with support for multiple chat sessions, real-time streaming responses, location-aware requests, and light/dark themes.

## Features

### Core Features
- **Real-time Streaming**: Uses Server-Sent Events (SSE) to stream AI responses in real-time
- **Multiple Chat Sessions**: Create and manage multiple concurrent chat conversations
- **Markdown Support**: All AI responses rendered in beautiful markdown with code syntax highlighting
- **Location-Aware**: Automatically detects user location (browser geolocation or IP-based fallback)
- **Session Persistence**: Chats saved locally with 5-day retention policy
- **Theme Support**: Light and dark theme with smooth transitions
- **User Tracking**: Persistent user identification via cookies

### Technical Features
- TypeScript for type safety
- React hooks for state management
- CSS variables for theming
- Local storage for chat history
- Cookie-based user identification
- Responsive design

## API Configuration

### Default Server
```
https://example.com/v1/chat
```

### Override via URL Parameter
You can override the default server by passing a URL parameter:
```
https://your-app.com/?server=https://your-api.com/v1/chat
```

The custom server URL will be saved to localStorage for future sessions.

### API Request Format

**Endpoint**: POST to configured chat URL
**Content-Type**: `application/json`

**Request Body**:
```json
{
  "session_id": "192-168-1-1_20250117_abc123",
  "prompt": "User's message here",
  "lat": 37.7749,
  "lng": -122.4194
}
```

**Response Format**:
- Content-Type: `text/event-stream; charset=utf-8`
- Messages in markdown format
- Each message wrapped in double quotes
- `\n` characters for line breaks

## Session ID Format

Session IDs are automatically generated using:
```
{IP_ADDRESS}_{GMT_DATE}_{UNIQUE_ID}
```

Example: `192-168-1-1_20250117_abc123`

Components:
- **IP Address**: Fetched from ipify.org (or fallback hash)
- **GMT Date**: Format YYYYMMDD
- **Unique ID**: First segment of UUID v4

## Location Detection

The app attempts to get user location in this order:

1. **Browser Geolocation API** (requires user permission)
   - Most accurate
   - Cached for 5 minutes
   - 5-second timeout

2. **IP-based Geolocation** (fallback)
   - Uses ip-api.com
   - Less accurate but doesn't require permission
   - Automatic fallback if browser geolocation fails

If both fail, the request is sent without location data.

## Data Storage

### LocalStorage
- **Chat Sessions**: `ai_chat_sessions`
  - All chat history
  - Automatic cleanup of chats older than 5 days

- **API URL**: `ai_chat_api_url`
  - Custom server URL (if set via URL parameter)

### Cookies
- **User ID**: `ai_chat_user_id`
  - Expires: 1 year
  - Used for user identification

## Usage

### Starting the App
```bash
npm run dev
```

### Creating a New Chat
- Click the **+** button in the sidebar
- A new chat session will be created with a unique session ID

### Sending Messages
1. Type your message in the input box
2. Press **Enter** to send (or click the send button)
3. Use **Shift+Enter** for new lines in your message
4. AI response will stream in real-time

### Managing Chats
- **Switch Chat**: Click on any chat in the sidebar
- **Delete Chat**: Hover over a chat and click the trash icon
- **View Date**: See when each chat was last active

### Theme Toggle
- Click the theme toggle button (top-right corner)
- Your preference is saved to localStorage

## File Structure

```
src/
├── components/
│   ├── chat/
│   │   ├── ChatMessage.tsx      # Individual message component
│   │   ├── ChatInput.tsx        # Message input field
│   │   └── ChatSidebar.tsx      # Session list sidebar
│   └── ThemeToggle.tsx          # Theme switcher
├── pages/
│   └── Chat.tsx                 # Main chat page
├── services/
│   └── chatService.ts           # API integration with SSE
├── types/
│   └── chat.ts                  # TypeScript interfaces
├── utils/
│   ├── session.ts               # Session ID & user management
│   ├── location.ts              # Geolocation utilities
│   └── storage.ts               # LocalStorage helpers
└── contexts/
    └── ThemeContext.tsx         # Theme state management
```

## Customization

### Changing API Endpoint
1. **Via URL**: `?server=https://your-api.com/v1/chat`
2. **Via Code**: Edit `src/utils/session.ts:getApiUrl()`

### Adjusting Retention Period
Edit `src/utils/storage.ts`:
```typescript
const RETENTION_DAYS = 5; // Change this value
```

### Customizing Themes
Edit `src/index.css` CSS variables:
```css
:root {
  --primary-color: #646cff;  /* Your brand color */
  --bg-color: #ffffff;       /* Background */
  /* ... more variables */
}
```

### Modifying Session ID Format
Edit `src/utils/session.ts:generateSessionId()`

## Dependencies

### Core
- **react**: UI framework
- **react-markdown**: Markdown rendering
- **remark-gfm**: GitHub Flavored Markdown support
- **@microsoft/fetch-event-source**: SSE client

### Utilities
- **uuid**: Unique ID generation
- **js-cookie**: Cookie management

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (geolocation requires HTTPS)
- Mobile browsers: Fully responsive

## Privacy & Security

- All data stored locally (no external servers except chat API)
- Location sharing requires explicit user permission
- No analytics or tracking (except user ID cookie)
- Chats auto-delete after 5 days
- HTTPS recommended for production

## Troubleshooting

### Location Not Working
- Check browser permissions
- Ensure HTTPS in production
- Fallback to IP-based location is automatic

### Chat Not Saving
- Check browser localStorage isn't full
- Verify localStorage isn't disabled
- Check browser console for errors

### SSE Connection Issues
- Verify API endpoint is correct
- Check CORS headers on server
- Ensure server sends proper `text/event-stream` content-type

### Theme Not Persisting
- Check localStorage is enabled
- Verify no browser extensions blocking storage

## Deployment

See `DEPLOYMENT.md` for S3 deployment instructions.

### Production Checklist
- [ ] Set production API endpoint
- [ ] Enable HTTPS
- [ ] Test geolocation permissions
- [ ] Verify CORS configuration
- [ ] Test on target browsers
- [ ] Configure CSP headers (if needed)
