package org.bigbluebutton.lib.whiteboard.services {
	
	public interface IWhiteboardService {
		function setupMessageSenderReceiver():void;
		function getAnnotationHistory(presentationID:String, pageNumber:int):void;
		function changePage(pageNum:Number):void;
		function undoGraphic():void;
		function clearBoard():void;
		function sendText():void;
		function sendShape():void;
		function setActivePresentation():void;
	}
}
