package org.bigbluebutton.lib.settings.views {
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.utils.UserUtils;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class SettingsViewMediatorBase extends Mediator {
		
		[Inject]
		public var view:SettingsViewBase;
		
		[Inject]
		public var userSession:IUserSession;
		
		override public function initialize():void {
			view.participantIcon.displayInitials = UserUtils.getInitials(userSession.userList.me.name);
			view.participantLabel.text = userSession.userList.me.name;
		}
	}
}
