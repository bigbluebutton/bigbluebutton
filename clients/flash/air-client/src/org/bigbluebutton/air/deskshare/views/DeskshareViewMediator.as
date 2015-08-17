package org.bigbluebutton.air.deskshare.views {
	
	import mx.core.FlexGlobals;
	import mx.resources.ResourceManager;
	
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IUserSession;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class DeskshareViewMediator extends Mediator {
		
		[Inject]
		public var view:IDeskshareView;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var params:IConferenceParameters;
		
		public override function initialize():void {
			showDeskshare(userSession.deskshareConnection.streamWidth, userSession.deskshareConnection.streamHeight);
			userSession.deskshareConnection.isStreamingSignal.add(onDeskshareStreamChange);
			userSession.deskshareConnection.mouseLocationChangedSignal.add(onMouseLocationChanged);
			FlexGlobals.topLevelApplication.pageName.text = ResourceManager.getInstance().getString('resources', 'deskshare.title');
			FlexGlobals.topLevelApplication.backBtn.visible = false;
			FlexGlobals.topLevelApplication.profileBtn.visible = true;
		}
		
		/**
		 * On Deskshare View initialization - start the video stream
		 */
		private function showDeskshare(width:Number, height:Number):void {
			view.noDeskshareMessage.visible = view.noDeskshareMessage.includeInLayout = false;
			view.startStream(userSession.deskshareConnection.connection, null, params.room, null, userSession.deskshareConnection.streamWidth, userSession.deskshareConnection.streamHeight);
		}
		
		/**
		 * If desktop sharing stream dropped - show notification message, remove video
		 * else show the desktop sharing stream and cursor
		 */
		public function onDeskshareStreamChange(isDeskshareStreaming:Boolean):void {
			view.noDeskshareMessage.visible = view.noDeskshareMessage.includeInLayout = !isDeskshareStreaming;
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
			userSession.deskshareConnection.isStreamingSignal.remove(onDeskshareStreamChange);
			userSession.deskshareConnection.mouseLocationChangedSignal.remove(onMouseLocationChanged);
			view.stopStream();
		}
	}
}
