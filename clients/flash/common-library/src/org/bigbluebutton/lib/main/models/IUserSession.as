package org.bigbluebutton.lib.main.models {
	
	import org.bigbluebutton.lib.deskshare.services.IDeskshareConnection;
	import org.bigbluebutton.lib.main.services.IBigBlueButtonConnection;
	import org.bigbluebutton.lib.presentation.models.PresentationList;
	import org.bigbluebutton.lib.user.models.UserList;
	import org.bigbluebutton.lib.video.services.IVideoConnection;
	import org.bigbluebutton.lib.voice.services.IVoiceConnection;
	import org.bigbluebutton.lib.voice.services.VoiceStreamManager;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public interface IUserSession {
		function get config():Config;
		function set config(value:Config):void;
		function get userId():String;
		function set userId(value:String):void;
		function get userList():UserList;
		function get voiceConnection():IVoiceConnection;
		function set voiceConnection(value:IVoiceConnection):void;
		function get mainConnection():IBigBlueButtonConnection;
		function set mainConnection(value:IBigBlueButtonConnection):void;
		function get voiceStreamManager():VoiceStreamManager;
		function set voiceStreamManager(value:VoiceStreamManager):void;
		function get videoConnection():IVideoConnection;
		function set videoConnection(value:IVideoConnection):void;
		function get deskshareConnection():IDeskshareConnection;
		function set deskshareConnection(value:IDeskshareConnection):void;
		function get presentationList():PresentationList;
		function get guestSignal():ISignal;
		function get successJoiningMeetingSignal():ISignal;
		function get failureJoiningMeetingSignal():ISignal;
		function get logoutSignal():Signal;
		function get recordingStatusChangedSignal():ISignal;
		function joinMeetingResponse(msg:Object):void;
		function recordingStatusChanged(recording:Boolean):void;
	}
}
