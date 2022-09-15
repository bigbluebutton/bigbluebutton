import GroupChat from '/imports/api/group-chat';
import sendGroupChatMsg from '/imports/api/group-chat-msg/server/methods/sendGroupChatMsg'
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';
import QuestionApiService from '../service'

export default function sendQuestionQuizPrivateChatMsg(currentUserId, question, responses, answers, messageLabels, isQuestionQuizPublished) {
    check(currentUserId, String);
    check(question, String);
    check(responses, Array);
    check(answers, Array);
    check(messageLabels, Object)
    const CHAT_CONFIG = Meteor.settings.public.chat;
    const CHAT_EMPHASIZE_TEXT = CHAT_CONFIG.moderatorChatEmphasized;
    try {
        const { requesterUserId: senderId } = extractCredentials(currentUserId);
        responses.forEach((res) => {
            const receiverId = res.userId
            let hasPrivateChatBetweenUsers = GroupChat
                .findOne({ users: { $all: [receiverId, senderId] } })
            if (hasPrivateChatBetweenUsers) {
                const messageData = {
                    userResponse : res,
                    answers,
                    messageLabels,
                    question,
                }
                const message = QuestionApiService.generatePrivateChatMessageOfQuestionResult(messageData, isQuestionQuizPublished)
                const payload = {
                    correlationId: `${senderId}-${Date.now()}`,
                    sender: {
                        id: senderId,
                        name: '',
                        role: '',
                    },
                    chatEmphasizedText: CHAT_EMPHASIZE_TEXT,
                    message,
                };
                sendGroupChatMsg(hasPrivateChatBetweenUsers.chatId, payload, currentUserId);
            }
        })
    } catch (err) {
        Logger.error(`Exception while invoking method sendQuestionQuizPrivateChatMsg ${err.stack}`);
    }
}