package org.bigbluebutton.modules.voiceconference.model.service
{
	public interface IVoiceService
	{
		function connect(uri:String):void;
		function disconnect():void;
		function sendMessage(message:String):void;
		function addMessageListener(msgListener:Function):void;
		function addConnectionStatusListener(connectionListener:Function):void;
	}
}