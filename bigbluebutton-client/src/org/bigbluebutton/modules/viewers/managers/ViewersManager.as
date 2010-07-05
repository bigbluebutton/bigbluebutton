package org.bigbluebutton.modules.viewers.managers
{
	import com.asfusion.mate.events.Dispatcher;
	
	import org.bigbluebutton.main.events.OpenWindowEvent;
	import org.bigbluebutton.modules.viewers.events.LoginSuccessEvent;
	import org.bigbluebutton.modules.viewers.events.ViewersConnectionEvent;
	import org.bigbluebutton.modules.viewers.events.ViewersModuleEndEvent;
	import org.bigbluebutton.modules.viewers.events.ViewersModuleStartedEvent;
	import org.bigbluebutton.modules.viewers.views.ViewersWindow;

	public class ViewersManager
	{
		private var viewersWindow:ViewersWindow;
		private var dispatcher:Dispatcher;
		
		private var _module:ViewersModule;
		
		public function ViewersManager(){
			dispatcher = new Dispatcher();
		}
		
		public function moduleStarted(e:ViewersModuleStartedEvent):void{
			_module = e.module;
			
			if (viewersWindow == null){
				viewersWindow = new ViewersWindow();
				var windowEvent:OpenWindowEvent = new OpenWindowEvent(OpenWindowEvent.OPEN_WINDOW_EVENT);
				windowEvent.window = viewersWindow;
				dispatcher.dispatchEvent(windowEvent);
			}
		}
		
		public function moduleEnded(e:ViewersModuleEndEvent):void{
			
		}
		
		public function loginSuccess(e:ViewersConnectionEvent):void{
			var user:Object = {username:_module.username, conference:_module.conference, 
				conferenceName:_module.conferenceName,
				userrole:_module.role, room:_module.room, authToken:_module.authToken,
				userid:_module.userid, connection:e.connection,
				mode:_module.mode, voicebridge:_module.voicebridge,
				webvoiceconf:_module.webvoiceconf,
				record:_module.record, welcome:_module.welcome,
				meetingID:_module.meetingID, externUserID:_module.externUserID,
				playbackRoom:_module.playbackRoom};
			
			var loginEvent:LoginSuccessEvent = new LoginSuccessEvent(LoginSuccessEvent.LOGIN_SUCCESS);
			loginEvent.user = user;
			dispatcher.dispatchEvent(loginEvent);
		}
	}
}