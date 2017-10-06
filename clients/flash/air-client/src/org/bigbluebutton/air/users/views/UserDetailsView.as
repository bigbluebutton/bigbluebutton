package org.bigbluebutton.air.users.views {
	import mx.core.FlexGlobals;
	
	import spark.components.Button;
	import spark.components.Group;
	import spark.components.HGroup;
	import spark.components.Image;
	import spark.components.Scroller;
	import spark.components.SkinnableContainer;
	import spark.components.VGroup;
	import spark.layouts.VerticalLayout;
	
	import org.bigbluebutton.air.common.views.NoTabView;
	import org.bigbluebutton.air.main.views.TopToolbarAIR;
	import org.bigbluebutton.air.users.views.models.UserDetailsVM;
	import org.bigbluebutton.lib.user.models.EmojiStatus;
	import org.bigbluebutton.lib.user.models.User2x;
	import org.bigbluebutton.lib.user.models.UserRole;
	
	public class UserDetailsView extends NoTabView {
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
		
		private var _lockButton:Button;
		
		public function get lockButton():Button {
			return _lockButton;
		}
		
		private var _unlockButton:Button;
		
		public function get unlockButton():Button {
			return _unlockButton;
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
			sGroup.setStyle("horizontalScrollPolicy", "off");
			scroller.viewport = sGroup;
			
			// add an Initials Circle
			
			_showCameraButton = new Button();
			_showCameraButton.percentWidth = 90;
			_showCameraButton.label= "Show Camera"; //{resourceManager.getString('resources', 'userDetail.cameraBtn.text')}"
			_showCameraButton.styleName="userSettingsButton logoutButton contentFontSize";
			sGroup.addElement(_showCameraButton);
			
			_privateChatButton = new Button();
			_privateChatButton.percentWidth = 90;
			_privateChatButton.label = "Private Chat"; //{resourceManager.getString('resources', 'userDetail.privateChatBtn.text')}"
			_privateChatButton.styleName = "userSettingsButton logoutButton contentFontSize";
			sGroup.addElement(_privateChatButton);
			
			_clearStatusButton = new Button();
			_clearStatusButton.percentWidth = 90;
			_clearStatusButton.label = "Clear Status"; //{resourceManager.getString('resources', 'userDetail.clearStatus')}"
			_clearStatusButton.styleName = "userSettingsButton logoutButton contentFontSize";
			sGroup.addElement(_clearStatusButton);
			
			_makePresenterButton = new Button();
			_makePresenterButton.percentWidth
			_makePresenterButton.label= "Make Presenter"; //{resourceManager.getString('resources', 'userDetail.presenterBtn.text')}"
			_makePresenterButton.styleName="userSettingsButton logoutButton contentFontSize";
			sGroup.addElement(_makePresenterButton);
			
			_promoteButton = new Button();
			_promoteButton.percentWidth = 90;
			_promoteButton.label = "Promote to Moderator";
			_promoteButton.styleName="userSettingsButton logoutButton contentFontSize";
			sGroup.addElement(_promoteButton);
			
			_lockButton = new Button();
			_lockButton.percentWidth = 90;
			_lockButton.label="Lock User"; //{resourceManager.getString('resources', 'userDetail.lockButton.text')}"
			_lockButton.styleName="userSettingsButton logoutButton contentFontSize";
			sGroup.addElement(_lockButton);
			
			_unlockButton = new Button();
			_unlockButton.percentWidth = 90;
			_unlockButton.label="Unlock User"; //{resourceManager.getString('resources', 'userDetail.unlockButton.text')}"
			_unlockButton.styleName="userSettingsButton logoutButton contentFontSize";
			sGroup.addElement(_unlockButton);
			
			skinnableWrapper.addElement(scroller);
			
			addElement(skinnableWrapper);
		}
		
		override protected function createToolbar():TopToolbarAIR {
			return new TopToolbarUserDetails();
		}
		
		public function setViewModel(vm:UserDetailsVM):void {
			_viewModel = vm;
		}
		
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
				} else {
					promoteButton.includeInLayout = false;
					promoteButton.visible = false;
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
			}
		}
	}
}