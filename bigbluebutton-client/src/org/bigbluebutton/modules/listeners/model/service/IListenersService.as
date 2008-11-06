package org.bigbluebutton.modules.listeners.model.service
{
	public interface IListenersService
	{
		function connect(uri:String):void;
		function disconnect():void;
		function sendMessage(message:String):void;
		function addMessageListener(msgListener:Function):void;
		function addConnectionStatusListener(connectionListener:Function):void;		
	}
}