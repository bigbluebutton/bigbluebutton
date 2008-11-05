package org.bigbluebutton.modules.chat.model.business
{
	public interface IChatService
	{
		function connect(uri:String):void;
		function disconnect():void;
		function sendMessage(message:String):void;
		function addMessageListener(msgListener:Function):void;
		function addConnectionStatusListener(connectionListener:Function):void;
	}
}