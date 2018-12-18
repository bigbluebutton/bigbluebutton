package org.bigbluebutton.air.presentation.views {
	
	import flash.display.DisplayObjectContainer;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.events.TimerEvent;
	import flash.events.TransformGestureEvent;
	import flash.utils.Timer;
	
	import mx.collections.ArrayCollection;
	import mx.core.FlexGlobals;
	import mx.events.ResizeEvent;
	import mx.managers.PopUpManager;
	import mx.resources.ResourceManager;
	
	import org.bigbluebutton.air.main.commands.GoToSlideSignal;
	import org.bigbluebutton.air.main.models.IUISession;
	import org.bigbluebutton.air.presentation.views.selectwebcam.SelectStreamPopUp;
	import org.bigbluebutton.air.video.models.VideoProfile;
	
	import robotlegs.bender.extensions.mediatorMap.api.IMediatorMap;
	
	import spark.events.PopUpEvent;
	
	public class PresentationViewMediator extends PresentationMediatorBase {
		
		[Inject]
		public var userUISession:IUISession;
		
		[Inject]
		public var goToSlideSignal:GoToSlideSignal;
		
		[Inject]
		public var mediatorMap:IMediatorMap;
		
		private var speaker:User = null;
		
		protected var dataProvider:ArrayCollection;
		
		private var manualSelection:Boolean = false;
		
		private var changeStream:Boolean = true;
		
		private var camerasHidden:Boolean = false;
		
		private var videoOffsetX:Number;
		
		private var videoOffsetY:Number;
		
		private var originalVideoX:Number;
		
		private var originalVideoY:Number;
		
		private var videoMovedDistanceX:Number = 0;
		
		private var videoMovedDistanceY:Number = 0;
		
		private var overlayTimer:Timer = new Timer(3.5 * 1000, 1);
		
		override public function initialize():void {
			super.initialize();
			view.slide.addEventListener(TransformGestureEvent.GESTURE_SWIPE, swipeHandler);
			userSession.userList.userChangeSignal.add(userChangeHandler);
			FlexGlobals.topLevelApplication.stage.addEventListener(ResizeEvent.RESIZE, stageOrientationChangingHandler);
			FlexGlobals.topLevelApplication.topActionBar.backBtn.visible = false;
			FlexGlobals.topLevelApplication.topActionBar.profileBtn.visible = true;
			view.content.addEventListener(MouseEvent.CLICK, showOverlay);
			dataProvider = new ArrayCollection();
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
				startStream(selectedUserProfile, displayUserStreamName.streamName);
			}
			setTemporaryOverlay();
			var displayUser:User;
			for each (var user:User in users) {
				if (user.streamName && user.streamName != "") {
					displayUser = user;
				}
			}
			if (displayUser) {
				startStream(displayUser, displayUser.streamName);
			}
			getView().videoStream.addEventListener(MouseEvent.CLICK, changeWebcamStream);
			getView().showSharedCamsGroup.addEventListener(MouseEvent.CLICK, changeWebcamStream);
			view.slide.addEventListener(ResizeEvent.RESIZE, presentationUpdated);
		}
		
		private function getView():IPresentationViewAir {
			return IPresentationViewAir(view);
		}
		
		private function presentationUpdated(e:ResizeEvent):void {
			setCamPosition();
		}
		
		private function setTemporaryOverlay():void {
			FlexGlobals.topLevelApplication.topActionBar.visible = false;
			FlexGlobals.topLevelApplication.topActionBar.includeInLayout = false;
			FlexGlobals.topLevelApplication.topActionBar.skin.setCurrentState("transparent");
			FlexGlobals.topLevelApplication.bottomMenu.visible = false;
			FlexGlobals.topLevelApplication.bottomMenu.includeInLayout = false;
			updatePresentationDimensions();
		}
		
		
		private function stageOrientationChangingHandler(e:Event):void {
			updatePresentationDimensions();
			FlexGlobals.topLevelApplication.bottomMenu.width = FlexGlobals.topLevelApplication.width;
			FlexGlobals.topLevelApplication.bottomMenu.y = FlexGlobals.topLevelApplication.height - FlexGlobals.topLevelApplication.bottomMenu.height;
			FlexGlobals.topLevelApplication.topActionBar.width = FlexGlobals.topLevelApplication.width;
			setCamPosition();
		}
		
		private function isVideoOutsideOfTheScreen():Boolean {
			return (getView().slide.height + getView().video.height > FlexGlobals.topLevelApplication.height)
		}
		
		private function setCamPosition():void {
			
			getView().videoStream.x = 0;
			getView().videoStream.y = 0;
			
			if (getView().video && isVideoOutsideOfTheScreen()) {
				getView().videoStream.addEventListener(MouseEvent.MOUSE_DOWN, moveCamBegin);
				getView().videoStream.addEventListener(MouseEvent.MOUSE_UP, moveCamEnd);
				getView().videoGroup.includeInLayout = false;
				getView().videoGroup.y = FlexGlobals.topLevelApplication.height - getView().videoGroup.height * 1.1;
				if (FlexGlobals.topLevelApplication.aspectRatio == "landscape") {
					getView().videoGroup.x = FlexGlobals.topLevelApplication.width - getView().video.width / 1.7;
				} else {
					getView().videoGroup.x = (FlexGlobals.topLevelApplication.width - getView().videoGroup.width) / 2;
				}
			} else {
				getView().videoStream.removeEventListener(MouseEvent.MOUSE_DOWN, moveCamBegin);
				getView().videoStream.removeEventListener(MouseEvent.MOUSE_UP, moveCamEnd);
				if (getView().videoGroup.visible) {
					getView().videoGroup.includeInLayout = true;
				}
				
			}
		}
		
		private function moveCamBegin(e:MouseEvent):void {
			e.target.alpha = 0.5;
			videoOffsetX = e.stageX - e.target.x;
			videoOffsetY = e.stageY - e.target.y;
			
			originalVideoX = getView().videoStream.x;
			originalVideoY = getView().videoStream.y;
			
			getView().content.addEventListener(MouseEvent.MOUSE_MOVE, dragCam);
		}
		
		private function dragCam(e:MouseEvent):void {
			
			var oldXPos:Number = getView().videoStream.x;
			var oldYPos:Number = getView().videoStream.y;
			
			getView().videoStream.x = e.stageX - videoOffsetX;
			getView().videoStream.y = e.stageY - videoOffsetY;
			
			videoMovedDistanceX += Math.abs(getView().videoStream.x - oldXPos);
			videoMovedDistanceY += Math.abs(getView().videoStream.y - oldYPos);
			
			e.updateAfterEvent();
		}
		
		private function moveCamEnd(e:MouseEvent):void {
			e.target.alpha = 1;
			if (videoMovedDistanceX < 10 || videoMovedDistanceY < 10) {
				getView().videoStream.x = originalVideoX;
				getView().videoStream.y = originalVideoY;
				changeStream = true;
			} else {
				changeStream = false;
			}
			videoMovedDistanceX = 0;
			videoMovedDistanceY = 0;
			getView().content.removeEventListener(MouseEvent.MOUSE_MOVE, dragCam);
		}
		
		private function updatePresentationDimensions():void {
			var newWidth:Number = FlexGlobals.topLevelApplication.width;
			var newHeight:Number = FlexGlobals.topLevelApplication.height;
			_slideModel.parentChange(newWidth, newHeight);
			resizePresentation();
		}
		
		private function getDisplayedUser():User {
			for each (var userStreamName:UserStreamName in dataProvider) {
				if (userStreamName.streamName == userUISession.currentStreamName) {
					return userStreamName.user;
				}
			}
			return null;
		}
		
		private function userChangeHandler(user:User, property:int):void {
			if (property == UserList.HAS_STREAM) {
				var displayedUser:User = getDisplayedUser();
				if (displayedUser && user.userID == displayedUser.userID && !user.hasStream) {
					stopStream(user.userID);
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
					if (userUISession.currentStreamName == userSession.userList.me.streamName && camNumber == 1 && !speaker) {
						checkVideo();
					}
				}
				if (userUISession.currentStreamName == "" && !speaker) {
					checkVideo();
				}
				dataProvider.length == 0 ? displayVideo(false) : displayVideo(true && !camerasHidden);
			} else if (property == UserList.PRESENTER && !speaker) {
				checkVideo();
			}
			dataProvider.refresh();
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
					if (changedUser.presenter && changedUser.hasStream || currentUser && changedUser.userID == currentUser.userID) {
						stopStream();
						startStream(changedUser, userStreamNames[0].streamName);
					} else if (userWithCamera) {
						if (userWithCamera.userID == changedUser.userID) {
							stopStream();
							startStream(changedUser, userStreamNames[0].streamName);
						} else if (!changedUser.hasStream && userWithCamera.me) {
							userStreamNames = getUserStreamNamesByUserID(userWithCamera.userID);
							stopStream();
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
							stopStream();
							startStream(newUser, displayUserStreamName.streamName);
							displayVideo(true && !camerasHidden);
						}
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
		
		private function displayVideo(value:Boolean):void {
			if (getView().videoGroup) {
				getView().videoGroup.visible = value;
				getView().videoGroup.includeInLayout = value;
			}
			if (!value) {
				userUISession.currentStreamName = "";
			} else {
				setCamPosition();
			}
			enableShowCamsButton((dataProvider.length > 0) && !value);
		}
		
		private function enableShowCamsButton(enable:Boolean):void {
			getView().showSharedCamsGroup.visible = enable;
			getView().showSharedCamsGroup.includeInLayout = enable;
			getView().showSharedCams.text = dataProvider.length.toString();
			if (dataProvider.length > 1) {
				getView().showSharedCams.text += " " + ResourceManager.getInstance().getString('resources', 'presentation.sharedWebcams');
			} else {
				getView().showSharedCams.text += " " + ResourceManager.getInstance().getString('resources', 'presentation.sharedWebcam');
			}
		}
		
		private function removeUserFromDataProvider(userID:String):void {
			for (var item:int; item < dataProvider.length; item++) {
				if ((dataProvider.getItemAt(item).user as User).userID == userID) {
					// -- in the end. see: http://stackoverflow.com/questions/4255226/how-to-remove-an-item-while-iterating-over-collection
					dataProvider.removeItemAt(item--);
				}
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
		
		private function getUserStreamNamesByUserID(userID:String):Array {
			var userStreamNames:Array = new Array();
			for each (var userStreamName:UserStreamName in dataProvider) {
				if (userStreamName.user.userID == userID) {
					userStreamNames.push(userStreamName);
				}
			}
			return userStreamNames;
		}
		
		private function changeWebcamStream(e:MouseEvent):void {
			e.stopPropagation();
			if (changeStream) {
				var popUp:SelectStreamPopUp = new SelectStreamPopUp();
				popUp.addEventListener(PopUpEvent.CLOSE, onPopUpClose, false, 0, true);
				popUp.width = view.content.width * 0.9;
				popUp.open(view as DisplayObjectContainer, true);
				mediatorMap.mediate(popUp);
				PopUpManager.centerPopUp(popUp);
			}
		}
		
		private function onPopUpClose(event:PopUpEvent):void {
			if (event.commit) {
				if (event.data == null) {
					camerasHidden = true;
					displayVideo(false);
				} else {
					camerasHidden = false;
					displayVideo(true);
					startStream(event.data.user, event.data.streamName);
				}
			}
		}
		
		private function showOverlay(e:MouseEvent):void {
			FlexGlobals.topLevelApplication.topActionBar.visible = true;
			FlexGlobals.topLevelApplication.bottomMenu.visible = true;
			overlayTimer.addEventListener(TimerEvent.TIMER_COMPLETE, hideOverlay);
			if (overlayTimer.running) {
				hideOverlay(null);
			} else {
				overlayTimer.start();
			}
		}
		
		private function hideOverlay(e:Event):void {
			overlayTimer.addEventListener(TimerEvent.TIMER_COMPLETE, hideOverlay);
			overlayTimer.stop();
			FlexGlobals.topLevelApplication.topActionBar.visible = false;
			FlexGlobals.topLevelApplication.bottomMenu.visible = false;
		}
		
		private function swipeHandler(e:TransformGestureEvent):void {
			if (userSession.userList.me.presenter) {
				if (e.offsetX == -1 && _currentSlideNum < _currentPresentation.slides.length - 1) {
					setCurrentSlideNum(_currentSlideNum + 1);
					goToSlideSignal.dispatch(_currentPresentation.id + "/" + _currentSlide.slideNumber);
				} else if (e.offsetX == 1 && _currentSlideNum > 0) {
					trace("current slide : " + _currentSlideNum);
					setCurrentSlideNum(_currentSlideNum - 1);
					goToSlideSignal.dispatch(_currentPresentation.id + "/" + _currentSlide.slideNumber);
				}
			}
		}
		
		private function startStream(user:User, streamName:String):void {
			if (view) {
				var videoProfile:VideoProfile = userSession.videoProfileManager.getVideoProfileByStreamName(streamName);
				var videoWidth:Number = getView().content.width / 3;
				var videoHeight:Number = getView().content.height / 3;
				if (FlexGlobals.topLevelApplication.aspectRatio == "landscape") {
					var temp:Number = videoWidth;
					videoWidth = videoHeight;
					videoHeight = temp;
				}
				getView().startStream(userSession.videoConnection.connection, user.name, streamName, user.userID, videoProfile.width, videoProfile.height, videoWidth, videoHeight);
				userUISession.currentStreamName = streamName;
				//currentUser = user;
				getView().videoGroup.height = getView().video.height;
			}
		}
		
		private function stopStream(userID:String = ""):void {
			if (view) {
				getView().stopStream();
				userUISession.currentStreamName = userID;
			}
		}
		
		/**
		 *
		 */
		override public function destroy():void {
			view.slide.removeEventListener(ResizeEvent.RESIZE, presentationUpdated);
			userSession.userList.userChangeSignal.remove(userChangeHandler);
			getView().videoStream.removeEventListener(MouseEvent.CLICK, changeWebcamStream);
			getView().showSharedCamsGroup.removeEventListener(MouseEvent.CLICK, changeWebcamStream);
			FlexGlobals.topLevelApplication.topActionBar.skin.setCurrentState("normal");
			FlexGlobals.topLevelApplication.topActionBar.includeInLayout = true;
			FlexGlobals.topLevelApplication.topActionBar.visible = true;
			FlexGlobals.topLevelApplication.bottomMenu.visible = false;
			view.content.removeEventListener(MouseEvent.CLICK, showOverlay);
			overlayTimer.removeEventListener(TimerEvent.TIMER_COMPLETE, hideOverlay);
			FlexGlobals.topLevelApplication.stage.removeEventListener(ResizeEvent.RESIZE, stageOrientationChangingHandler);
			getView().dispose();
			super.destroy();
		}
	}
}
