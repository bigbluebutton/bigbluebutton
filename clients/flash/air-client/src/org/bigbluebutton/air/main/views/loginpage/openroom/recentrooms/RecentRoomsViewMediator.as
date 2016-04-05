package org.bigbluebutton.air.main.views.loginpage.openroom.recentrooms {
	
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
	import org.bigbluebutton.lib.common.models.ISaveData;
	import org.bigbluebutton.lib.main.models.IUserSession;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	import spark.components.View;
	import spark.events.IndexChangeEvent;
	
	public class RecentRoomsViewMediator extends Mediator {
		
		[Inject]
		public var view:IRecentRoomsView;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var userUISession:IUserUISession;
		
		[Inject]
		public var saveData:ISaveData;
		
		protected var dataProvider:ArrayCollection;
		
		override public function initialize():void {
			if (saveData.read("rooms")) {
				dataProvider = new ArrayCollection((saveData.read("rooms") as ArrayCollection).toArray().reverse());
			}
			view.roomsList.dataProvider = dataProvider;
			view.roomsList.addEventListener(MouseEvent.CLICK, selectRoom);
		}
		
		protected function selectRoom(event:MouseEvent):void {
			trace("trying to select a room");
			if (view.roomsList.selectedIndex >= 0) {
				trace(dataProvider[view.roomsList.selectedIndex].url);
				if (dataProvider[view.roomsList.selectedIndex].url) {
					var urlReq:URLRequest = new URLRequest(dataProvider[view.roomsList.selectedIndex].url);
					navigateToURL(urlReq);
				}
			}
		}
		
		override public function destroy():void {
			super.destroy();
			FlexGlobals.topLevelApplication.backBtn.visible = false;
			FlexGlobals.topLevelApplication.topActionBar.visible = false;
			view.roomsList.removeEventListener(IndexChangeEvent.CHANGE, selectRoom);
			view.dispose();
			view = null;
		}
	}
}
