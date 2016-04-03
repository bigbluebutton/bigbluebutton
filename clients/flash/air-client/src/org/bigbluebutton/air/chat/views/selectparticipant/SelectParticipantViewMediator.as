package org.bigbluebutton.air.chat.views.selectparticipant {
	
	import flash.events.Event;
	import flash.utils.Dictionary;
	
	import mx.collections.ArrayCollection;
	import mx.core.FlexGlobals;
	import mx.events.ResizeEvent;
	import mx.resources.ResourceManager;
	
	import org.bigbluebutton.air.common.views.PagesENUM;
	import org.bigbluebutton.air.common.views.SplitViewEvent;
	import org.bigbluebutton.air.common.views.TransitionAnimationENUM;
	import org.bigbluebutton.air.main.models.IUserUISession;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.models.User;
	import org.osflash.signals.ISignal;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	import spark.events.IndexChangeEvent;
	
	public class SelectParticipantViewMediator extends Mediator {
		
		[Inject]
		public var view:ISelectParticipantView;
		
		[Inject]
		public var userSession:IUserSession
		
		[Inject]
		public var userUISession:IUserUISession;
		
		protected var dataProvider:ArrayCollection;
		
		protected var dicUserIdtoUser:Dictionary
		
		protected var usersSignal:ISignal;
		
		protected var guestsSignal:ISignal;
		
		override public function initialize():void {
			dataProvider = new ArrayCollection();
			view.list.dataProvider = dataProvider;
			view.list.addEventListener(IndexChangeEvent.CHANGE, onSelectUser);
			dicUserIdtoUser = new Dictionary();
			var users:ArrayCollection = userSession.userList.users;
			for each (var user:User in users) {
				if (!user.me) {
					userAdded(user)
				}
			}
			userSession.userList.userChangeSignal.add(userChanged);
			userSession.userList.userAddedSignal.add(userAdded);
			userSession.userList.userRemovedSignal.add(userRemoved);
			FlexGlobals.topLevelApplication.stage.addEventListener(ResizeEvent.RESIZE, stageOrientationChangingHandler);
			FlexGlobals.topLevelApplication.pageName.text = ResourceManager.getInstance().getString('resources', 'selectParticipant.title');
			FlexGlobals.topLevelApplication.backBtn.visible = false;
			FlexGlobals.topLevelApplication.profileBtn.visible = true;
			adjustForScreenRotation();
		}
		
		private function adjustForScreenRotation():void {
			var tabletLandscape:Boolean = FlexGlobals.topLevelApplication.isTabletLandscape();
			if (tabletLandscape) {
				userUISession.pushPage(PagesENUM.SPLITCHAT, userUISession.currentPageDetails);
			}
		}
		
		private function stageOrientationChangingHandler(e:Event):void {
			adjustForScreenRotation();
		}
		
		private function userAdded(user:User):void {
			dataProvider.addItem(user);
			dataProvider.refresh();
			dicUserIdtoUser[user.userID] = user;
		}
		
		private function userRemoved(userID:String):void {
			var user:User = dicUserIdtoUser[userID] as User;
			var index:uint = dataProvider.getItemIndex(user);
			dataProvider.removeItemAt(index);
			dicUserIdtoUser[user.userID] = null;
		}
		
		private function userChanged(user:User, property:String = null):void {
			dataProvider.refresh();
		}
		
		protected function onSelectUser(event:IndexChangeEvent):void {
			var user:User = dataProvider.getItemAt(event.newIndex) as User;
			if (FlexGlobals.topLevelApplication.isTabletLandscape()) {
				eventDispatcher.dispatchEvent(new SplitViewEvent(SplitViewEvent.CHANGE_VIEW, PagesENUM.getClassfromName(PagesENUM.CHAT), user, true));
			} else {
				userUISession.pushPage(PagesENUM.CHAT, user, TransitionAnimationENUM.SLIDE_LEFT);
			}
		}
		
		override public function destroy():void {
			super.destroy();
			view.dispose();
			view = null;
			FlexGlobals.topLevelApplication.stage.removeEventListener(ResizeEvent.RESIZE, stageOrientationChangingHandler);
			userSession.userList.userChangeSignal.remove(userChanged);
			userSession.userList.userAddedSignal.remove(userAdded);
			userSession.userList.userRemovedSignal.remove(userRemoved);
		}
	}
}
