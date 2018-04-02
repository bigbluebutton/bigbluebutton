package org.bigbluebutton.air.main.models {
	import org.bigbluebutton.air.main.services.IBigBlueButtonConnection;
	import org.bigbluebutton.air.presentation.models.PresentationList;
	import org.bigbluebutton.air.screenshare.services.IScreenshareConnection;
	import org.bigbluebutton.air.video.models.VideoProfileManager;
	import org.bigbluebutton.air.video.services.IVideoConnection;
	import org.bigbluebutton.air.voice.models.PhoneOptions;
	import org.bigbluebutton.air.voice.services.IVoiceConnection;
	import org.bigbluebutton.air.voice.services.VoiceStreamManager;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public interface IUserSession {
		function get videoAutoStart():Boolean;
		function set videoAutoStart(value:Boolean):void;
		function get skipCamSettingsCheck():Boolean;
		function set skipCamSettingsCheck(value:Boolean):void;
		function get config():Config;
		function set config(value:Config):void;
		function get userId():String;
		function set userId(value:String):void;
		function get phoneOptions():PhoneOptions;
		function set phoneOptions(value:PhoneOptions):void;
		function get voiceConnection():IVoiceConnection;
		function set voiceConnection(value:IVoiceConnection):void;
		function get mainConnection():IBigBlueButtonConnection;
		function set mainConnection(value:IBigBlueButtonConnection):void;
		function get voiceStreamManager():VoiceStreamManager;
		function set voiceStreamManager(value:VoiceStreamManager):void;
		function get videoConnection():IVideoConnection;
		function set videoConnection(value:IVideoConnection):void;
		function get screenshareConnection():IScreenshareConnection;
		function set screenshareConnection(value:IScreenshareConnection):void;
		function get presentationList():PresentationList;
		function get assignedDeskshareSignal():ISignal;
		function get logoutSignal():Signal;
		function get videoProfileManager():VideoProfileManager
		function set videoProfileManager(value:VideoProfileManager):void;
		function get authTokenSignal():ISignal
		function get lockSettings():LockSettings;
		function set meetingMuted(mute:Boolean):void;
		function get meetingMuted():Boolean;
		function get pushToTalk():Boolean;
		function set pushToTalk(value:Boolean):void;
		function get pushToTalkSignal():ISignal;
	}
}
