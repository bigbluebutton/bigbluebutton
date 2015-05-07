package org.bigbluebutton.air.users.views {
	
	import flash.utils.Dictionary;
	
	import mx.collections.ArrayCollection;
	import mx.core.FlexGlobals;
	import mx.resources.ResourceManager;
	
	import org.bigbluebutton.air.common.utils.PagesENUM;
	import org.bigbluebutton.air.common.utils.TransitionAnimationENUM;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.main.models.IUserUISession;
	import org.bigbluebutton.lib.user.models.User;
	import org.osflash.signals.ISignal;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	import spark.events.IndexChangeEvent;
	
	public class ParticipantsViewMediator extends Mediator {
		
		[Inject]
		public var view:IParticipantsView;
		
		[Inject]
		public var userSession:IUserSession
		
		[Inject]
		public var userUISession:IUserUISession
		
		protected var dataProvider:ArrayCollection;
		
		protected var dicUserIdtoUser:Dictionary
		
		protected var usersSignal:ISignal;
		
		override public function initialize():void {
			dataProvider = new ArrayCollection();
			view.list.dataProvider = dataProvider;
			view.list.addEventListener(IndexChangeEvent.CHANGE, onSelectParticipant);
			dicUserIdtoUser = new Dictionary();
			var users:ArrayCollection = userSession.userList.users;
			for each (var user:User in users) {
				addUser(user);
			}
			userSession.userList.userChangeSignal.add(userChanged);
			userSession.userList.userAddedSignal.add(addUser);
			userSession.userList.userRemovedSignal.add(userRemoved);
			setPageTitle();
			FlexGlobals.topLevelApplication.profileBtn.visible = true;
			FlexGlobals.topLevelApplication.backBtn.visible = false;
		}
		
		private function addUser(user:User):void {
			dataProvider.addItem(user);
			dataProvider.refresh();
			dicUserIdtoUser[user.userID] = user;
			setPageTitle();
		}
		
		private function userRemoved(userID:String):void {
			var user:User = dicUserIdtoUser[userID] as User;
			var index:uint = dataProvider.getItemIndex(user);
			dataProvider.removeItemAt(index);
			dicUserIdtoUser[user.userID] = null;
			setPageTitle();
		}
		
		private function userChanged(user:User, property:String = null):void {
			dataProvider.refresh();
		}
		
		protected function onSelectParticipant(event:IndexChangeEvent):void {
			if (event.newIndex >= 0) {
				var user:User = dataProvider.getItemAt(event.newIndex) as User;
				userUISession.pushPage(PagesENUM.USER_DETAILS, user, TransitionAnimationENUM.SLIDE_LEFT);
			}
		}
		
		/**
		 * Count participants and set page title accordingly
		 **/
		private function setPageTitle():void {
			if (dataProvider != null) {
				FlexGlobals.topLevelApplication.pageName.text = ResourceManager.getInstance().getString('resources', 'participants.title') + "(" + dataProvider.length + ")";
			}
		}
		
		override public function destroy():void {
			super.destroy();
			view.dispose();
			view = null;
			userSession.userList.userChangeSignal.remove(userChanged);
			userSession.userList.userAddedSignal.remove(addUser);
			userSession.userList.userRemovedSignal.remove(userRemoved);
		}
	}
}
