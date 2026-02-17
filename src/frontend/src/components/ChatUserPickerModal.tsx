import { BaseModal } from "./BaseModal";
import { UserAvatar } from "./UserAvatar";
import { useGetChatUserSelectionList } from "../hooks/useQueries";
import { useProfilePicture } from "../hooks/useProfilePicture";
import type { Principal } from "@dfinity/principal";
import type { UserSelection } from "../backend";

interface ChatUserPickerModalProps {
  onClose: () => void;
  onSelectUser: (principal: Principal) => void;
}

function UserListItem({
  user,
  onSelect,
}: {
  user: UserSelection;
  onSelect: () => void;
}) {
  const profilePictureUrl = useProfilePicture(user.principal);

  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center space-x-3 p-3 hover:bg-indigo-50 rounded-lg transition-colors"
    >
      <UserAvatar src={profilePictureUrl} alt={user.displayName} size="md" />
      <div className="flex-1 text-left">
        <p className="font-medium text-gray-800">{user.displayName}</p>
        <p className="text-sm text-gray-500">@{user.username}</p>
      </div>
    </button>
  );
}

export function ChatUserPickerModal({
  onClose,
  onSelectUser,
}: ChatUserPickerModalProps) {
  const { data: users = [], isLoading, error } = useGetChatUserSelectionList();

  return (
    <BaseModal isOpen={true} onClose={onClose} title="Start a chat" size="md">
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full border-b-2 h-8 w-8 border-indigo-500" />
            <span className="ml-2 text-gray-600">Loading users...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Failed to load users</p>
            <p className="text-sm text-gray-500 mt-2">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No users available to chat with</p>
            <p className="text-sm text-gray-400 mt-2">
              Follow some users to start chatting!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <UserListItem
                key={user.principal.toString()}
                user={user}
                onSelect={() => onSelectUser(user.principal)}
              />
            ))}
          </div>
        )}
      </div>
    </BaseModal>
  );
}
