package org.bigbluebutton.air.video.views.videochat {
	
	import flash.display.Screen;
	import flash.events.Event;
	import flash.events.MouseEvent;
	
	import mx.collections.ArrayCollection;
	import mx.core.FlexGlobals;
	import mx.events.ResizeEvent;
	import mx.resources.ResourceManager;
	
	import org.bigbluebutton.air.common.PageEnum;
	import org.bigbluebutton.air.main.models.IUISession;
	import org.bigbluebutton.air.main.models.IUserSession;
	import org.bigbluebutton.air.video.models.VideoProfile;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class VideoChatViewMediator extends Mediator {
		
		[Inject]
		public var view:IVideoChatView;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var userUISession:IUISession;
		
		protected var dataProvider:ArrayCollection;
		
		private var manualSelection:Boolean = false;
		
		private var speaker:User = null;
		
		private var currentUser:User = null;
		
		override public function initialize():void {
			userSession.userList.userRemovedSignal.add(userRemovedHandler);
			userSession.userList.userAddedSignal.add(userAddedHandler);
			userSession.userList.userChangeSignal.add(userChangeHandler);
			userUISession.pageTransitionStartSignal.add(onPageTransitionStart);
			view.streamlist.addEventListener(MouseEvent.CLICK, onSelectStream);
			FlexGlobals.topLevelApplication.stage.addEventListener(ResizeEvent.RESIZE, stageOrientationChangingHandler);
			FlexGlobals.topLevelApplication.topActionBar.pageName.text = ResourceManager.getInstance().getString('resources', 'video.title');
			FlexGlobals.topLevelApplication.topActionBar.backBtn.visible = false;
			FlexGlobals.topLevelApplication.topActionBar.profileBtn.visible = true;
			dataProvider = new ArrayCollection();
			view.streamlist.dataProvider = dataProvider;
			var users:ArrayCollection = userSession.userList.users;
			for each (var u:User in users) {
				if (u.streamName && u.streamName != "" && !dataProvider.contains(u)) {
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
				displayVideo(true);
			}
		}
		
		private function stageOrientationChangingHandler(e:Event):void {
			if (view.video) {
				var videoProfile:VideoProfile = userSession.videoProfileManager.getVideoProfileByStreamName(userUISession.currentStreamName);
				var newHeight:Number = Screen.mainScreen.visibleBounds.height - FlexGlobals.topLevelApplication.topActionBar.height - FlexGlobals.topLevelApplication.bottomMenu.height;
				var newWidth:Number = FlexGlobals.topLevelApplication.width;
				view.video.parent.width = newWidth;
				view.video.parent.height = newHeight;
				view.startStream(userSession.videoConnection.connection, currentUser.name, userUISession.currentStreamName, currentUser.userID, videoProfile.width, videoProfile.height, newHeight, newWidth);
				view.videoGroup.height = view.video.height;
			}
		}
		
		private function resizeVideo(screenWidth:Number, screenHeight:Number, originalVideoWidth:Number, originalVideoHeight:Number):void {
			// if we have device where screen width less than screen height e.g. phone
			if (screenWidth < screenHeight) {
				// make the video width full width of the screen 
				view.video.width = screenWidth;
				// calculate height based on a video width, it order to keep the same aspect ratio
				view.video.height = (view.video.width / originalVideoWidth) * originalVideoHeight;
				// if calculated height appeared to be bigger than screen height, recalculuate the video size based on width
				if (screenHeight < view.video.height) {
					// make the video height full height of the screen
					view.video.height = screenHeight;
					// calculate width based on a video height, it order to keep the same aspect ratio
					view.video.width = ((originalVideoWidth * view.video.height) / originalVideoHeight);
				}
			} // if we have device where screen height less than screen width e.g. tablet
			else {
				// make the video height full height of the screen
				view.video.height = screenHeight;
				// calculate width based on a video height, it order to keep the same aspect ratio
				view.video.width = ((originalVideoWidth * view.video.height) / originalVideoHeight);
				// if calculated width appeared to be bigger than screen width, recalculuate the video size based on height
				if (screenWidth < view.video.width) {
					// make the video width full width of the screen 
					view.video.width = screenWidth;
					// calculate height based on a video width, it order to keep the same aspect ratio
					view.video.height = (view.video.width / originalVideoWidth) * originalVideoHeight;
				}
			}
		}
		
		private function displayVideo(value:Boolean):void {
			view.noVideoMessage.visible = !value;
			view.noVideoMessage.includeInLayout = !value;
			view.streamListScroller.visible = value;
			view.streamListScroller.includeInLayout = value;
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
			if (lastPage == PageEnum.VIDEO_CHAT) {
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
			FlexGlobals.topLevelApplication.stage.removeEventListener(ResizeEvent.RESIZE, stageOrientationChangingHandler);
			view.streamlist.removeEventListener(MouseEvent.CLICK, onSelectStream);
			view.dispose();
			view = null;
			super.destroy();
		}
		
		private function userAddedHandler(user:User):void {
			if (user.streamName && user.streamName != "") {
				var streamNames:Array = user.streamName.split("|");
				for each (var streamName:String in streamNames) {
					var userStreamName:UserStreamName = new UserStreamName(streamName, user);
					dataProvider.addItem(userStreamName);
				}
			}
		}
		
		private function removeUserFromDataProvider(userID:String):void {
			for (var item:int; item < dataProvider.length; item++) {
				if ((dataProvider.getItemAt(item).user).userID == userID) {
					// -- in the end. see: http://stackoverflow.com/questions/4255226/how-to-remove-an-item-while-iterating-over-collection
					dataProvider.removeItemAt(item--);
				}
			}
		}
		
		private function userRemovedHandler(userID:String):void {
			var displayedUser:User = getDisplayedUser();
			removeUserFromDataProvider(userID);
			if (displayedUser) {
				if (displayedUser.userID == userID) {
					stopStream(userID);
					if (dataProvider.length == 0) {
						displayVideo(false);
					} else {
						displayVideo(true);
						checkVideo();
					}
				}
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
							if (!speaker) {
								checkVideo();
							}
						}
					}
				}
				if (user.streamName.split("|").length > userStreamNames.length && user.streamName.length > 0) {
					var camNumber:int = dataProvider.length;
					addUserStreamNames(user);
					if (userUISession.currentStreamName == userSession.userList.me.streamName && camNumber == 1) {
						if (!speaker) {
							checkVideo();
						}
					}
				}
				if (userUISession.currentStreamName == "") {
					if (!speaker) {
						checkVideo();
					}
				}
				if (dataProvider.length == 0) {
					displayVideo(false);
				} else {
					displayVideo(true);
				}
			} else if (property == UserList.PRESENTER) {
				if (!speaker) {
					checkVideo();
				}
			}
			dataProvider.refresh();
		}
		
		private function startStream(user:User, streamName:String):void {
			if (view) {
				var videoProfile:VideoProfile = userSession.videoProfileManager.getVideoProfileByStreamName(streamName);
				trace(videoProfile.width + "x" + videoProfile.height);
				view.startStream(userSession.videoConnection.connection, user.name, streamName, user.userID, videoProfile.width, videoProfile.height, view.streamListScroller.height, view.streamListScroller.width);
				userUISession.currentStreamName = streamName;
				currentUser = user;
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
			if (!manualSelection || userUISession.currentStreamName == "" && userSession.videoConnection.connection) {
				// get id of the user that is currently displayed
				var currentUser:User = getDisplayedUser();
				// get presenter user
				var presenter:User = userSession.userList.getPresenter();
				// get any user that has video stream
				var userWithCamera:User = getUserWithCamera();
				var newUser:User;
				var userStreamNames:Array;
				if (changedUser) {
					userStreamNames = getUserStreamNamesByUserID(changedUser.userID);
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
							userStreamNames = getUserStreamNamesByUserID(userWithCamera.userID);
							if (view)
								view.stopStream();
							startStream(userWithCamera, userStreamNames[0].streamName);
						}
					}
				} else {
					// Priority state machine
					if (speaker) {
						newUser = speaker;
					} else if (presenter != null && presenter.hasStream && !presenter.me) { // if presenter is transmitting a video - put them in first priority
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
						userStreamNames = getUserStreamNamesByUserID(newUser.userID);
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
							displayVideo(true);
						}
					}
				}
			}
		}
	}
}
