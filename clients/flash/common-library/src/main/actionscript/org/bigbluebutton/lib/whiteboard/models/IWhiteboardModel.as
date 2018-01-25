package org.bigbluebutton.lib.whiteboard.models {
	public interface IWhiteboardModel {
		function getWhiteboard(wbId:String, requestHistory:Boolean=true):Whiteboard;
		function addAnnotation(wbId:String, annotation:Annotation):void;
		function addAnnotationFromHistory(wbId:String, annotations:Array):void;
		function removeAnnotation(wbId:String, shapeId:String):void;
		function getAnnotations(wbId:String):Array;
		function clear(wbId:String, fullClear:Boolean, userId:String):void;
		function accessModified(wbId:String, multiUser:Boolean):void;
		function getMultiUser(wbId:String):Boolean;
		function updateCursorPosition(wbId:String, userId:String, x:Number, y:Number):void;
	}
}