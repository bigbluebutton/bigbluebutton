package org.bigbluebutton.air.deskshare.views {
	
	import flash.events.Event;
	
	import mx.core.FlexGlobals;
	import mx.events.ResizeEvent;
	import mx.resources.ResourceManager;
	
	import org.bigbluebutton.air.common.views.PagesENUM;
	import org.bigbluebutton.air.main.models.IUserUISession;
	import org.bigbluebutton.lib.deskshare.views.DeskshareMediator;
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IUserSession;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class DeskshareViewMediator extends DeskshareMediator {
		
		[Inject]
		public var userUISession:IUserUISession;
		
		public override function initialize():void {
			showDeskshare(userSession.deskshareConnection.streamWidth, userSession.deskshareConnection.streamHeight);
			FlexGlobals.topLevelApplication.stage.addEventListener(ResizeEvent.RESIZE, stageOrientationChangingHandler);
			FlexGlobals.topLevelApplication.topActionBar.pageName.text = ResourceManager.getInstance().getString('resources', 'deskshare.title');
			FlexGlobals.topLevelApplication.topActionBar.backBtn.visible = false;
			FlexGlobals.topLevelApplication.topActionBar.profileBtn.visible = true;
			super.initialize();
		}
		
		/**
		 * On Deskshare View initialization - start the video stream
		 */
		override protected function showDeskshare(width:Number, height:Number):void {
			(view as DeskshareView).noDeskshareMessage.visible = (view as DeskshareView).noDeskshareMessage.includeInLayout = false;
			super.showDeskshare(width, height);
		}
		
		private function stageOrientationChangingHandler(e:Event):void {
			if (userUISession.currentPage == PagesENUM.DESKSHARE) { //apply rotation only if user didn´t change view at the same time
				//reload deskshare page in order to load with the correct orientation
				userUISession.popPage();
				userUISession.pushPage(PagesENUM.DESKSHARE);
			}
		}
		
		/**
		 * If desktop sharing stream dropped - show notification message, remove video
		 * else show the desktop sharing stream and cursor
		 */
		override public function onDeskshareStreamChange(isDeskshareStreaming:Boolean):void {
			(view as DeskshareView).noDeskshareMessage.visible = (view as DeskshareView).noDeskshareMessage.includeInLayout = !isDeskshareStreaming;
			super.onDeskshareStreamChange(isDeskshareStreaming);
		}
		
		/**
		 * Unsibscribe from signal listeners
		 * Stop desktop sharing stream
		 */
		override public function destroy():void {
			FlexGlobals.topLevelApplication.stage.removeEventListener(ResizeEvent.RESIZE, stageOrientationChangingHandler);
			super.destroy();
		}
	}
}
