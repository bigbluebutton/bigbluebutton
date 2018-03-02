package org.bigbluebutton.lib.common.services {
	
	import flash.net.NetConnection;
	
	import org.osflash.signals.ISignal;
	
	public interface IBaseConnection {
		function get connection():NetConnection;
		function connect(uri:String, ... parameters):void;
		function disconnect(onUserCommand:Boolean):void;
		function sendMessage2x(onSuccess:Function, onFailure:Function, message:Object):void;
		function sendMessageAsObject(remoteMethod: String, onSuccess:Function, onFailure:Function, message:Object):void;
		function init(callback:DefaultConnectionCallback):void;
		function get connectionSuccessSignal():ISignal;
		function get connectionFailureSignal():ISignal;
	}
}
