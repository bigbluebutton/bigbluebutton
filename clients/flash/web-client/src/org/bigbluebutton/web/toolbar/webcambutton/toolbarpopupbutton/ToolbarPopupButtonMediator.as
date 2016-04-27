package org.bigbluebutton.web.toolbar.webcambutton.toolbarpopupbutton {
	
	import flash.display.DisplayObject;
	import flash.events.MouseEvent;
	import flash.geom.Point;
	import flash.media.Camera;
	
	import mx.controls.Menu;
	import mx.core.FlexGlobals;
	import mx.events.MenuEvent;
	import mx.managers.PopUpManager;
	import mx.styles.IStyleManager2;
	import mx.styles.StyleManager;
	
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.services.IUsersService;
	import org.bigbluebutton.web.toolbar.webcambutton.cameradisplaysettings.CameraDisplaySettings;
	import org.bigbluebutton.web.toolbar.webcambutton.commands.CamSettingsClosedSignal;
	import org.bigbluebutton.web.toolbar.webcambutton.commands.ShareCameraSignal;
	import org.bigbluebutton.web.util.i18n.ResourceUtil;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	import robotlegs.bender.extensions.mediatorMap.api.IMediatorMap;
	
	public class ToolbarPopupButtonMediator extends Mediator {
		
		[Inject]
		public var view:ToolbarPopupButton;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var usersService:IUsersService;
		
		[Inject]
		public var mediatorMap:IMediatorMap;
		
		[Inject]
		public var shareCameraSignal:ShareCameraSignal;
		
		[Inject]
		public var camSettingsClosedSignal:CamSettingsClosedSignal;
		
		public const OFF_STATE:Number = 0;
		
		public const ON_STATE:Number = 1;
		
		public const STOP_PUBLISHING:Number = 0;
		
		public const START_PUBLISHING:Number = 1;
		
		private var _currentState:Number = OFF_STATE;
		
		private var camerasDataProvider:Array = [];
		
		private var dataMenu:Menu;
		
		public var numberOfCamerasOff:int = 0;
		
		override public function initialize():void {
			view.addEventListener(MouseEvent.CLICK, openPublishWindow);
			numberOfCamerasOff = Camera.names.length;
			var cameraName:String;
			for (var i:int = 0; i < Camera.names.length; i++) {
				cameraName = Camera.names[i];
				if (cameraName == " ") {
					cameraName = ResourceUtil.getInstance().getString('bbb.toolbar.video.unknownCameraName');
				}
				camerasDataProvider.push({label: cameraName, status: OFF_STATE});
			}
			
			dataMenu = Menu.createMenu(view, camerasDataProvider, false);
			dataMenu.addEventListener("itemClick", changeHandler);
			dataMenu.addEventListener("mouseOver", mouseOverHandler);
			dataMenu.addEventListener("mouseOut", mouseOutHandler);
			dataMenu.iconFunction = webcamMenuIcon;
			
			view.popUp = dataMenu;
			
			if (camerasDataProvider.length == 0) {
				view.enabled = false;
				view.styleName = "webcamOffButtonStyle";
				view.toolTip = ResourceUtil.getInstance().getString('bbb.video.publish.hint.noCamera');
			} else {
				view.addEventListener(MouseEvent.MOUSE_OVER, mouseOverHandler);
				view.addEventListener(MouseEvent.MOUSE_OUT, mouseOutHandler);
				switchStateToNormal();
			}
			camSettingsClosedSignal.add(handleCamSettingsClosedEvent);
			shareCameraSignal.add(startedSharing);
		}
		
		private function startedSharing(share:Boolean, cam:String):void {
			if (share) {
				setCamAsActive(Number(cam));
			} else {
				if (cam) {
					setCamAsInactive(Number(cam));
					if (allCamerasInactive()) {
						_currentState = OFF_STATE;
					}
				} else {
					setAllCamAsInactive();
					_currentState = OFF_STATE;
				}
			}
		}
		
		private function allCamerasInactive():Boolean {
			var changeStatus:Boolean = true;
			for each (var c in camerasDataProvider) {
				if (c.status == ON_STATE) {
					changeStatus = false;
				}
			}
			return changeStatus;
		}
		
		public function lockSettingsChanged(e:*):void {
			updateButton();
		}
		
		/*private function refreshRole(e:ChangeMyRole):void {
		   updateButton();
		   }*/
		
		private function updateButton():void {
			//var userManager:UserManager = UserManager.getInstance();
			//var conference:Conference = userManager.getConference();
			//var me:BBBUser = conference.getMyUser();
			
			view.visible = true //!me.disableMyCam;
			view.includeInLayout = true //!me.disableMyCam;
		}
		
		private function webcamMenuIcon(item:Object):Class {
			var styleManager:IStyleManager2 = StyleManager.getStyleManager(null);
			if (item.status == ON_STATE) {
				return styleManager.getStyleDeclaration(".webcamOnButtonStyle").getStyle("icon");
			} else {
				return styleManager.getStyleDeclaration(".webcamDefaultButtonStyle").getStyle("icon");
			}
		}
		
		private function switchStateToNormal():void {
			view.toolTip = ResourceUtil.getInstance().getString('bbb.toolbar.video.toolTip.start');
			view.styleName = "webcamDefaultButtonStyle";
			view.enabled = true;
			view.selected = false;
			_currentState = OFF_STATE;
			lockSettingsChanged(null);
		}
		
		public function set isPresenter(presenter:Boolean):void {
			view.visible = view.includeInLayout = presenter;
		}
		
		/*public function remoteClick(e:ShortcutEvent):void {
		   openPublishWindow();
		   dispatchEvent(new ShortcutEvent(ShortcutEvent.REMOTE_FOCUS_WEBCAM));
		   }*/
		
		public function publishingStatus(status:Number, camID:Number = -1):void {
			if (status == START_PUBLISHING) {
				_currentState = ON_STATE;
				view.toolTip = ResourceUtil.getInstance().getString('bbb.toolbar.video.toolTip.stop');
				view.styleName = "webcamOnButtonStyle";
				view.enabled = true;
				view.selected = true;
			} else {
				if (camID != -1) {
					camerasDataProvider[camID].status = OFF_STATE;
					if (numberOfCamerasOff < Camera.names.length)
						numberOfCamerasOff++;
					
				}
				if (numberOfCamerasOff == Camera.names.length) {
					switchStateToNormal();
				}
			}
			//var evt:BBBEvent = new BBBEvent("EnableToolbarPopupButton");
			//dispatchEvent(evt);
			
			dataMenu.dataProvider = camerasDataProvider;
		}
		
		
		private function openPublishWindow(e:MouseEvent):void {
			view.enabled = false;
			if (_currentState == ON_STATE) {
				trace("[ToolbarPopupButton:openPublishWindow] Close window");
				switchStateToNormal();
				shareCameraSignal.dispatch(false, null);
				view.enabled = true;
			} else {
				trace("Share camera");
				if (numberOfCamerasOff > 0)
					numberOfCamerasOff--;
				_currentState = ON_STATE;
				view.styleName = "webcamOnButtonStyle";
				view.selected = true;
				shareCamera();
			}
		}
		
		private function shareCamera(camIndex:Number = 0) {
			var camSettings:CameraDisplaySettings = new CameraDisplaySettings();
			camSettings.camInvoked = camIndex;
			mediatorMap.mediate(camSettings);
			PopUpManager.addPopUp(camSettings, FlexGlobals.topLevelApplication.parent as DisplayObject, true);
			
			var point1:Point = new Point();
			// Calculate position of TitleWindow in Application's coordinates.
			point1.x = FlexGlobals.topLevelApplication.width / 2;
			point1.y = FlexGlobals.topLevelApplication.height / 2;
			camSettings.x = point1.x - (camSettings.width / 2);
			camSettings.y = point1.y - (camSettings.height / 2);
		}
		
		private function handleCamSettingsClosedEvent(clicked:String):void {
			view.setFocus();
			view.enabled = true;
			if (clicked == "cancel") {
				if (numberOfCamerasOff < Camera.names.length)
					numberOfCamerasOff++;
				if (allCamerasInactive) {
					switchStateToNormal();
				}
			}
		}
		
		private function mouseOverHandler(event:MouseEvent):void {
			if (_currentState == ON_STATE)
				view.styleName = "webcamOffButtonStyle";
			else
				view.styleName = "webcamOnButtonStyle";
			view.selected = false;
		}
		
		private function mouseOutHandler(event:MouseEvent):void {
			if (_currentState == ON_STATE)
				view.styleName = "webcamOnButtonStyle";
			else
				view.styleName = "webcamDefaultButtonStyle";
			view.selected = false;
		}
		
		private function changeHandler(event:MenuEvent):void {
			if (camerasDataProvider[event.index].status == ON_STATE) {
				shareCameraSignal.dispatch(false, event.index.toString());
			} else {
				view.enabled = false;
				if (numberOfCamerasOff > 0)
					numberOfCamerasOff--;
				_currentState = ON_STATE;
				shareCamera(event.index);
			}
		}
		
		public function setCamAsInactive(camIndex:int):void {
			if (camIndex != -1) {
				camerasDataProvider[camIndex].status = OFF_STATE;
				dataMenu.dataProvider = camerasDataProvider;
			}
		}
		
		public function setAllCamAsInactive():void {
			numberOfCamerasOff = Camera.names.length;
			for (var i:int = 0; i < Camera.names.length; i++) {
				setCamAsInactive(i);
			}
			switchStateToNormal();
		}
		
		public function setCamAsActive(camIndex:int):void {
			if (camIndex != -1) {
				camerasDataProvider[camIndex].status = ON_STATE;
				dataMenu.dataProvider = camerasDataProvider;
			}
		}
		
		override public function destroy():void {
			super.destroy();
			view = null;
		}
	}
}

