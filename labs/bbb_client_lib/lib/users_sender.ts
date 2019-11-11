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

function sendMessage(message: any): void {}

function queryForParticipants(
  meetingId: string,
  userId: string,
  myUserId: string
): void {
  let message = {
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

function queryForGuestsWaiting(
  meetingId: string,
  userId: string,
  requesterId: string
): void {
  let message: Object = {
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

function joinMeeting(
  meetingId: string,
  userId: string,
  myUserId: string,
  authToken: string,
  clientType: string
): void {
  var message: Object = {
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

function joinMeetingAfterReconnect(
  meetingId: string,
  userId: string,
  myUserId: string,
  authToken: string,
  clientType: string
): void {
  let message: Object = {
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

function assignPresenter(
  meetingId: string,
  userId: string,
  requesterId: string,
  newPresenterUserId: string,
  newPresenterName: string,
  assignedBy: string
): void {
  let message: Object = {
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

function emojiStatus(meetingId: string, userId: string, emoji: string): void {
  let message: Object = {
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
