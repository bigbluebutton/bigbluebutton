package org.bigbluebutton.air.deskshare.views {
	
	import flash.events.Event;
	
	import mx.core.FlexGlobals;
	import mx.events.ResizeEvent;
	
	import org.bigbluebutton.air.common.PageEnum;
	import org.bigbluebutton.air.main.models.IUISession;
	
	public class DeskshareViewMediator extends DeskshareMediator {
		
		[Inject]
		public var userUISession:IUISession;
		
		public override function initialize():void {
			showDeskshare(userSession.deskshareConnection.streamWidth, userSession.deskshareConnection.streamHeight);
			FlexGlobals.topLevelApplication.stage.addEventListener(ResizeEvent.RESIZE, stageOrientationChangingHandler);
			FlexGlobals.topLevelApplication.topActionBar.backBtn.visible = false;
			FlexGlobals.topLevelApplication.topActionBar.profileBtn.visible = true;
			super.initialize();
		}
		
		public function getView():IDeskshareViewAir {
			return view as IDeskshareViewAir;
		}
		
		/**
		 * On Deskshare View initialization - start the video stream
		 */
		override protected function showDeskshare(width:Number, height:Number):void {
			getView().noDeskshareMessage.visible = getView().noDeskshareMessage.includeInLayout = false;
			super.showDeskshare(width, height);
		}
		
		private function stageOrientationChangingHandler(e:Event):void {
			if (userUISession.currentPage == PageEnum.DESKSHARE) {
				//apply rotation only if user didn´t change view at the same time
				//reload deskshare page in order to load with the correct orientation
				userUISession.popPage();
				userUISession.pushPage(PageEnum.DESKSHARE);
			}
		}
		
		/**
		 * If desktop sharing stream dropped - show notification message, remove video
		 * else show the desktop sharing stream and cursor
		 */
		override public function onDeskshareStreamChange(isDeskshareStreaming:Boolean):void {
			getView().noDeskshareMessage.visible = getView().noDeskshareMessage.includeInLayout = !isDeskshareStreaming;
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
