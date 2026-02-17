import { useState, useEffect, useCallback, useRef } from "react";
import { useActor } from "./useActor";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Principal } from "@dfinity/principal";
import type { ChatMessage } from "../backend";

export function usePrivateChat(recipientPrincipal: Principal) {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [conversationId, setConversationId] = useState<bigint | null>(null);
  const lastMessageIdRef = useRef<bigint | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Find or create conversation and load initial messages
  const loadConversation = useCallback(async () => {
    if (!actor) return;

    try {
      setIsLoading(true);

      // Send an initial empty message to create the conversation if it doesn't exist
      // This is a workaround since the backend doesn't have a separate "getOrCreateConversation" method
      // We'll just fetch messages which will return empty array if no conversation exists yet
      
      // Try to find existing conversation by attempting to get messages
      // The backend will trap if conversation doesn't exist, so we need to handle that
      // For now, we'll just set loading to false and wait for first message to be sent
      
      setMessages([]);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading conversation:", error);
      setMessages([]);
      setIsLoading(false);
    }
  }, [actor]);

  // Poll for new messages
  const pollMessages = useCallback(async () => {
    if (!actor || !conversationId) return;

    try {
      const newMessages = await actor.getConversationMessages(
        conversationId,
        lastMessageIdRef.current
      );

      if (newMessages.length > 0) {
        setMessages((prev) => {
          // Deduplicate by message ID
          const existingIds = new Set(prev.map((m) => m.id.toString()));
          const uniqueNew = newMessages.filter(
            (m) => !existingIds.has(m.id.toString())
          );
          return [...prev, ...uniqueNew];
        });

        // Update last message ID
        const lastMessage = newMessages[newMessages.length - 1];
        lastMessageIdRef.current = lastMessage.id;
      }
    } catch (error) {
      console.error("Error polling messages:", error);
    }
  }, [actor, conversationId]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error("Actor not available");
      await actor.sendMessage(recipientPrincipal, content);
    },
    onSuccess: async () => {
      // After sending, we need to find the conversation ID and load messages
      if (!actor) return;

      try {
        // The backend creates conversation on first message
        // We need to poll to get the new message and conversation ID
        // For simplicity, we'll reload all messages after a short delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        // Try to get conversation - we don't have a direct way to get conversation ID
        // So we'll need to track it differently
        // For now, let's just reload by polling
        await pollMessages();
      } catch (error) {
        console.error("Error after sending message:", error);
      }
    },
  });

  // Initialize conversation on mount
  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  // Set up polling when conversation is ready
  useEffect(() => {
    if (!conversationId) return;

    // Start polling every 3 seconds
    pollingIntervalRef.current = setInterval(() => {
      pollMessages();
    }, 3000);

    // Initial poll
    pollMessages();

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [conversationId, pollMessages]);

  // Helper to find conversation ID after sending first message
  const findConversationId = useCallback(async () => {
    if (!actor) return;

    try {
      // We need to iterate through conversations to find ours
      // Since backend doesn't expose a direct method, we'll use a workaround
      // Try conversation IDs starting from 0
      for (let i = 0; i < 1000; i++) {
        try {
          const conv = await actor.getConversation(BigInt(i));
          if (conv) {
            const participants = conv.participants;
            const hasRecipient = participants.some(
              (p) => p.toString() === recipientPrincipal.toString()
            );
            if (hasRecipient) {
              setConversationId(BigInt(i));
              setMessages(conv.messages);
              if (conv.messages.length > 0) {
                lastMessageIdRef.current =
                  conv.messages[conv.messages.length - 1].id;
              }
              return;
            }
          }
        } catch {
          // Conversation doesn't exist or not authorized
          continue;
        }
      }
    } catch (error) {
      console.error("Error finding conversation:", error);
    }
  }, [actor, recipientPrincipal]);

  const sendMessage = async (content: string) => {
    await sendMessageMutation.mutateAsync(content);
    
    // If we don't have a conversation ID yet, find it
    if (!conversationId) {
      await findConversationId();
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
    isSending: sendMessageMutation.isPending,
  };
}
