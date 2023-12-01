import { ChatRoom, Message, Profile, UserChatRoom } from "@prisma/client";

type ChatRoomResponse = UserChatRoom & {
  chatRoom: ChatRoom & {
    users: {
      user: {
        profile: Profile;
      };
    }[];
    messages: Message[];
  };
};

export const getChatRoomResponse = (chatRoom: ChatRoomResponse) => {
  const { chatRoomId, chatRoom: room, unreadMessageCount } = chatRoom;

  return {
    id: chatRoomId,
    opponentProfile: room.users[0].user.profile,
    lastMessage: room.messages[0] ?? null,
    unreadMessageCount,
    updatedAt: room.updatedAt,
  };
};
