package org.bigbluebutton.air.video.views {
	
	import mx.collections.ArrayCollection;
	import mx.core.FlexGlobals;
	import mx.resources.ResourceManager;
	import mx.utils.ObjectUtil;
	
	import org.bigbluebutton.air.common.utils.PagesENUM;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.main.models.IUserUISession;
	import org.bigbluebutton.lib.user.models.User;
	import org.bigbluebutton.lib.user.models.UserList;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	import spark.events.IndexChangeEvent;
	
	public class VideoChatViewMediator extends Mediator {
		
		[Inject]
		public var view:IVideoChatView;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var userUISession:IUserUISession;
		
		protected var dataProvider:ArrayCollection;
		
		override public function initialize():void {
			userSession.userList.userRemovedSignal.add(userRemovedHandler);
			userSession.userList.userAddedSignal.add(userAddedHandler);
			userSession.userList.userChangeSignal.add(userChangeHandler);
			userUISession.pageTransitionStartSignal.add(onPageTransitionStart);
			view.streamlist.addEventListener(IndexChangeEvent.CHANGE, onSelectStream);
			checkVideo();
			FlexGlobals.topLevelApplication.pageName.text = ResourceManager.getInstance().getString('resources', 'video.title');
			FlexGlobals.topLevelApplication.backBtn.visible = false;
			FlexGlobals.topLevelApplication.profileBtn.visible = true;
			dataProvider = new ArrayCollection();
			view.streamlist.dataProvider = dataProvider;
			var users:ArrayCollection = userSession.userList.users;
			for each (var u:User in users) {
				if (u.hasStream && !dataProvider.contains(u)) {
					dataProvider.addItem(u);
					if (view && view.getDisplayedUserID() == u.userID) {
						view.streamlist.selectedIndex = dataProvider.getItemIndex(u);
					}
				}
			}
		}
		
		protected function getUserWithCamera():User {
			var users:ArrayCollection = userSession.userList.users;
			var userMe:User = null;
			for each (var u:User in users) {
				if (u.hasStream) {
					if (u.me) {
						userMe = u;
					} else {
						return u;
					}
				}
			}
			return userMe;
		}
		
		private function onPageTransitionStart(lastPage:String):void {
			if (lastPage == PagesENUM.VIDEO_CHAT) {
				view.dispose();
			}
		}
		
		private function onSelectStream(event:IndexChangeEvent):void {
			if (event.newIndex >= 0) {
				var user:User = dataProvider.getItemAt(event.newIndex) as User;
				if (user.hasStream) {
					if (view && view.getDisplayedUserID() != null) {
						stopStream(view.getDisplayedUserID());
					}
					startStream(user.name, user.streamName);
				}
			}
		}
		
		override public function destroy():void {
			userSession.userList.userRemovedSignal.remove(userRemovedHandler);
			userSession.userList.userAddedSignal.remove(userAddedHandler);
			userSession.userList.userChangeSignal.remove(userChangeHandler);
			userUISession.pageTransitionStartSignal.remove(onPageTransitionStart);
			view.dispose();
			view = null;
			super.destroy();
		}
		
		private function userAddedHandler(user:User):void {
			if (user.hasStream) {
				checkVideo();
				dataProvider.addItem(user);
			}
		}
		
		private function userRemovedHandler(userID:String):void {
			if (view.getDisplayedUserID() == userID) {
				stopStream(userID);
				checkVideo();
			}
			for (var item:int; item < dataProvider.length; item++) {
				if ((dataProvider.getItemAt(item) as User).userID == userID) {
					dataProvider.removeItemAt(item);
					break;
				}
			}
			if (dataProvider.length == 0) {
				view.noVideoMessage.visible = true;
			} else {
				view.noVideoMessage.visible = false;
			}
		}
		
		private function userChangeHandler(user:User, property:int):void {
			if (property == UserList.HAS_STREAM) {
				if (user.userID == view.getDisplayedUserID() && !user.hasStream) {
					stopStream(user.userID);
				}
				if (dataProvider.contains(user) && !user.hasStream) {
					dataProvider.removeItemAt(dataProvider.getItemIndex(user));
				} else if (!dataProvider.contains(user) && user.hasStream) {
					dataProvider.addItem(user);
				}
				if (view.getDisplayedUserID() == null) {
					checkVideo();
				}
				if (dataProvider.length == 0) {
					view.noVideoMessage.visible = true;
				} else {
					view.noVideoMessage.visible = false;
					view.streamlist.selectedIndex = dataProvider.getItemIndex(userSession.userList.getUserByUserId(view.getDisplayedUserID()));
				}
			}
		}
		
		private function startStream(name:String, streamName:String):void {
			var resolution:Object = getVideoResolution(streamName);
			if (resolution) {
				trace(ObjectUtil.toString(resolution));
				var width:Number = Number(String(resolution.dimensions[0]));
				var length:Number = Number(String(resolution.dimensions[1]));
				if (view) {
					view.startStream(userSession.videoConnection.connection, name, streamName, resolution.userID, width, length, view.videoGroup.height, view.videoGroup.width);
				}
			}
		}
		
		private function stopStream(userID:String):void {
			if (view) {
				view.stopStream();
			}
		}
		
		private function checkVideo(changedUser:User = null):void {
			// get id of the user that is currently displayed
			var currentUserID:String = view.getDisplayedUserID();
			// get user that was selected 
			var selectedUser:User = userUISession.currentPageDetails as User;
			// get presenter user
			var presenter:User = userSession.userList.getPresenter();
			// get any user that has video stream
			var userWithCamera:User = getUserWithCamera();
			var newUser:User;
			if (changedUser) {
				// Priority state machine
				if (selectedUser && selectedUser.hasStream && changedUser.userID == selectedUser.userID) {
					if (view)
						view.stopStream();
					startStream(changedUser.name, changedUser.streamName);
				} else if (changedUser.presenter && changedUser.hasStream) {
					if (view)
						view.stopStream();
					startStream(changedUser.name, changedUser.streamName);
				} else if (currentUserID && changedUser.userID == currentUserID) {
					if (view)
						view.stopStream();
					startStream(changedUser.name, changedUser.streamName);
				} else if (userWithCamera) {
					if (userWithCamera.userID == changedUser.userID) {
						if (view)
							view.stopStream();
						startStream(changedUser.name, changedUser.streamName);
					} else if (!changedUser.hasStream && userWithCamera.me) {
						if (view)
							view.stopStream();
						startStream(userWithCamera.name, userWithCamera.streamName);
					}
				}
			} else {
				// Priority state machine
				// if user was directly selected, show this user as a first priority
				if (selectedUser && selectedUser.hasStream) {
					newUser = selectedUser;
				} // if presenter is transmitting a video - put them in second priority
				else if (presenter != null && presenter.hasStream) {
					newUser = presenter;
				} // current user is the third priority
				else if (currentUserID != null) {
					if (changedUser != null && currentUserID == changedUser.userID) {
						newUser = changedUser;
					}
				} // any user with camera is the last priority
				else if (userWithCamera != null) {
					newUser = userWithCamera;
				} // otherwise, nobody transmitts video at this moment
				else {
					return;
				}
				if (newUser) {
					if (view)
						view.stopStream();
					startStream(newUser.name, newUser.streamName);
					view.noVideoMessage.visible = false;
				}
			}
		}
		
		protected function getVideoResolution(stream:String):Object {
			var pattern:RegExp = new RegExp("(\\d+x\\d+)-([A-Za-z0-9]+)-\\d+", "");
			if (pattern.test(stream)) {
				trace("The stream name is well formatted [" + stream + "]");
				trace("Stream resolution is [" + pattern.exec(stream)[1] + "]");
				trace("Userid [" + pattern.exec(stream)[2] + "]");
				return {userID: pattern.exec(stream)[2], dimensions: pattern.exec(stream)[1].split("x")};
			} else {
				trace("The stream name doesn't follow the pattern <width>x<height>-<userId>-<timestamp>. However, the video resolution will be set to 320x240");
				return null;
			}
		}
	}
}
