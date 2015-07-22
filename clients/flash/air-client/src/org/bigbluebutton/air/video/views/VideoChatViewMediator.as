package org.bigbluebutton.air.video.views {
	
	import flash.events.MouseEvent;
	
	import mx.collections.ArrayCollection;
	import mx.core.FlexGlobals;
	import mx.resources.ResourceManager;
	import mx.utils.ObjectUtil;
	
	import org.bigbluebutton.air.common.utils.PagesENUM;
	import org.bigbluebutton.air.main.models.IUserUISession;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.models.User;
	import org.bigbluebutton.lib.user.models.UserList;
	import org.bigbluebutton.lib.video.models.UserStreamName;
	import org.bigbluebutton.lib.video.models.VideoProfile;
	
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
		
		private var manualSelection:Boolean = false;
		
		override public function initialize():void {
			userSession.userList.userRemovedSignal.add(userRemovedHandler);
			userSession.userList.userAddedSignal.add(userAddedHandler);
			userSession.userList.userChangeSignal.add(userChangeHandler);
			userUISession.pageTransitionStartSignal.add(onPageTransitionStart);
			view.streamlist.addEventListener(MouseEvent.CLICK, onSelectStream);
			FlexGlobals.topLevelApplication.pageName.text = ResourceManager.getInstance().getString('resources', 'video.title');
			FlexGlobals.topLevelApplication.backBtn.visible = false;
			FlexGlobals.topLevelApplication.profileBtn.visible = true;
			dataProvider = new ArrayCollection();
			view.streamlist.dataProvider = dataProvider;
			var users:ArrayCollection = userSession.userList.users;
			for each (var u:User in users) {
				if (u.hasStream && !dataProvider.contains(u)) {
					addUserStreamNames(u);
				}
			}
			var selectedUserProfile:User = userUISession.currentPageDetails as User;
			var displayUserStreamName:UserStreamName = null;
			if (selectedUserProfile) {
				var userStreamNames:Array = getUserStreamNamesByUserID(selectedUserProfile.userID);
				displayUserStreamName = userStreamNames[0];
			}
			if (displayUserStreamName) {
				manualSelection = true;
				view.streamlist.selectedIndex = dataProvider.getItemIndex(displayUserStreamName);
				startStream(selectedUserProfile, displayUserStreamName.streamName);
				view.noVideoMessage.visible = false;
				view.noVideoMessage.includeInLayout = false;
				view.streamListScroller.visible = true;
				view.streamListScroller.includeInLayout = true;
			} else {
				checkVideo();
			}
		}
		
		private function addUserStreamNames(u:User):void {
			var existingStreamNames:Array = getUserStreamNamesByUserID(u.userID);
			var streamNames:Array = u.streamName.split("|");
			for each (var streamName:String in streamNames) {
				var addNew:Boolean = true;
				for each (var existingUserStreamName:UserStreamName in existingStreamNames) {
					if (streamName == existingUserStreamName.streamName) {
						addNew = false;
					}
				}
				if (addNew) {
					var userStreamName:UserStreamName = new UserStreamName(streamName, u);
					dataProvider.addItem(userStreamName);
				}
			}
			dataProvider.refresh();
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
		
		private function onSelectStream(event:MouseEvent):void {
			if (view.streamlist.selectedIndex >= 0) {
				var userStreamName:UserStreamName = dataProvider.getItemAt(view.streamlist.selectedIndex) as UserStreamName;
				var user:User = userStreamName.user;
				if (userStreamName.streamName == userUISession.currentStreamName && manualSelection) {
					view.streamlist.selectedIndex = -1;
					manualSelection = false;
					checkVideo();
				} else if (user.hasStream) {
					manualSelection = true;
					if (getDisplayedUser() != null) {
						stopStream(getDisplayedUser().userID);
					}
					startStream(user, userStreamName.streamName);
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
				var streamNames:Array = user.streamName.split("|");
				for each (var streamName:String in streamNames) {
					var userStreamName:UserStreamName = new UserStreamName(streamName, user);
					dataProvider.addItem(userStreamName);
				}
			}
		}
		
		private function userRemovedHandler(userID:String):void {
			var displayedUser:User = getDisplayedUser();
			if (displayedUser) {
				if (displayedUser.userID == userID) {
					stopStream(userID);
				}
			}
			for (var item:int; item < dataProvider.length; item++) {
				if ((dataProvider.getItemAt(item).user as User).userID == userID) {
					// -- in the end. see: http://stackoverflow.com/questions/4255226/how-to-remove-an-item-while-iterating-over-collection
					dataProvider.removeItemAt(item--);
				}
			}
			if (dataProvider.length == 0) {
				view.noVideoMessage.visible = true;
				view.noVideoMessage.includeInLayout = true;
				view.streamListScroller.visible = false;
				view.streamListScroller.includeInLayout = false;
			} else {
				view.noVideoMessage.visible = false;
				view.noVideoMessage.includeInLayout = false;
				view.streamListScroller.visible = true;
				view.streamListScroller.includeInLayout = true;
				checkVideo();
			}
		}
		
		private function getUserStreamNamesByUserID(userID:String):Array {
			var userStreamNames:Array = new Array();
			for each (var userStreamName:UserStreamName in dataProvider) {
				if (userStreamName.user.userID == userID) {
					userStreamNames.push(userStreamName);
				}
			}
			return userStreamNames;
		}
		
		private function userChangeHandler(user:User, property:int):void {
			if (property == UserList.HAS_STREAM) {
				var displayedUser:User = getDisplayedUser();
				if (displayedUser) {
					if (user.userID == displayedUser.userID && !user.hasStream) {
						stopStream(user.userID);
					}
				}
				var userStreamNames:Array = getUserStreamNamesByUserID(user.userID);
				for each (var userStreamName:UserStreamName in userStreamNames) {
					if (!(userStreamName.user.streamName.indexOf(userStreamName.streamName) >= 0)) {
						dataProvider.removeItemAt(dataProvider.getItemIndex(userStreamName));
						if (userUISession.currentStreamName == userStreamName.streamName) {
							userUISession.currentStreamName = "";
							checkVideo();
						}
					}
				}
				if (user.streamName.split("|").length > userStreamNames.length && user.streamName.length > 0) {
					var camNumber:int = dataProvider.length;
					addUserStreamNames(user);
					if (userUISession.currentStreamName == userSession.userList.me.streamName && camNumber == 1) {
						checkVideo();
					}
				}
				if (userUISession.currentStreamName == "") {
					checkVideo();
				}
				if (dataProvider.length == 0) {
					view.noVideoMessage.visible = true;
					view.noVideoMessage.includeInLayout = true;
					view.streamListScroller.visible = false;
					view.streamListScroller.includeInLayout = false;
				} else {
					view.noVideoMessage.visible = false;
					view.noVideoMessage.includeInLayout = false;
					view.streamListScroller.visible = true;
					view.streamListScroller.includeInLayout = true;
				}
			} else if (property == UserList.PRESENTER) {
				checkVideo();
			}
			dataProvider.refresh();
		}
		
		private function startStream(user:User, streamName:String):void {
			if (view) {
				var videoProfile:VideoProfile = userSession.videoProfileManager.getVideoProfileByStreamName(streamName);
				view.startStream(userSession.videoConnection.connection, user.name, streamName, user.userID, videoProfile.width, videoProfile.height, view.streamListScroller.height, view.streamListScroller.width);
				userUISession.currentStreamName = streamName;
				view.videoGroup.height = view.video.height;
			}
		}
		
		private function stopStream(userID:String):void {
			if (view) {
				view.stopStream();
				userUISession.currentStreamName = "";
			}
		}
		
		private function getDisplayedUser():User {
			for each (var userStreamName:UserStreamName in dataProvider) {
				if (userStreamName.streamName == userUISession.currentStreamName) {
					return userStreamName.user;
				}
			}
			return null;
		}
		
		private function checkVideo(changedUser:User = null):void {
			if (!manualSelection || userUISession.currentStreamName == "") {
				// get id of the user that is currently displayed
				var currentUser:User = getDisplayedUser();
				// get presenter user
				var presenter:User = userSession.userList.getPresenter();
				// get any user that has video stream
				var userWithCamera:User = getUserWithCamera();
				var newUser:User;
				if (changedUser) {
					var userStreamNames:Array = getUserStreamNamesByUserID(changedUser.userID);
					// Priority state machine
					if (changedUser.presenter && changedUser.hasStream) {
						if (view)
							view.stopStream();
						startStream(changedUser, userStreamNames[0].streamName);
					} else if (currentUser && changedUser.userID == currentUser.userID) {
						if (view)
							view.stopStream();
						startStream(changedUser, userStreamNames[0].streamName);
					} else if (userWithCamera) {
						if (userWithCamera.userID == changedUser.userID) {
							if (view)
								view.stopStream();
							startStream(changedUser, userStreamNames[0].streamName);
						} else if (!changedUser.hasStream && userWithCamera.me) {
							var userStreamNames:Array = getUserStreamNamesByUserID(userWithCamera.userID);
							if (view)
								view.stopStream();
							startStream(userWithCamera, userStreamNames[0].streamName);
						}
					}
				} else {
					// Priority state machine
					// if presenter is transmitting a video - put them in first priority
					if (presenter != null && presenter.hasStream && !presenter.me) {
						newUser = presenter;
					} // current user is the second priority
					else if (currentUser != null && currentUser.hasStream && !currentUser.me) {
						newUser = currentUser;
					} // any user with camera is the last priority
					else if (userWithCamera != null && userWithCamera.hasStream) {
						newUser = userWithCamera;
					} // otherwise, nobody transmitts video at this moment
					else {
						return;
					}
					if (newUser) {
						var userStreamNames:Array = getUserStreamNamesByUserID(newUser.userID);
						var displayUserStreamName:UserStreamName = userStreamNames[0];
						for each (var userStreamName:UserStreamName in userStreamNames) {
							if (userStreamName.user.hasStream && userUISession.currentStreamName == userStreamName.streamName) {
								displayUserStreamName = userStreamName;
								break;
							}
						}
						if (view) {
							view.stopStream();
							startStream(newUser, displayUserStreamName.streamName);
							view.noVideoMessage.visible = false;
							view.noVideoMessage.includeInLayout = false;
							view.streamListScroller.visible = true;
							view.streamListScroller.includeInLayout = true;
						}
					}
				}
			}
		}
	}
}
