package org.bigbluebutton.lib.presentation.views {
	
	import mx.controls.SWFLoader;
	
	import org.bigbluebutton.lib.presentation.models.Slide;
	import org.bigbluebutton.lib.whiteboard.views.WhiteboardCanvas;
	
	import spark.components.Group;
	
	public interface IPresentationView {
		function get content():Group;
		function get viewport():Group;
		function get slide():SWFLoader;
		function setSlide(s:Slide):void;
		function setPresentationName(name:String):void;
		function get whiteboardCanvas():WhiteboardCanvas;
	}
}
