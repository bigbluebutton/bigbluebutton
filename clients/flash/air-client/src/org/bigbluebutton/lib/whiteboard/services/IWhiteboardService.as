package org.bigbluebutton.lib.whiteboard.services {
	
	public interface IWhiteboardService {
		function setupMessageSenderReceiver():void;
		function getAnnotationHistory(whiteboardId:String):void;
		function undoGraphic():void;
		function clearBoard():void;
		function sendShape():void;
	}
}
