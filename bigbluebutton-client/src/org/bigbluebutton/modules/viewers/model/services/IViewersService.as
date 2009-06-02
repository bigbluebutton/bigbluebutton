package org.bigbluebutton.modules.viewers.model.services
{
	import flash.net.NetConnection;
	
	import org.bigbluebutton.modules.viewers.model.vo.Status;
	
	public interface IViewersService
	{
		function connect(username:String, role:String, conference:String, mode:String, room:String):void;
		function disconnect():void;
		function addConnectionStatusListener(connectionListener:Function):void;	
//		function iAmPresenter(userid:Number, presenter:Boolean):void;
//		function newStatus(userid:Number, newStatus:Status):void;
//		function changeStatus(userid:Number, newStatus:Status):void;
//		function removeStatus(userid:Number, statusName:String):void;
		function raiseHand(userid:Number, raise:Boolean):void;
		function addStream(userid:Number, streamName:String):void;
		function removeStream(userid:Number, streamName:String):void;
		function addMessageSender(msgSender:Function):void;
		function assignPresenter(userid:Number, assignedBy:Number):void; 
//		function queryPresenter():void;	
		
		function get connection():NetConnection;
	}
}