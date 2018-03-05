package org.bigbluebutton.air.screenshare.views
{

	import org.bigbluebutton.air.screenshare.services.IScreenshareConnection;	
	import robotlegs.bender.bundles.mvcs.Mediator;

	public class ScreenshareViewStreamMediator extends Mediator
	{
		[Inject]
		public var view:ScreenshareViewStream;
		
		[Inject]
		public var conn:IScreenshareConnection;
		
		public function viewStream(streamId:String, width:int, height:int):void {
			view.viewStream(conn.connection, streamId, width, height);
		}
		
		public function streamStopped(session:String, reason:String):void {
			view.streamStopped(session, reason);
		}
	}
}