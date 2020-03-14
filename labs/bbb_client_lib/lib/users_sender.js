/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 *
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 */
function sendMessage(message) { }
function queryForParticipants(meetingId, userId, myUserId) {
    var message = {
        header: {
            name: "GetUsersMeetingReqMsg",
            meetingId: meetingId,
            userId: userId
        },
        body: {
            userId: userId
        }
    };
    sendMessage(message);
}
function queryForGuestsWaiting(meetingId, userId, requesterId) {
    var message = {
        header: {
            name: "GetGuestsWaitingApprovalReqMsg",
            meetingId: meetingId,
            userId: userId
        },
        body: {
            requesterId: requesterId
        }
    };
    sendMessage(message);
}
function joinMeeting(meetingId, userId, myUserId, authToken, clientType) {
    var message = {
        header: {
            name: "UserJoinMeetingReqMsg",
            meetingId: meetingId,
            userId: userId
        },
        body: {
            userId: myUserId,
            authToken: authToken,
            clientType: clientType
        }
    };
    sendMessage(message);
}
function joinMeetingAfterReconnect(meetingId, userId, myUserId, authToken, clientType) {
    var message = {
        header: {
            name: "UserJoinMeetingAfterReconnectReqMsg",
            meetingId: meetingId,
            userId: userId
        },
        body: {
            userId: myUserId,
            authToken: authToken,
            clientType: clientType
        }
    };
    sendMessage(message);
}
function assignPresenter(meetingId, userId, requesterId, newPresenterUserId, newPresenterName, assignedBy) {
    var message = {
        header: {
            name: "AssignPresenterReqMsg",
            meetingId: meetingId,
            userId: userId
        },
        body: {
            requesterId: requesterId,
            newPresenterId: newPresenterUserId,
            newPresenterName: newPresenterName,
            assignedBy: assignedBy
        }
    };
    sendMessage(message);
}
function emojiStatus(meetingId, userId, emoji) {
    var message = {
        header: {
            name: "ChangeUserEmojiCmdMsg",
            meetingId: meetingId,
            userId: userId
        },
        body: {
            userId: userId,
            emoji: emoji
        }
    };
    sendMessage(message);
}
