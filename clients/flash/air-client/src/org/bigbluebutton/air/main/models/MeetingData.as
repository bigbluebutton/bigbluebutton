package org.bigbluebutton.air.main.models {
	import org.bigbluebutton.air.user.models.Users2x;
	import org.bigbluebutton.air.video.models.Webcams;
	import org.bigbluebutton.air.voice.models.VoiceUsers;
	
	public class MeetingData implements IMeetingData {
		private var _users:Users2x = new Users2x();
		
		public function get users():Users2x {
			return _users;
		}
		
		private var _webcams:Webcams = new Webcams();
		
		public function get webcams():Webcams {
			return _webcams;
		}
		
		private var _voiceUsers:VoiceUsers = new VoiceUsers();
		
		public function get voiceUsers():VoiceUsers {
			return _voiceUsers;
		}
		//public var guestsWaiting: GuestsApp = new GuestsApp();
		
		private var _meetingStatus:MeetingStatus = new MeetingStatus();
		
		public function get meetingStatus():MeetingStatus {
			return _meetingStatus;
		}
	
		//public var meeting: Meeting = new Meeting();
		//public var config: Config;
		//public var sharedNotes: SharedNotes = new SharedNotes();
	
		//public var breakoutRooms: BreakoutRooms = new BreakoutRooms();
		//public var whiteboardModel: WhiteboardModel = new WhiteboardModel();
	}
}
