package org.bigbluebutton.lib.voice.services {
	import org.bigbluebutton.lib.common.models.IMessageListener;
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IMeetingData;
	import org.bigbluebutton.lib.voice.models.VoiceUser;
	
	public class VoiceMessageReceiver implements IMessageListener {
		public var meetingData:IMeetingData;
		
		public var conferenceParameters:IConferenceParameters;
		
		public function VoiceMessageReceiver() {
		}
		
		public function onMessage(messageName:String, message:Object):void {
			switch (messageName) {
				case "GetVoiceUsersMeetingRespMsg":
					handleGetVoiceUsersMeetingRespMsg(message);
					break;
				case "UserJoinedVoiceConfToClientEvtMsg":
					handleUserJoinedVoiceConfToClientEvtMsg(message);
					break;
				case "UserLeftVoiceConfToClientEvtMsg":
					handleUserLeftVoiceConfToClientEvtMsg(message);
					break;
				case "UserTalkingVoiceEvtMsg":
					handleUserTalkingEvtMsg(message);
					break;
				case "UserMutedVoiceEvtMsg":
					handleUserMutedEvtMsg(message);
					break;
			}
		}
		
		private function handleGetVoiceUsersMeetingRespMsg(msg:Object):void {
			var users:Array = msg.body.users as Array;
			
			for (var i:int = 0; i < users.length; i++) {
				addVoiceUser(users[i]);
			}
		}
		
		private function handleUserJoinedVoiceConfToClientEvtMsg(msg:Object):void {
			addVoiceUser(msg.body);
		}
		
		private function addVoiceUser(raw:Object):void {
			var vu:VoiceUser = new VoiceUser();
			vu.intId = raw.intId as String;
			vu.voiceUserId = raw.voiceUserId as String;
			vu.callerName = raw.callerName as String;
			vu.callerNum = raw.callerNum as String;
			vu.muted = raw.muted as Boolean;
			vu.talking = raw.talking as Boolean;
			vu.callingWith = raw.callingWith as String;
			vu.listenOnly = raw.listenOnly as Boolean;
			vu.voiceOnlyUser = raw.intId.indexOf("v_") == 0;
			vu.me = raw.intId == conferenceParameters.internalUserID;
			
			meetingData.voiceUsers.add(vu);
		}
		
		private function handleUserLeftVoiceConfToClientEvtMsg(msg:Object):void {
			var header:Object = msg.header as Object;
			var body:Object = msg.body as Object;
			var intId:String = body.intId as String;
			
			meetingData.voiceUsers.remove(intId);
		}
		
		private function handleUserMutedEvtMsg(msg:Object):void {
			var header:Object = msg.header as Object;
			var body:Object = msg.body as Object;
			var intId:String = body.intId as String;
			var muted:Boolean = body.muted as Boolean;
			
			meetingData.voiceUsers.changeUserMute(intId, muted);
		}
		
		private function handleUserTalkingEvtMsg(msg:Object):void {
			var header:Object = msg.header as Object;
			var body:Object = msg.body as Object;
			var intId:String = body.intId as String;
			var talking:Boolean = body.talking as Boolean;
			
			meetingData.voiceUsers.changeUserTalking(intId, talking);
		}
	}
}
