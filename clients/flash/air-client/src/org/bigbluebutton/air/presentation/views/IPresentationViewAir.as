package org.bigbluebutton.air.presentation.views {
	
	import flash.media.Video;
	import flash.net.NetConnection;
	import mx.controls.SWFLoader;
	import org.bigbluebutton.air.common.views.IView;
	import org.bigbluebutton.lib.presentation.models.Slide;
	import org.bigbluebutton.lib.presentation.views.IPresentationView;
	import org.bigbluebutton.lib.whiteboard.views.WhiteboardCanvas;
	import spark.components.Group;
	import spark.components.Label;
	import spark.components.VideoDisplay;
	
	public interface IPresentationViewAir extends IPresentationView {
		function get videoStream():VideoDisplay;
		function rotationHandler(rotation:String):void;
		function dispose():void;
		function get showSharedCams():Label;
		function get showSharedCamsGroup():Group;
		function get videoGroup():Group
		function get video():Video;
		function stopStream():void
		function startStream(connection:NetConnection, name:String, streamName:String, userID:String, width:Number, height:Number, screenHeight:Number, screenWidth:Number):void
	}
}
