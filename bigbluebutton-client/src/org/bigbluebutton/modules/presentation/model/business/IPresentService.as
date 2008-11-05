package org.bigbluebutton.modules.presentation.model.business
{
	public interface IPresentService
	{
		function connect():void;
		function disconnect():void;
		function addMessageSender(msgSender:Function):void;
		function addConnectionStatusListener(connectionListener:Function):void;	
		function gotoSlide(num:int):void;
		function sharePresentation(share:Boolean):void;	
		function zoom(slideHeight:Number, slideWidth:Number):void;
		function move(slideXPosition:Number, slideYPosition:Number):void;
		function getCurrentSlideNumber():void;
	}
}