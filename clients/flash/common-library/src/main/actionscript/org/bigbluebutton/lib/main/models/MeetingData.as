package org.bigbluebutton.lib.main.models {
	import org.bigbluebutton.lib.user.models.Users2x;
	
	public class MeetingData implements IMeetingData {
		private var _users:Users2x = new Users2x();
		
		public function get users():Users2x {
			return _users;
		}
		
		//public var webcams: Webcams = new Webcams();
		//public var voiceUsers: VoiceUsers2x = new VoiceUsers2x();
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
