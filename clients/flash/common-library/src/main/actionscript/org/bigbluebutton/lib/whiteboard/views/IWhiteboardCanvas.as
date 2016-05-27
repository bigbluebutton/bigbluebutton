package org.bigbluebutton.lib.whiteboard.views {
	import mx.core.IVisualElement;
	
	public interface IWhiteboardCanvas {
		function set resizeCallback(callback:Function):void;
		function get resizeCallback():Function;
		function get width():Number;
		function get height():Number;
		function addElement(element:IVisualElement):IVisualElement;
		function removeElement(element:IVisualElement):IVisualElement;
		function removeAllElements():void;
		function containsElement(element:IVisualElement):Boolean;
	}
}
