package org.bigbluebutton.air.presentation.views {
	
	import mx.controls.SWFLoader;
	
	import org.bigbluebutton.air.common.views.IView;
	import org.bigbluebutton.lib.presentation.models.Slide;
	import org.bigbluebutton.lib.presentation.views.IPresentationView;
	import org.bigbluebutton.lib.whiteboard.views.WhiteboardCanvas;
	
	import spark.components.Group;
	
	public interface IPresentationViewAir extends IPresentationView {
		function rotationHandler(rotation:String):void;
		function dispose():void;
	}
}
