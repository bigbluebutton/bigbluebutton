package org.bigbluebutton.air.screenshare.views
{

	import org.bigbluebutton.air.screenshare.model.IScreenshareModel;
	import org.bigbluebutton.air.screenshare.services.IScreenshareConnection;
	
	import robotlegs.bender.bundles.mvcs.Mediator;

	public class ScreenshareViewMediator extends Mediator
	{
		[Inject]
		public var view:ScreenshareDock;
		
		[Inject]
		public var conn:IScreenshareConnection;
		
		[Inject]
		public var model:IScreenshareModel;
		
		override public function initialize():void {
			trace("************ ScreenshareViewMediator:: INIT **************");
			model.screenshareStreamStartedSignal.add(viewStream);
			model.screenshareStreamStoppedSignal.add(streamStopped);
			if (model.isSharing) {
				viewStream(model.streamId, model.width, model.height);
			}
		}
		
		public function viewStream(streamId:String, width:int, height:int):void {
			view.viewStream(conn.connection, streamId, width, height);
		}
		
		public function streamStopped(session:String, reason:String):void {
			view.streamStopped(session, reason);
		}
		
		override public function destroy():void {
			trace("************ ScreenshareViewMediator:: destroy **************");
			model.screenshareStreamStartedSignal.remove(viewStream);
			model.screenshareStreamStoppedSignal.remove(streamStopped);
			view.dispose();
			view = null;
		}
	}
}