import { BaseModal } from "./BaseModal";
import { UserAvatar } from "./UserAvatar";
import { usePrivateChat } from "../hooks/usePrivateChat";
import { useProfilePicture } from "../hooks/useProfilePicture";
import { useGetUserProfileWithStats } from "../hooks/useQueries";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { Send, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { Principal } from "@dfinity/principal";

interface PrivateChatModalProps {
  recipientPrincipal: Principal;
  onClose: () => void;
}

export function PrivateChatModal({
  recipientPrincipal,
  onClose,
}: PrivateChatModalProps) {
  const { identity } = useInternetIdentity();
  const currentUserPrincipal = identity?.getPrincipal();

  const { data: recipientProfile } =
    useGetUserProfileWithStats(recipientPrincipal);
  const recipientProfilePictureUrl = useProfilePicture(recipientPrincipal);

  const { messages, isLoading, sendMessage, isSending } = usePrivateChat(
    recipientPrincipal
  );

  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || isSending) return;

    const text = messageText.trim();
    setMessageText("");
    await sendMessage(text);
  };

  const isOwnMessage = (senderPrincipal: Principal) => {
    if (!currentUserPrincipal) return false;
    return senderPrincipal.toString() === currentUserPrincipal.toString();
  };

  const chatTitle = recipientProfile
    ? `${recipientProfile.displayName}${recipientProfile.username ? ` (@${recipientProfile.username})` : ""}`
    : "Chat";

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      title={chatTitle}
      size="lg"
    >
      <div className="flex flex-col h-[500px]">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="ml-2 text-gray-600">Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No messages yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Start a conversation by sending a message!
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => {
                const isOwn = isOwnMessage(message.sender);
                return (
                  <div
                    key={message.id.toString()}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isOwn
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <p className="text-sm break-words">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwn ? "text-indigo-200" : "text-gray-500"
                        }`}
                      >
                        {new Date(
                          Number(message.timestamp) / 1000000
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={!messageText.trim() || isSending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </BaseModal>
  );
}
