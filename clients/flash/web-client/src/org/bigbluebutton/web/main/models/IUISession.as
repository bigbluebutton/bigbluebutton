package org.bigbluebutton.web.main.models {
	import org.osflash.signals.Signal;
	
	public interface IUISession {
		function get loading():Boolean;
		function get loadingMessage():String;
		function get loadingChangeSignal():Signal;
		function setLoading(val:Boolean, message:String):void;
		function get participantsOpen():Boolean;
		function set participantsOpen(val:Boolean):void;
		function get participantsOpenSignal():Signal;
	}
}
