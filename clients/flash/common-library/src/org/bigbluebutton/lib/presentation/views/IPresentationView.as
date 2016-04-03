package org.bigbluebutton.lib.presentation.views {
	
	import mx.controls.SWFLoader;
	
	import spark.components.Group;
	
	import org.bigbluebutton.lib.presentation.models.Slide;
	import org.bigbluebutton.lib.whiteboard.views.WhiteboardCanvas;
	
	public interface IPresentationView {
		function get content():Group;
		function get viewport():Group;
		function get slide():SWFLoader;
		function setSlide(s:Slide):void;
		function setPresentationName(name:String):void;
		function get whiteboardCanvas():WhiteboardCanvas;
	}
}
