package org.bigbluebutton.common
{
	import flash.display.DisplayObject;
	
	public interface IBbbCanvas
	{
		function addRawChild(child:DisplayObject):void;
		function removeRawChild(child:DisplayObject):void;
		function doesContain(child:DisplayObject):Boolean;
		function acceptOverlayCanvas(overlay:IBbbCanvas):void;
		function moveCanvas(x:int, y:int):void;
		function zoomCanvas(width:int, height:int):void;
		function showCanvas(show:Boolean):void;
	}
}