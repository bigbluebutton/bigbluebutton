/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2017 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.core.model
{
  import org.bigbluebutton.core.model.users.GuestsApp;
  import org.bigbluebutton.core.model.users.Users2x;
  import org.bigbluebutton.core.model.users.VoiceUsers2x;
  import org.bigbluebutton.modules.chat.model.ChatModel;
  import org.bigbluebutton.modules.whiteboard.models.WhiteboardModel;
  
  public class LiveMeeting
  {
    private static var instance: LiveMeeting = null;
    
    public var me: Me = new Me();
    public var webcams: Webcams = new Webcams();
    public var voiceUsers: VoiceUsers2x = new VoiceUsers2x();
    public var users: Users2x = new Users2x();
    public var guestsWaiting: GuestsApp = new GuestsApp();
    public var meetingStatus: MeetingStatus = new MeetingStatus();
    public var meeting: Meeting = new Meeting();
    public var config: Config;
    public var sharedNotes: SharedNotes = new SharedNotes();
    public var chats: ChatModel = new ChatModel();
    
    public var breakoutRooms: BreakoutRooms = new BreakoutRooms();
    public var whiteboardModel: WhiteboardModel = new WhiteboardModel();
    
    public function LiveMeeting(enforcer: LiveMeetingSingletonEnforcer)
    {
      if (enforcer == null){
        throw new Error("There can only be 1 LiveMeeting instance");
      }
    }
    
    public static function inst():LiveMeeting{
      if (instance == null){
        instance = new LiveMeeting(new LiveMeetingSingletonEnforcer());
      }
      return instance;
    }
  }
}

class LiveMeetingSingletonEnforcer{}