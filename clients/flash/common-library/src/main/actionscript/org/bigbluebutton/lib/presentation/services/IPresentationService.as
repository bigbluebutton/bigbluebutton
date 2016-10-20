package org.bigbluebutton.lib.presentation.services {
	
	public interface IPresentationService {
		function setupMessageSenderReceiver():void;
		function getPresentationInfo():void;
		function gotoSlide(id:String):void;
		function move(xOffset:Number, yOffset:Number, widthRatio:Number, heightRatio:Number):void;
		function removePresentation(name:String):void;
		function sendCursorUpdate(xPercent:Number, yPercent:Number):void;
		function sharePresentation(share:Boolean, presentationName:String):void;
	}
}
