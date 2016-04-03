package org.bigbluebutton.air.presentation.views {
	
	import mx.controls.SWFLoader;
	
	import org.bigbluebutton.air.common.views.IView;
	import org.bigbluebutton.lib.presentation.models.Slide;
	import org.bigbluebutton.lib.whiteboard.views.WhiteboardCanvas;
	
	import spark.components.Group;
	
	public interface IPresentationView extends IView {
		function get content():Group;
		function get viewport():Group;
		function get slide():SWFLoader;
		function setSlide(s:Slide):void;
		function setPresentationName(name:String):void;
		function rotationHandler(rotation:String):void;
		function get whiteboardCanvas():WhiteboardCanvas;
	}
}
