package org.bigbluebutton.lib.presentation.services {
	
	public interface IPresentationService {
		function setupMessageSenderReceiver():void;
		function getPresentationInfo():void;
		function setCurrentPage(presentationId: String, pageId: String):void;
		function move(presentationId:String, pageId:String, xOffset:Number, yOffset:Number, widthRatio:Number, heightRatio:Number):void;
		function removePresentation(presentationId:String):void;
		function setCurrentPresentation(presentationId:String):void;
	}
}
