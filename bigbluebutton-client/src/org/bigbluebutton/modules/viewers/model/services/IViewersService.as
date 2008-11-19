package org.bigbluebutton.modules.viewers.model.services
{
	import org.bigbluebutton.modules.viewers.model.vo.Status;
	
	public interface IViewersService
	{
		function connect(uri:String, room:String, username:String, password:String):void;
		function disconnect():void;
		function addConnectionStatusListener(connectionListener:Function):void;	
		function iAmPresenter(userid:Number, presenter:Boolean):void;
		function newStatus(userid:Number, newStatus:Status):void;
		function changeStatus(userid:Number, newStatus:Status):void;
		function removeStatus(userid:Number, statusName:String):void;
//		function sendBroadcastStream(userid:Number, hasStream:Boolean, streamName:String):void;
		function addMessageSender(msgSender:Function):void;
		function assignPresenter(userid:Number, assignedBy:Number):void; 
		function queryPresenter():void;	
	}
}