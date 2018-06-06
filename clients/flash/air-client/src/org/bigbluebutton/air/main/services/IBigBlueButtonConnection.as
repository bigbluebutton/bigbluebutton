package org.bigbluebutton.air.main.services {
	
	import flash.net.NetConnection;
	
	import org.bigbluebutton.air.common.models.IMessageListener;
	import org.bigbluebutton.air.main.models.IConferenceParameters;
	import org.osflash.signals.ISignal;
	
	public interface IBigBlueButtonConnection {
		function set uri(uri:String):void;
		function get uri():String;
		function get connection():NetConnection;
		function connect(params:IConferenceParameters, tunnel:Boolean = false):void;
		function disconnect(logoutOnUserCommand:Boolean):void;
		function sendMessage(service:String, onSuccess:Function, onFailure:Function, message:Object = null):void;
		function sendMessage2x(onSuccess:Function, onFailure:Function, message:Object):void;
		function get connectionFailureSignal():ISignal;
		function get connectionSuccessSignal():ISignal;
		function addMessageListener(listener:IMessageListener):void
		function removeMessageListener(listener:IMessageListener):void
	}
}
