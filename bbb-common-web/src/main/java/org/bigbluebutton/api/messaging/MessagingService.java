/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * <p>
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 * <p>
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * <p>
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * <p>
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 */

package org.bigbluebutton.api.messaging;


import org.bigbluebutton.presentation.messages.IDocConversionMsg;
import org.bigbluebutton.web.services.turn.StunServer;
import org.bigbluebutton.web.services.turn.TurnEntry;

import java.util.Map;
import java.util.Set;

public interface MessagingService {
  void recordMeetingInfo(String meetingId, Map<String, String> info);

  void recordBreakoutInfo(String meetingId, Map<String, String> breakoutInfo);

  void addBreakoutRoom(String parentId, String breakoutId);
/*
  void send(String channel, String message);

  void publishRecording(String recordId, String meetingId, String externalMeetingId, String format, boolean publish);

  void deleteRecording(String recordId, String meetingId, String externalMeetingId, String format);

  void createMeeting(String meetingID, String externalMeetingID,
                     String parentMeetingID, String meetingName, Boolean recorded,
                     String voiceBridge, Integer duration, Boolean autoStartRecording,
                     Boolean allowStartStopRecording, Boolean webcamsOnlyForModerator,
                     String moderatorPass, String viewerPass, Long createTime,
                     String createDate, Boolean isBreakout, Integer sequence,
                     Map<String, String> metadata, String guestPolicy);

  void registerUser(String meetingID, String internalUserId, String fullname, String role,
                    String externUserID, String authToken, String avatarURL, Boolean guest, Boolean authed);

  void destroyMeeting(String meetingID);

  void endMeeting(String meetingId);

  void sendKeepAlive(String system, Long timestamp);

  void sendStunTurnInfo(String meetingId, String internalUserId, Set<StunServer> stuns, Set<TurnEntry> turns);

  void sendDocConversionMsg(IDocConversionMsg msg);
  */
}
