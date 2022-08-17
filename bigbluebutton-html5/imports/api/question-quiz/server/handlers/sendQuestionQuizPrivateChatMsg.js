import GroupChat from '/imports/api/group-chat';
import createGroupChat from '/imports/api/group-chat/server/methods/createGroupChat';
import sendGroupChatMsg from '/imports/api/group-chat-msg/server/methods/sendGroupChatMsg'
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';
import QuestionApiService from '../service'
import Fiber from 'fibers';

export default function sendQuestionQuizPrivateChatMsg(currentUserId, question, responses, answers, messageLabels, notAttemptedUsers) {
    check(currentUserId, String);
    check(question, String);
    check(responses, Array);
    check(answers, Array);
    check(messageLabels, Object)
    check(notAttemptedUsers, Array)
    const CHAT_CONFIG = Meteor.settings.public.chat;
    const CHAT_EMPHASIZE_TEXT = CHAT_CONFIG.moderatorChatEmphasized;
    function sleep(ms) {
        var fiber = Fiber.current;
        setTimeout(function () {
            fiber.run();
        }, ms);
        Fiber.yield();
    }
    try {
        notAttemptedUsers.forEach((userId) => responses.push({
            userId,
            answerIds: []
        }))
        const { requesterUserId: senderId } = extractCredentials(currentUserId);
        responses.forEach((res) => {
            const receiverId = res.userId
            const receiver = {
                userId: receiverId
            }
            let hasPrivateChatBetweenUsers = GroupChat
                .findOne({ users: { $all: [receiverId, senderId] } })
            let isGroupChatCreated = hasPrivateChatBetweenUsers ? true : false;
            if (!hasPrivateChatBetweenUsers) {
                isGroupChatCreated = createGroupChat(receiver, currentUserId)
            }
            if (isGroupChatCreated) {
                sleep(200);
                hasPrivateChatBetweenUsers = GroupChat
                    .findOne({ users: { $all: [receiverId, senderId] } })
                const messageData = {
                    userResponse : res,
                    answers,
                    messageLabels,
                    question,
                }
                const message = QuestionApiService.generatePrivateChatMessageOfQuestionResult(messageData)
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