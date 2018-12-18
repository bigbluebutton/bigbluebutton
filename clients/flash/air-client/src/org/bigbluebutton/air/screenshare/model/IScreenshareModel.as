package org.bigbluebutton.air.screenshare.model {
	import org.osflash.signals.ISignal;
	
	public interface IScreenshareModel {
		function get screenshareStreamStartedSignal():ISignal;
		function get screenshareStreamStoppedSignal():ISignal;
		
		function get isSharing():Boolean;
		
		function get width():int;
		
		function get height():int;
		
		function get url():String;
		
		function get streamId():String;
	
		function get session():String;
		
		
		// Handles query from server that presenter is currently sharing screen.
		function screenshareStreamStarted(streamId:String, width:int, height:int, url:String, session:String):void;
		
		function screenshareStreamStopped(session:String, reason:String):void;
		
		function screenshareStreamPaused(session:String):void;
	}
}
