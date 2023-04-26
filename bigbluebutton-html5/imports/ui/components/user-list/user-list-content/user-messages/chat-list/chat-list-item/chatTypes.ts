interface Chat {
    chatId: string,
    meetingId: string,
    participant: Participant,
    totalUnread: number,
    totalMessages: number,
    public: boolean,
};

interface Participant {
    name: string,
    role: string,
    color: string,
    loggedOut: boolean,
    avatar: string,
};

export { Chat };
