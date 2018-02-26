package org.bigbluebutton.lib.screenshare.services
{
	import flash.net.NetConnection;
	
	import org.osflash.signals.ISignal;

	public interface IScreenshareConnection
	{
		function get connectionFailureSignal():ISignal;
		function get connectionSuccessSignal():ISignal;
		//function set uri(uri:String):void;
		//function get uri():String;
		function get connection():NetConnection;
		function connect():void;
		function disconnect(onUserCommand:Boolean):void;
	}
}