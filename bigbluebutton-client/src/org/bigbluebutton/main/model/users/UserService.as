package org.bigbluebutton.main.model.users
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.net.NetConnection;
	
	import mx.controls.Alert;
	
	import org.bigbluebutton.main.events.LoadModulesCommand;
	import org.bigbluebutton.main.events.UserServicesEvent;
	import org.bigbluebutton.main.model.ConferenceParameters;
	import org.bigbluebutton.main.model.users.events.ConferenceCreatedEvent;
	import org.bigbluebutton.main.model.users.events.UsersConnectionEvent;

	public class UserService
	{
		private var joinService:JoinService;
		private var _participants:Conference;
		private var _userSOService:UsersSOService;
		private var _conferenceParameters:ConferenceParameters;
		
		private var applicationURI:String;
		private var hostURI:String;
		
		private var connection:NetConnection;
		private var userId:Number;
		
		private var dispatcher:Dispatcher;
		
		public function UserService()
		{
			dispatcher = new Dispatcher();
		}
		
		public function startService(e:UserServicesEvent):void{
			applicationURI = e.applicationURI;
			hostURI = e.hostURI;
			
			joinService = new JoinService();
			joinService.addJoinResultListener(joinListener);
			joinService.load(e.hostURI);
		}
		
		private function joinListener(success:Boolean, result:Object):void{
			if (success) {
				_participants = new Conference();
				_participants.me.name = result.username;
				_participants.me.role = result.role;
				_participants.me.room = result.room;
				_participants.me.authToken = result.authToken;
				
				_conferenceParameters = new ConferenceParameters();
				_conferenceParameters.conference = result.conference;
				_conferenceParameters.username = _participants.me.name;
				_conferenceParameters.role = _participants.me.role;
				_conferenceParameters.room = _participants.me.room;
				_conferenceParameters.authToken = _participants.me.authToken;
				_conferenceParameters.mode = result.mode;
				_conferenceParameters.webvoiceconf = result.webvoiceconf;
				_conferenceParameters.voicebridge = result.voicebridge;
				_conferenceParameters.conferenceName = result.conferenceName;
				_conferenceParameters.welcome = result.welcome;
				_conferenceParameters.meetingID = result.meetingID;
				_conferenceParameters.externUserID = result.externUserID;
				
				var e:ConferenceCreatedEvent = new ConferenceCreatedEvent(ConferenceCreatedEvent.CONFERENCE_CREATED_EVENT);
				e.conference = _participants;
				dispatcher.dispatchEvent(e);
				
				connect();
			}
		}
		
		private function connect():void{
			_userSOService = new UsersSOService(applicationURI, _participants);
			_userSOService.connect(_conferenceParameters);	
		}
		
		public function userLoggedIn(e:UsersConnectionEvent):void{
			_participants.me.userid = e.userid;
			_conferenceParameters.connection = e.connection;
			
			var loadCommand:LoadModulesCommand = new LoadModulesCommand(LoadModulesCommand.LOAD_MODULES);
			loadCommand.conferenceParameters = _conferenceParameters;
			dispatcher.dispatchEvent(loadCommand);
		}
	}
}