package org.bigbluebutton.air.presentation.views {
	
	import flash.media.Video;
	import flash.net.NetConnection;
	
	import spark.components.Group;
	import spark.components.Label;
	import spark.components.VideoDisplay;
	
	import org.bigbluebutton.air.common.views.IView;
	import org.bigbluebutton.lib.presentation.views.IPresentationView;
	
	public interface IPresentationViewAir extends IPresentationView, IView {
		function get videoStream():VideoDisplay;
		function rotationHandler(rotation:String):void;
		function get showSharedCams():Label;
		function get showSharedCamsGroup():Group;
		function get videoGroup():Group
		function get video():Video;
		function stopStream():void
		function startStream(connection:NetConnection, name:String, streamName:String, userID:String, width:Number, height:Number, screenHeight:Number, screenWidth:Number):void
	}
}
