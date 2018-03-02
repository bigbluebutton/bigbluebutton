package org.bigbluebutton.lib.settings.views {
	import mx.collections.ArrayCollection;
	
	import spark.events.IndexChangeEvent;
	
	import org.bigbluebutton.lib.main.models.IMeetingData;
	import org.bigbluebutton.lib.user.utils.UserUtils;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class SettingsViewMediatorBase extends Mediator {
		
		[Inject]
		public var view:SettingsViewBase;
		
		[Inject]
		public var meetingData:IMeetingData;
		
		protected var dataProvider:ArrayCollection;
		
		override public function initialize():void {
			view.participantIcon.setInitials(UserUtils.getInitials(meetingData.users.me.name));
			view.participantIcon.setRole(meetingData.users.me.role);
			view.participantLabel.text = meetingData.users.me.name;
			view.settingsList.dataProvider = dataProvider = new ArrayCollection([{label: "Audio", icon: "icon-unmute", page: "audio"}, {label: "Video", icon: "icon-video", page: "camera"}, {label: "Application", icon: "icon-application", page: "chat"}, {label: "Participants", icon: "icon-user", page: "lock"}, {label: "Leave Session", icon: "icon-logout", page: "exit"}]);
			
			view.settingsList.addEventListener(IndexChangeEvent.CHANGE, onListIndexChangeEvent);
		}
		
		protected function onListIndexChangeEvent(e:IndexChangeEvent):void {
			// leave the implementation to the specific client
		}
		
		override public function destroy():void {
			view.settingsList.removeEventListener(IndexChangeEvent.CHANGE, onListIndexChangeEvent);
			
			super.destroy();
			view = null;
		}
	}
}
