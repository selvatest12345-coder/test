import { useState, useCallback } from 'react';
import { Message, ChatState } from '@/types';

const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

// Simulated AI responses for demo — replace with real API calls
const DEMO_RESPONSES: Record<string, string[]> = {
  chatgpt: [
    "That's a fascinating question! As GPT-4o, I can provide a comprehensive answer drawing from my extensive training data.",
    "Great point! Let me break that down for you with clear examples and actionable insights.",
    "I understand what you're asking. Here's my analysis based on the latest information available to me.",
  ],
  gemini: [
    "Interesting query! As Gemini 1.5 Pro, I'll approach this multimodally, combining text understanding with broader context.",
    "Thanks for asking! Google's training has given me a unique perspective on this topic that I'm happy to share.",
    "Let me think through this carefully. My training on diverse data allows me to offer a nuanced perspective here.",
  ],
  claude: [
    "I'd be happy to help with that! Let me think through this carefully and give you a thoughtful, accurate response.",
    "That's a great question. I'll try to be both helpful and honest about what I know and don't know here.",
    "Let me reason through this step by step to make sure I give you the most useful answer possible.",
  ],
  llama: [
    "As an open-source model from Meta, I approach this with transparency. Here's what my training suggests about this topic.",
    "Great question! Being built on open research, I can explain my reasoning process more openly than some other models.",
    "I'll give you a direct answer based on my training. Feel free to verify anything I say independently.",
  ],
  mistral: [
    "Bonjour! As Mistral Large, I'll provide a precise and efficient answer — clarity is one of my core strengths.",
    "Excellent question. My European training data gives me a distinctive global perspective on this matter.",
    "Let me address that directly. Mistral models are known for efficiency, so here's a concise but complete answer.",
  ],
  grok: [
    "Good one! Unlike some AI assistants, I'll give you a direct answer without unnecessary hedging or corporate speak.",
    "Real talk: here's what I actually think about this, with real-time context from my xAI training.",
    "I love questions like this. Let me give you an unfiltered, honest take that you might not hear elsewhere.",
  ],
};

const getSimulatedResponse = (providerId: string): Promise<string> => {
  return new Promise((resolve) => {
    const responses = DEMO_RESPONSES[providerId] || DEMO_RESPONSES.chatgpt;
    const response = responses[Math.floor(Math.random() * responses.length)];
    // Simulate network delay
    setTimeout(() => resolve(response), 800 + Math.random() * 1200);
  });
};

export function useChat(providerId: string) {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || state.isLoading) return;

      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };

      const assistantMessageId = generateId();
      const streamingMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage, streamingMessage],
        isLoading: true,
        error: null,
      }));

      try {
        const response = await getSimulatedResponse(providerId);

        // Simulate streaming by revealing characters gradually
        let currentIndex = 0;
        const streamInterval = setInterval(() => {
          currentIndex = Math.min(currentIndex + 4, response.length);
          setState((prev) => ({
            ...prev,
            messages: prev.messages.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: response.slice(0, currentIndex), isStreaming: currentIndex < response.length }
                : msg
            ),
          }));
          if (currentIndex >= response.length) {
            clearInterval(streamInterval);
            setState((prev) => ({
              ...prev,
              isLoading: false,
              messages: prev.messages.map((msg) =>
                msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg
              ),
            }));
          }
        }, 30);
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Failed to get response. Please try again.',
          messages: prev.messages.filter((msg) => msg.id !== assistantMessageId),
        }));
      }
    },
    [providerId, state.isLoading]
  );

  const clearMessages = useCallback(() => {
    setState({ messages: [], isLoading: false, error: null });
  }, []);

  return { ...state, sendMessage, clearMessages };
}
