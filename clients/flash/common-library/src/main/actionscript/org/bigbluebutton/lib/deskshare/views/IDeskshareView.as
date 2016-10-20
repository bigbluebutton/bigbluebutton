package org.bigbluebutton.lib.deskshare.views {
	
	import flash.net.NetConnection;
	
	import spark.components.Group;
	
	public interface IDeskshareView {
		function get deskshareGroup():Group;
		function stopStream():void;
		function startStream(connection:NetConnection, name:String, streamName:String, userID:String, width:Number, height:Number):void;
		function changeMouseLocation(x:Number, y:Number):void;
	}
}
