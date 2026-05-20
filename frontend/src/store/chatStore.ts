import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  session_id: string;
  message: string;
  sender: 'user' | 'ai';
  context_used_json?: any;
  created_at: string;
}

interface ChatState {
  messages: ChatMessage[];
  sessionId: string;
  isSending: boolean;
  setMessages: (msgs: ChatMessage[]) => void;
  addMessage: (msg: ChatMessage) => void;
  setSending: (sending: boolean) => void;
  setSessionId: (id: string) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  sessionId: "session_" + Math.random().toString(36).substring(2, 11),
  isSending: false,
  setMessages: (msgs) => set({ messages: msgs }),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setSending: (sending) => set({ isSending: sending }),
  setSessionId: (id) => set({ sessionId: id }),
  clearChat: () => set({ messages: [] })
}));
