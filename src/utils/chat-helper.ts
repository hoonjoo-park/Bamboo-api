import { ChatRoom, Message, Profile, UserChatRoom } from "@prisma/client";

type ChatRoomResponse = UserChatRoom & {
  chatRoom: ChatRoom & {
    users: {
      user: {
        profile: Profile;
      };
    }[];
    messages: MessageResponse[];
  };
};

interface MessageResponse extends Message {
  sender: {
    profile: Profile;
  };
}

export const getMessageResponse = (message?: MessageResponse) => {
  if (!message) {
    return null;
  }

  return {
    id: message.id,
    chatRoomId: message.chatRoomId,
    content: message.content,
    createdAt: message.createdAt,
    senderProfile: message.sender.profile,
  };
};

export const getChatRoomResponse = (chatRoom: ChatRoomResponse) => {
  const { chatRoomId, chatRoom: room, unreadMessageCount } = chatRoom;

  return {
    id: chatRoomId,
    senderProfile: room.users[0].user.profile,
    lastMessage: getMessageResponse(room.messages[0]),
    unreadMessageCount,
    updatedAt: room.updatedAt,
  };
};
