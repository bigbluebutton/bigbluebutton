package org.bigbluebutton.air.main.views.loginpage.openroom {
	
	import flash.desktop.NativeApplication;
	import flash.events.Event;
	import flash.events.KeyboardEvent;
	import flash.events.MouseEvent;
	import flash.net.URLRequest;
	import flash.net.navigateToURL;
	import flash.ui.Keyboard;
	import flash.utils.describeType;
	
	import mx.collections.ArrayCollection;
	import mx.core.FlexGlobals;
	import mx.events.ItemClickEvent;
	import mx.resources.ResourceManager;
	
	import org.bigbluebutton.air.main.models.IUserUISession;
	import org.bigbluebutton.lib.main.models.IUserSession;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	import spark.components.View;
	import spark.events.IndexChangeEvent;
	
	public class OpenRoomViewMediator extends Mediator {
		
		[Inject]
		public var view:IOpenRoomView;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var userUISession:IUserUISession;
		
		override public function initialize():void {
			FlexGlobals.topLevelApplication.profileBtn.visible = false;
			FlexGlobals.topLevelApplication.backBtn.visible = false;
			FlexGlobals.topLevelApplication.bottomMenu.includeInLayout = false;
			FlexGlobals.topLevelApplication.topActionBar.visible = false;
			(view as View).addEventListener(KeyboardEvent.KEY_DOWN, KeyHandler);
			view.goButton.addEventListener(MouseEvent.CLICK, onGoButtonClick);
		}
		
		private function KeyHandler(e:KeyboardEvent):void {
			if (e.keyCode == Keyboard.ENTER) {
				onGoButtonClick(null);
			}
		}
		
		private function onGoButtonClick(e:MouseEvent):void {
			var url:String = view.inputRoom.text;
			if (url.indexOf("http") == -1) {
				url = "http://" + url;
			}
			var urlReq:URLRequest = new URLRequest(url);
			navigateToURL(urlReq);
		}
		
		override public function destroy():void {
			super.destroy();
			(view as View).removeEventListener(KeyboardEvent.KEY_DOWN, KeyHandler);
			view.goButton.removeEventListener(MouseEvent.CLICK, onGoButtonClick);
			view.dispose();
			view = null;
		}
	}
}
