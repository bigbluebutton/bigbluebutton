package org.bigbluebutton.lib.deskshare.views {
	
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IUserSession;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class DeskshareMediator extends Mediator {
		
		[Inject]
		public var view:IDeskshareView;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var params:IConferenceParameters;
		
		public override function initialize():void {
			if (userSession.deskshareConnection) {
				assignedDeskshare();
			} else {
				userSession.assignedDeskshareSignal.add(assignedDeskshare)
			}
		}
		
		private function assignedDeskshare():void {
			userSession.deskshareConnection.isStreamingSignal.add(onDeskshareStreamChange);
			userSession.deskshareConnection.mouseLocationChangedSignal.add(onMouseLocationChanged);
		}
		
		/**
		 * On Deskshare View initialization - start the video stream
		 */
		protected function showDeskshare(width:Number, height:Number):void {
			view.startStream(userSession.deskshareConnection.connection, null, params.room, null, userSession.deskshareConnection.streamWidth, userSession.deskshareConnection.streamHeight);
		}
		
		/**
		 * If desktop sharing stream dropped - show notification message, remove video
		 * else show the desktop sharing stream and cursor
		 */
		public function onDeskshareStreamChange(isDeskshareStreaming:Boolean):void {
			if (!isDeskshareStreaming) {
				view.stopStream();
				userSession.deskshareConnection.mouseLocationChangedSignal.remove(onMouseLocationChanged);
			} else {
				userSession.deskshareConnection.mouseLocationChangedSignal.add(onMouseLocationChanged);
				showDeskshare(userSession.deskshareConnection.streamWidth, userSession.deskshareConnection.streamHeight);
			}
		}
		
		/**
		 * Notify view that mouse location was changed
		 */
		public function onMouseLocationChanged(x:Number, y:Number):void {
			view.changeMouseLocation(x, y);
		}
		
		/**
		 * Unsibscribe from signal listeners
		 * Stop desktop sharing stream
		 */
		override public function destroy():void {
			userSession.assignedDeskshareSignal.remove(assignedDeskshare)
			userSession.deskshareConnection.isStreamingSignal.remove(onDeskshareStreamChange);
			userSession.deskshareConnection.mouseLocationChangedSignal.remove(onMouseLocationChanged);
			view.stopStream();
		}
	}
}
