package org.bigbluebutton.web.toolbar.micbutton.toolbarbutton {
	
	import flash.display.DisplayObject;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.media.Microphone;
	
	import mx.controls.Menu;
	import mx.core.FlexGlobals;
	import mx.events.MenuEvent;
	import mx.managers.PopUpManager;
	import mx.styles.IStyleManager2;
	import mx.styles.StyleManager;
	
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.models.User;
	import org.bigbluebutton.lib.user.models.UserList;
	import org.bigbluebutton.lib.user.services.IUsersService;
	import org.bigbluebutton.lib.voice.commands.ShareMicrophoneSignal;
	import org.bigbluebutton.lib.voice.models.PhoneOptions;
	import org.bigbluebutton.web.toolbar.micbutton.audioselectionwindow.AudioSelectionWindow;
	import org.bigbluebutton.web.toolbar.micbutton.commands.AudioSelectionWindowClosedSignal;
	import org.bigbluebutton.web.toolbar.webcambutton.cameradisplaysettings.CameraDisplaySettings;
	import org.bigbluebutton.web.toolbar.webcambutton.commands.CamSettingsClosedSignal;
	import org.bigbluebutton.web.toolbar.webcambutton.commands.ShareCameraSignal;
	import org.bigbluebutton.web.util.i18n.ResourceUtil;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	import robotlegs.bender.extensions.mediatorMap.api.IMediatorMap;
	
	public class ToolbarButtonMediator extends Mediator {
		
		[Inject]
		public var view:ToolbarButton;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var usersService:IUsersService;
		
		[Inject]
		public var mediatorMap:IMediatorMap;
		
		[Inject]
		public var shareMicrophoneSignal:ShareMicrophoneSignal;
		
		[Inject]
		public var audioSelectionWindowClosedSignal:AudioSelectionWindowClosedSignal;
		
		private static const LOG:String = "Phone::ToolbarButton - ";
		
		private var mic:Microphone;
		
		public const DEFAULT_STATE:Number = 0;
		
		public const ACTIVE_STATE:Number = 1;
		
		private var _currentState:Number = DEFAULT_STATE;
		
		override public function initialize():void {
			// when the button is added to the stage display the audio selection window if auto join is true
			if (userSession.phoneOptions.autoJoin) {
				if (userSession.phoneOptions.skipCheck || /*me.micdisabled || */ defaultListenOnlyMode) {
					if ((userSession.phoneOptions.presenterShareOnly && !userSession.userList.me.presenter && !userSession.userList.me.isModerator()) || /*me.micdisabled || */ defaultListenOnlyMode) {
						
						var audioOptions:Object = new Object();
						audioOptions.shareMic = false;
						audioOptions.listenOnly = true;
						shareMicrophoneSignal.dispatch(audioOptions);
					} else {
						var audioOptions:Object = new Object();
						audioOptions.shareMic = true;
						audioOptions.listenOnly = false;
						shareMicrophoneSignal.dispatch(audioOptions);
					}
				} else {
					trace(LOG + "Sending Show Audio Selection command");
					shareMicrophone();
				}
			} else {
				joinDefaultListenOnlyMode();
			}
			
			view.addEventListener(MouseEvent.MOUSE_OUT, mouseOutHandler);
			view.addEventListener(MouseEvent.MOUSE_OVER, mouseOverHandler);
			view.addEventListener(MouseEvent.CLICK, startPhone);
			audioSelectionWindowClosedSignal.add(handleClosedAudioSelectionWindowEvent);
			userSession.userList.userChangeSignal.add(userChangeHandler);
		}
		
		private function userChangeHandler(user:User, type:int):void {
			trace("++ a user has changed");
			if (user.me) {
				trace("++ and its me");
				switch (type) {
					case UserList.JOIN_AUDIO:
						trace("++ joining audio");
						if (user.voiceJoined) {
							handleFlashJoinedVoiceConferenceEvent();
						} else {
							handleFlashLeftVoiceConferenceEvent();
						}
						break;
					case UserList.LISTEN_ONLY:
						trace("++ listen only");
						if (user.listenOnly) {
							handleFlashJoinedListenOnlyConferenceEvent();
						} else {
							handleFlashLeftVoiceConferenceEvent();
						}
						break;
				}
			}
		}
		
		
		private function shareMicrophone() {
			var audioSelection:AudioSelectionWindow = new AudioSelectionWindow();
			mediatorMap.mediate(audioSelection);
			PopUpManager.addPopUp(audioSelection, FlexGlobals.topLevelApplication.parent as DisplayObject, true);
			PopUpManager.centerPopUp(audioSelection);
		}
		
		override public function destroy():void {
			super.destroy();
			view = null;
		}
		
		private function startPhone(e:MouseEvent):void {
			var viewUser:User = userSession.userList.me;
			
			// Disable the button right away to prevent the user from clicking
			// multiple times.
			view.enabled = false;
			if (!viewUser.listenOnly && !viewUser.voiceJoined) {
				if ( /*me.micdisabled || */defaultListenOnlyMode) {
					var audioOptions:Object = new Object();
					audioOptions.shareMic = false;
					audioOptions.listenOnly = true;
					shareMicrophoneSignal.dispatch(audioOptions);
				} else {
					shareMicrophone();
				}
			} else {
				var audioOptions:Object = new Object();
				audioOptions.shareMic = false;
				audioOptions.listenOnly = false;
				shareMicrophoneSignal.dispatch(audioOptions);
			}
		}
		
		
		private function get defaultListenOnlyMode():Boolean {
			return (userSession.phoneOptions.listenOnlyMode && userSession.phoneOptions.forceListenOnly);
		}
		
		/*		public function remoteClick(event:ShortcutEvent):void {
		   view.selected = true;
		   startPhone();
		   } */
		
		
		private function mouseOverHandler(event:MouseEvent):void {
			if (_currentState == ACTIVE_STATE)
				view.styleName = "voiceConfInactiveButtonStyle";
			else
				view.styleName = "voiceConfActiveButtonStyle";
		}
		
		private function mouseOutHandler(event:MouseEvent):void {
			if (_currentState == ACTIVE_STATE)
				view.styleName = "voiceConfActiveButtonStyle";
			else
				view.styleName = "voiceConfDefaultButtonStyle";
		}
		
		private function onUserJoinedConference():void {
			userSession.phoneOptions.firstAudioJoin = false;
			
			view.selected = true;
			view.enabled = true;
			
			_currentState = ACTIVE_STATE;
			view.styleName = "voiceConfActiveButtonStyle";
			view.toolTip = ResourceUtil.getInstance().getString('bbb.toolbar.phone.toolTip.stop');
		}
		
		private function onUserJoinedListenOnlyConference():void {
			
			resetButtonState();
		}
		
		private function onUserLeftConference():void {
			view.selected = false;
			view.enabled = true;
			_currentState = DEFAULT_STATE;
			view.styleName = "voiceConfDefaultButtonStyle";
			view.toolTip = ResourceUtil.getInstance().getString('bbb.toolbar.phone.toolTip.start');
		}
		
		private function joinDefaultListenOnlyMode(micLeft:Boolean = true):void {
			if (defaultListenOnlyMode && micLeft) {
				var audioOptions:Object = new Object();
				audioOptions.shareMic = false;
				audioOptions.listenOnly = true;
				shareMicrophoneSignal.dispatch(audioOptions);
			}
		}
		
		private function handleFlashJoinedVoiceConferenceEvent():void {
			onUserJoinedConference();
		}
		
		private function handleFlashJoinedListenOnlyConferenceEvent():void {
			if (defaultListenOnlyMode) {
				onUserJoinedListenOnlyConference();
			} else {
				onUserJoinedConference();
			}
		}
		
		private function handleFlashLeftVoiceConferenceEvent():void {
			var micLeft:Boolean = (_currentState == ACTIVE_STATE);
			onUserLeftConference();
			joinDefaultListenOnlyMode(micLeft);
		}
		
		/*		private function handleWebRTCCallStartedEvent(event:WebRTCCallEvent):void {
		   trace(LOG + "User has joined the conference using webrtc");
		   onUserJoinedConference();
		   } */
		
		/*		private function handleWebRTCCallEndedEvent(event:WebRTCCallEvent):void {
		   trace(LOG + "User has left the conference using webrtc");
		   onUserLeftConference();
		   joinDefaultListenOnlyMode();
		   } */
		
		private function handleStopEchoTestEvent(event:Event):void {
			resetButtonState();
			joinDefaultListenOnlyMode();
		}
		
		private function resetButtonState():void {
			trace("++ hello");
			view.selected = false;
			view.enabled = true;
			_currentState = DEFAULT_STATE;
			view.styleName = "voiceConfDefaultButtonStyle";
			view.toolTip = ResourceUtil.getInstance().getString('bbb.toolbar.phone.toolTip.start');
		}
		
		private function handleClosedAudioSelectionWindowEvent():void {
			view.selected = false;
			view.enabled = true;
			_currentState = DEFAULT_STATE;
			view.styleName = "voiceConfDefaultButtonStyle";
			view.toolTip = ResourceUtil.getInstance().getString('bbb.toolbar.phone.toolTip.start');
			joinDefaultListenOnlyMode();
		}
		
		
		/*	public function getAlignment():String {
		   return MainToolbar.ALIGN_LEFT;
		   } */
		
		public function theory():String {
			return "Audio button";
		}
	
	/*	private function joinVoiceFocusHead(e:BBBEvent):void {
	   view.setFocus();
	   } */
	}
}

