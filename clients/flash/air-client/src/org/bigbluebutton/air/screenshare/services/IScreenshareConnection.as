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
		
		function addMessageListener(listener:IMessageListener):void
		function removeMessageListener(listener:IMessageListener):void
	}
}