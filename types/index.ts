export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface AIProvider {
  id: string;
  name: string;
  subtitle: string;
  model: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  icon: string;
  gradientColors: [string, string, string];
  isAvailable: boolean;
  badge?: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}
