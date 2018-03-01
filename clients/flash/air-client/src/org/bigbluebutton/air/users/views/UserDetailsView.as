package org.bigbluebutton.air.users.views {
	import mx.graphics.SolidColor;
	
	import spark.components.Button;
	import spark.components.Group;
	import spark.components.Label;
	import spark.components.Scroller;
	import spark.components.SkinnableContainer;
	import spark.components.VGroup;
	import spark.layouts.VerticalLayout;
	import spark.primitives.Rect;
	
	import org.bigbluebutton.air.common.views.NoTabView;
	import org.bigbluebutton.air.main.views.TopToolbarAIR;
	import org.bigbluebutton.air.users.views.models.UserDetailsVM;
	import org.bigbluebutton.lib.common.views.ParticipantIcon;
	import org.bigbluebutton.lib.user.models.EmojiStatus;
	import org.bigbluebutton.lib.user.models.UserRole;
	import org.bigbluebutton.lib.user.utils.UserUtils;
	
	public class UserDetailsView extends NoTabView {
		private var _participantIcon:ParticipantIcon;
		
		private var _participantLabel:Label;
		
		private var _participantBackground:Rect;
		
		private var _showCameraButton:Button;
		
		public function get showCameraButton():Button {
			return _showCameraButton;
		}
		
		private var _privateChatButton:Button;
		
		public function get privateChatButton():Button {
			return _privateChatButton;
		}
		
		private var _clearStatusButton:Button;
		
		public function get clearStatusButton():Button {
			return _clearStatusButton;
		}
		
		private var _makePresenterButton:Button;
		
		public function get makePresenterButton():Button {
			return _makePresenterButton;
		}
		
		private var _promoteButton:Button;
		
		public function get promoteButton():Button {
			return _promoteButton;
		}
		
		private var _demoteButton:Button;
		
		public function get demoteButton():Button {
			return _demoteButton;
		}
		
		private var _lockButton:Button;
		
		public function get lockButton():Button {
			return _lockButton;
		}
		
		private var _unlockButton:Button;
		
		public function get unlockButton():Button {
			return _unlockButton;
		}
		
		private var _muteButton:Button;
		
		public function get muteButton():Button {
			return _muteButton;
		}
		
		private var _unmuteButton:Button;
		
		public function get unmuteButton():Button {
			return _unmuteButton;
		}
		
		private var _kickButton:Button;
		
		public function get kickButton():Button {
			return _kickButton;
		}
		
		private var _viewModel:UserDetailsVM;
		
		public function UserDetailsView() {
			super();
			
			styleName = "mainView";
			
			var l:VerticalLayout = new VerticalLayout();
			l.gap = 0;
			l.horizontalAlign = "center";
			layout = l;
			
			var skinnableWrapper:SkinnableContainer = new SkinnableContainer();
			skinnableWrapper.styleName = "subViewContent";
			skinnableWrapper.percentWidth = 100;
			skinnableWrapper.percentHeight = 100;
			
			var scroller:Scroller = new Scroller();
			scroller.percentWidth = 100;
			scroller.percentHeight = 100;
			scroller.setStyle("horizontalScrollPolicy", "off");
			
			var sGroup:VGroup = new VGroup();
			sGroup.percentWidth = 100;
			sGroup.percentHeight = 100;
			sGroup.horizontalAlign = "center";
			sGroup.setStyle("horizontalScrollPolicy", "off");
			scroller.viewport = sGroup;
			
			var participantHolder:Group = new Group();
			participantHolder.percentWidth = 100;
			sGroup.addElement(participantHolder);
			
			_participantBackground = new Rect();
			_participantBackground.percentHeight = 100;
			_participantBackground.percentWidth = 100;
			_participantBackground.fill = new SolidColor();
			participantHolder.addElement(_participantBackground);
			
			_participantIcon = new ParticipantIcon();
			_participantIcon.horizontalCenter = 0;
			_participantIcon.styleName = "participantIconSettings";
			participantHolder.addElement(_participantIcon);
			
			_participantLabel = new Label();
			_participantLabel.horizontalCenter = 0;
			participantHolder.addElement(_participantLabel);
			
			_showCameraButton = new Button();
			_showCameraButton.percentWidth = 90;
			_showCameraButton.label = "Show Camera"; //{resourceManager.getString('resources', 'userDetail.cameraBtn.text')}"
			sGroup.addElement(_showCameraButton);
			
			_privateChatButton = new Button();
			_privateChatButton.percentWidth = 90;
			_privateChatButton.label = "Private Chat"; //{resourceManager.getString('resources', 'userDetail.privateChatBtn.text')}"
			sGroup.addElement(_privateChatButton);
			
			_clearStatusButton = new Button();
			_clearStatusButton.percentWidth = 90;
			_clearStatusButton.label = "Clear Status"; //{resourceManager.getString('resources', 'userDetail.clearStatus')}"
			sGroup.addElement(_clearStatusButton);
			
			_makePresenterButton = new Button();
			_makePresenterButton.percentWidth = 90;
			_makePresenterButton.label = "Make Presenter"; //{resourceManager.getString('resources', 'userDetail.presenterBtn.text')}"
			sGroup.addElement(_makePresenterButton);
			
			_promoteButton = new Button();
			_promoteButton.percentWidth = 90;
			_promoteButton.label = "Promote to Moderator"; //{resourceManager.getString('resources', 'userDetail.promoteButton.text')}"
			sGroup.addElement(_promoteButton);
			
			_demoteButton = new Button();
			_demoteButton.percentWidth = 90;
			_demoteButton.label = "Demote to Viewer"; //{resourceManager.getString('resources', 'userDetail.demoteButton.text')}"
			sGroup.addElement(_demoteButton);
			
			_lockButton = new Button();
			_lockButton.percentWidth = 90;
			_lockButton.label = "Lock User"; //{resourceManager.getString('resources', 'userDetail.lockButton.text')}"
			sGroup.addElement(_lockButton);
			
			_unlockButton = new Button();
			_unlockButton.percentWidth = 90;
			_unlockButton.label = "Unlock User"; //{resourceManager.getString('resources', 'userDetail.unlockButton.text')}"
			sGroup.addElement(_unlockButton);
			
			_muteButton = new Button();
			_muteButton.percentWidth = 90;
			_muteButton.label = "Mute User"; //{resourceManager.getString('resources', 'userDetail.muteButton.text')}"
			sGroup.addElement(_muteButton);
			
			_unmuteButton = new Button();
			_unmuteButton.percentWidth = 90;
			_unmuteButton.label = "Unmute User"; //{resourceManager.getString('resources', 'userDetail.unmuteButton.text')}"
			sGroup.addElement(_unmuteButton);
			
			_kickButton = new Button();
			_kickButton.percentWidth = 90;
			_kickButton.label = "Remove User"; //{resourceManager.getString('resources', 'userDetail.kickButton.text')}"
			sGroup.addElement(_kickButton);
			
			skinnableWrapper.addElement(scroller);
			
			addElement(skinnableWrapper);
		}
		
		override protected function createToolbar():TopToolbarAIR {
			return new TopToolbarUserDetails();
		}
		
		public function setViewModel(vm:UserDetailsVM):void {
			_viewModel = vm;
		}
		
		/**
		 *
		 */
		public function update():void {
			if (_viewModel != null) {
				/*
				   if (_isMe) {
				   userNameText.text = _user.name + " " + resourceManager.getString('resources', 'userDetail.you');
				   } else {
				   userNameText.text = _user.name;
				   }
				   if (_user.presenter) {
				   roleText.text = resourceManager.getString('resources', 'participants.status.presenter');
				   if (_user.role == UserRole.MODERATOR) {
				   roleText.text += "/" + resourceManager.getString('resources', 'participants.status.moderator');
				   }
				   } else if (_user.role == UserRole.MODERATOR) {
				   roleText.text = resourceManager.getString('resources', 'participants.status.moderator');
				   } else {
				   roleText.text = "";
				   }
				 */
				
				_participantIcon.setInitials(UserUtils.getInitials(_viewModel.userName));
				_participantIcon.setRole(_viewModel.userModerator ? UserRole.MODERATOR : UserRole.VIEWER);
				_participantLabel.text = _viewModel.userName;
				
				if (_viewModel.userEmoji != EmojiStatus.NO_STATUS && _viewModel.amIModerator) {
					clearStatusButton.includeInLayout = true;
					clearStatusButton.visible = true;
				} else {
					clearStatusButton.includeInLayout = false;
					clearStatusButton.visible = false;
				}
				if (!_viewModel.userPresenter && _viewModel.amIModerator) {
					makePresenterButton.includeInLayout = true;
					makePresenterButton.visible = true;
				} else {
					makePresenterButton.includeInLayout = false;
					makePresenterButton.visible = false;
				}
				if (!_viewModel.userModerator && _viewModel.amIModerator) {
					promoteButton.includeInLayout = true;
					promoteButton.visible = true;
					demoteButton.includeInLayout = false;
					demoteButton.visible = false;
				} else if (_viewModel.userModerator && _viewModel.amIModerator) {
					promoteButton.includeInLayout = false;
					promoteButton.visible = false;
					demoteButton.includeInLayout = true;
					demoteButton.visible = true;
				} else {
					promoteButton.includeInLayout = false;
					promoteButton.visible = false;
					demoteButton.includeInLayout = false;
					demoteButton.visible = false;
				}
				//cameraIcon.visible = cameraIcon.includeInLayout = false;// _user.hasStream;
				//micIcon.visible = micIcon.includeInLayout = false; //(_user.voiceJoined && !_user.muted);
				//micOffIcon.visible = micOffIcon.includeInLayout = false; //(_user.voiceJoined && _user.muted);
				//noMediaText.visible = noMediaText.includeInLayout = false; //(!_user.voiceJoined && !_user.hasStream);
				//TODO: buttons
				showCameraButton.includeInLayout = false; //_user.hasStream;
				showCameraButton.visible = false; //_user.hasStream;
				privateChatButton.includeInLayout = !_viewModel.me;
				privateChatButton.visible = !_viewModel.me;
				
				if (_viewModel.amIModerator && _viewModel.roomLocked && !_viewModel.userModerator) {
					if (_viewModel.userLocked) {
						unlockButton.visible = true;
						unlockButton.includeInLayout = true;
						lockButton.visible = false;
						lockButton.includeInLayout = false;
					} else {
						unlockButton.visible = false;
						unlockButton.includeInLayout = false;
						lockButton.visible = true;
						lockButton.includeInLayout = true;
					}
				} else {
					unlockButton.visible = false;
					unlockButton.includeInLayout = false;
					lockButton.visible = false;
					lockButton.includeInLayout = false;
				}
				
				if (_viewModel.amIModerator && !_viewModel.me) {
					kickButton.visible = true;
					kickButton.includeInLayout = true;
				} else {
					kickButton.visible = false;
					kickButton.includeInLayout = false;
				}
				
				if (_viewModel.userVoiceJoined && _viewModel.userMuted && _viewModel.amIModerator) {
					muteButton.visible = false;
					muteButton.includeInLayout = false;
					unmuteButton.visible = true;
					unmuteButton.includeInLayout = true;
				} else if (_viewModel.userVoiceJoined && !_viewModel.userMuted && _viewModel.amIModerator) {
					muteButton.visible = true;
					muteButton.includeInLayout = true;
					unmuteButton.visible = false;
					unmuteButton.includeInLayout = false;
				} else {
					muteButton.visible = false;
					muteButton.includeInLayout = false;
					unmuteButton.visible = false;
					unmuteButton.includeInLayout = false;
				}
			}
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			
			setParticipantStyle();
		}
		
		private function setParticipantStyle():void {
			var groupsPadding:Number = getStyle("groupsPadding");
			
			SolidColor(_participantBackground.fill).color = getStyle("headerBackground");
			_participantIcon.top = groupsPadding * 1.75;
			_participantLabel.setStyle("color", _participantIcon.getStyle("color"));
			_participantLabel.setStyle("fontSize", _participantIcon.getStyle("fontSize") * 0.65);
			_participantLabel.setStyle("paddingBottom", groupsPadding);
			_participantLabel.y = _participantIcon.y + _participantIcon.height + groupsPadding;
			
			_makePresenterButton.styleName = "userDetailsButton";
			_unlockButton.styleName = "userDetailsButton";
			_lockButton.styleName = "userDetailsButton";
			_promoteButton.styleName = "userDetailsButton";
			_demoteButton.styleName = "userDetailsButton";
			_kickButton.styleName = "userDetailsButton";
			_muteButton.styleName = "userDetailsButton";
			_unmuteButton.styleName = "userDetailsButton";
			_showCameraButton.styleName = "userDetailsButton";
			_privateChatButton.styleName = "userDetailsButton";
			_clearStatusButton.styleName = "userDetailsButton";
		}
	}
}
