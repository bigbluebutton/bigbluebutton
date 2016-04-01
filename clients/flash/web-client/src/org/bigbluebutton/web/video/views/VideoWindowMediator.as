package org.bigbluebutton.web.video.views {
	
	import flash.events.Event;
	import flash.events.MouseEvent;
	
	import org.bigbluebutton.lib.common.views.VideoView;
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.models.User;
	import org.bigbluebutton.lib.user.models.UserList;
	import org.bigbluebutton.lib.user.services.IUsersService;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class VideoWindowMediator extends Mediator {
		
		[Inject]
		public var view:VideoWindow;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var usersService:IUsersService;
		
		[Inject]
		public var params:IConferenceParameters;
		
		override public function initialize():void {
			userSession.userList.userChangeSignal.add(userChangeHandler);
			userSession.userList.allUsersAddedSignal.add(usersAdded);
			userSession.userList.userRemovedSignal.add(userRemoved);
		}
		
		private function userRemoved(userID:String) {
			removeUserFromView(userID);
		}
		
		private function usersAdded() {
			if (userSession.config.displayAvatar) {
				for each (var user:User in userSession.userList.users) {
					if (!user.hasStream) {
						addAvatar(user);
					}
				}
				userSession.userList.userAddedSignal.add(addAvatar);
			}
		
		}
		
		private function userChangeHandler(user:User, property:int):void {
			if (property == UserList.HAS_STREAM) {
				if (user.streamName.length > 0) {
					addWebcam(user);
				} else {
					removeWebcam(user);
				}
				view.invalidateDisplayList();
			} else {
				updateUser(user);
			}
		}
		
		private function addAvatar(user:User) {
			var userGraphicHolder:UserGraphicHolder = new UserGraphicHolder();
			userGraphicHolder.moderator = userSession.userList.me.isModerator();
			view.addElement(userGraphicHolder);
			userGraphicHolder.imageLoader.contentLoaderInfo.addEventListener(Event.COMPLETE, avatarImageLoaded);
			userGraphicHolder.addAvatar(user, params.avatarUrl)
			view.videoViews.addItem(userGraphicHolder);
			userGraphicHolder.addEventListener(MouseEvent.CLICK, priorityMode);
			userGraphicHolder.addEventListener("close", closeHandler);
			userGraphicHolder.addEventListener("muteUser", muteUserHandler);
		}
		
		private function avatarImageLoaded(event:Event) {
			view.invalidateDisplayList();
		}
		
		private function updateUser(user:User) {
			for each (var graphicHolder:UserGraphicHolder in view.videoViews) {
				if (user.me) {
					graphicHolder.moderator = user.isModerator();
				}
				if (user.userID == graphicHolder.user.userID) {
					graphicHolder.setUserProperties(user);
				}
			}
		}
		
		private function removeWebcam(user:User):void {
			removeUserFromView(user.userID);
			if (userSession.config.displayAvatar) {
				addAvatar(user);
			}
		}
		
		private function removeUserFromView(userID:String) {
			for (var i:int = 0; i < view.videoViews.length; ++i) {
				var userGraphicHolder:UserGraphicHolder = view.videoViews[i] as UserGraphicHolder;
				if (userGraphicHolder.user.userID == userID) {
					removeUserGraphicHolder(userGraphicHolder);
					if (userGraphicHolder == view.priorityItem) {
						view.priorityItem = null;
						view.priorityMode = false;
					}
				}
			}
		}
		
		private function addWebcam(user:User):void {
			removeUserFromView(user.userID);
			var userGraphicHolder:UserGraphicHolder = new UserGraphicHolder();
			userGraphicHolder.moderator = userSession.userList.me.isModerator();
			view.addElement(userGraphicHolder);
			var webcam:VideoView = new VideoView();
			userGraphicHolder.addVideo(user, webcam)
			webcam.startStream(userSession.videoConnection.connection, user.name, user.streamName, user.userID);
			view.videoViews.addItem(userGraphicHolder);
			userGraphicHolder.addEventListener(MouseEvent.CLICK, priorityMode);
			userGraphicHolder.addEventListener("close", closeHandler);
			userGraphicHolder.addEventListener("muteUser", muteUserHandler);
		}
		
		private function muteUserHandler(e:Event) {
			var userGraphicHolder:UserGraphicHolder = e.target as UserGraphicHolder;
			usersService.muteUnmuteUser(userGraphicHolder.user.userID, !userGraphicHolder.user.muted);
		}
		
		
		private function closeHandler(e:Event) {
			var userGraphicHolder:UserGraphicHolder = e.target as UserGraphicHolder;
			if (view.priorityItem == userGraphicHolder) {
				view.priorityMode = false;
				view.priorityItem = null;
			}
			removeUserGraphicHolder(userGraphicHolder);
		}
		
		private function removeUserGraphicHolder(userGraphicHolder:UserGraphicHolder) {
			view.videoViews.removeItem(userGraphicHolder);
			view.removeElement(userGraphicHolder);
			if (userGraphicHolder.webcam) {
				userGraphicHolder.webcam.close();
			}
			view.invalidateDisplayList();
		}
		
		private function priorityMode(event:MouseEvent) {
			var userGraphicHolder:UserGraphicHolder = event.currentTarget as UserGraphicHolder;
			if (view.videoViews.contains(userGraphicHolder)) {
				view.priorityMode = !view.priorityMode || userGraphicHolder != view.priorityItem;
				if (view.priorityMode) {
					view.priorityItem = userGraphicHolder;
				}
				view.invalidateDisplayList();
			}
		}
		
		override public function destroy():void {
			super.destroy();
			view = null;
		}
	}
}

