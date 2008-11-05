package org.bigbluebutton.modules.viewers.model.services
{
	public interface IViewersService
	{
		function connect(uri:String, room:String, username:String, password:String):void;
		function disconnect():void;
		function addConnectionStatusListener(connectionListener:Function):void;	
		function sendNewStatus(userid:Number, newStatus:String):void;
		function sendBroadcastStream(userid:Number, hasStream:Boolean, streamName:String):void;
		function addMessageSender(msgSender:Function):void;
		function assignPresenter(userid:Number, assignedBy:Number):void; 	
	}
}