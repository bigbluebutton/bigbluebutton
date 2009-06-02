package org.bigbluebutton.modules.chat.model.business
{
	public interface IChatService
	{
		function join():void;
		function leave():void;
		function sendMessage(message:String):void;
		function getChatTranscript():void;
		function addMessageListener(msgListener:Function):void;
		function addConnectionStatusListener(connectionListener:Function):void;
	}
}