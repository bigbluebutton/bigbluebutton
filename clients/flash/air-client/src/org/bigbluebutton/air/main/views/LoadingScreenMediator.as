package org.bigbluebutton.air.main.views {
	
	import flash.desktop.NativeApplication;
	import flash.events.InvokeEvent;
	
	import mx.core.FlexGlobals;
	
	import org.bigbluebutton.air.common.PageEnum;
	import org.bigbluebutton.air.main.commands.JoinMeetingSignal;
	import org.bigbluebutton.air.main.models.IUISession;
	import org.bigbluebutton.air.main.models.IUserSession;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class LoadingScreenMediator extends Mediator {
		
		[Inject]
		public var view:LoadingScreen;
		
		[Inject]
		public var uiSession:IUISession;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var joinMeetingSignal:JoinMeetingSignal;
		
		/**
		 * Initialize listeners and Mediator initial state
		 */
		override public function initialize():void {
			view.setVisible(true);
			view.includeInLayout = true;
			NativeApplication.nativeApplication.addEventListener(InvokeEvent.INVOKE, onInvokeEvent);
			uiSession.loadingChangeSignal.add(onLoadingChange);
			onLoadingChange(uiSession.loading, uiSession.loadingMessage);
		}
		
		private function onInvokeEvent(invocation:InvokeEvent):void {
			if (invocation.arguments.length > 0) {
				var url:String = invocation.arguments[0].toString();
				if (url.lastIndexOf("://") != -1) {
					if (userSession.mainConnection)
						userSession.mainConnection.disconnect(true);
					if (userSession.videoConnection)
						userSession.videoConnection.disconnect(true);
					if (userSession.voiceConnection)
						userSession.voiceConnection.disconnect(true);
					if (userSession.deskshareConnection)
						userSession.deskshareConnection.disconnect(true);
					FlexGlobals.topLevelApplication.mainshell.visible = false;
					uiSession.popPage();
					uiSession.pushPage(PageEnum.MAIN);
					
					joinRoom(url);
				}
			} else {
				uiSession.setLoading(true, "Please use a browser to join a meeting");
			}
		}
		
		/**
		 * Update the view when there is a change in the model
		 */
		private function onLoadingChange(loading:Boolean, message:String):void {
			if (loading) {
				view.stateLabel.text = message;
				view.setVisible(true);
				view.includeInLayout = true;
			} else {
				view.setVisible(false);
				view.includeInLayout = false;
				FlexGlobals.topLevelApplication.mainshell.visible = true;
				uiSession.pushPage(PageEnum.MAIN);
			}
		}
		
		public function joinRoom(url:String):void {
			if (!url) {
				url = "";
			}
			if (url.lastIndexOf("://") != -1) {
				url = getEndURL(url);
			}
			joinMeetingSignal.dispatch(url);
		}
		
		/**
		 * Replace the schema with "http"
		 */
		protected function getEndURL(origin:String):String {
			return origin.replace('bigbluebutton://', 'http://');
		}
		
		/**
		 * Destroy view and listeners
		 */
		override public function destroy():void {
			super.destroy();
			view = null;
			uiSession.loadingChangeSignal.remove(onLoadingChange);
			NativeApplication.nativeApplication.removeEventListener(InvokeEvent.INVOKE, onInvokeEvent);
		}
	}
}
