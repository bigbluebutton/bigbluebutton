package org.bigbluebutton.air.screenshare.views
{
	import flash.net.NetConnection;
	
	import spark.components.Group;

	public class ScreenshareView extends Group
	{

		public function viewStream(conn:NetConnection, streamId:String, width:int, height:int):void {
			trace("TODO: Need to implement viewing of screenshare stream");
		}
		
		public function streamStopped(session:String, reason:String):void {
			trace("TODO: Need to implement stopping screenshare stream");
		}
	}
}