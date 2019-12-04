package org.bigbluebutton.air.presentation.services {
	
	public interface IPresentationService {
		function setupMessageSenderReceiver():void;
		function getPresentationPods():void;
		function setCurrentPage(podId:String, presentationId: String, pageId: String):void;
		function move(podId:String, presentationId:String, pageId:String, xOffset:Number, yOffset:Number, widthRatio:Number, heightRatio:Number):void;
		function removePresentation(podId:String, presentationId:String):void;
		function setCurrentPresentation(podId:String, presentationId:String):void;
	}
}
