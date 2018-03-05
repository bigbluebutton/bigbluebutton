package org.bigbluebutton.air.screenshare.services
{
	import flash.net.NetConnection;
	
	import org.bigbluebutton.air.common.models.IMessageListener;
	import org.osflash.signals.ISignal;

	public interface IScreenshareConnection
	{
		function get connectionFailureSignal():ISignal;
		function get connectionSuccessSignal():ISignal;
		function set uri(uri:String):void;
		function get uri():String;
		function get connection():NetConnection;
		function connect():void;
		function disconnect(onUserCommand:Boolean):void;
		function isTunnelling():Boolean
			
		function isScreenSharing(meetingId:String):void;
		function restartShareRequest(meetingId:String, userId:String):void;
		function pauseShareRequest(meetingId:String, userId:String, streamId:String):void;
		function requestShareToken(meetingId:String, userId:String, record:Boolean, tunnel: Boolean):void;
		function startShareRequest(meetingId:String, userId:String, session:String):void;
		function stopShareRequest(meetingId:String, streamId:String):void;
		function sendClientPongMessage(meetingId:String, session:String, timestamp: Number):void;
		
		function addMessageListener(listener:IMessageListener):void
		function removeMessageListener(listener:IMessageListener):void
	}
}