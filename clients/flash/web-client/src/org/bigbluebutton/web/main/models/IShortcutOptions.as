package org.bigbluebutton.web.main.models {
	import org.osflash.signals.Signal;
	
	public interface IShortcutOptions {
		function initKeys():void;
		function get usersActive():Boolean;
		function get videoDockActive():Boolean;
		function get presentationActive():Boolean;
		function get chatActive():Boolean;
		function get pollingActive():Boolean;
		function get webcamActive():Boolean;
		function get deskshareActive():Boolean;
		function get audioActive():Boolean;
		function get genResource():Array;
	}
}
