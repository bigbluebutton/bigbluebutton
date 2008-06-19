package org.bigbluebutton.modules.voiceconference
{
	import org.bigbluebutton.modules.voiceconference.model.business.VoiceConfConnectResponder;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	public class MockNotificationListener extends Mediator implements IMediator
	{
		public static const NAME:String = "MockNotificationListener";
		
		public var closeReceived:Boolean = false;
		public var resultReceived:Boolean = false;
		public var faultReceived:Boolean = false;
		public var muteAllReceived:Boolean = false;
		public var ejectReceived:Boolean = false;
		public var muteUnmuteReceived:Boolean = false;
		public var userJoin:Boolean = false;
		public var muteReceived:Boolean = false;
		
		public function MockNotificationListener()
		{
			super(NAME);
		}
		
		override public function listNotificationInterests():Array{
			return [
					VoiceConfConnectResponder.CLOSE,
					VoiceConfConnectResponder.RESULT,
					VoiceConfConnectResponder.FAULT,
					VoiceConferenceFacade.MUTE_ALL_USERS_COMMAND,
					VoiceConferenceFacade.EJECT_USER_COMMAND,
					VoiceConferenceFacade.MUTE_UNMUTE_USER_COMMAND,
					VoiceConferenceFacade.USER_JOIN_EVENT,
					VoiceConferenceFacade.MUTE_EVENT
					];
		}
		
		override public function handleNotification(notification:INotification):void{
			  switch(notification.getName()){
			  	case VoiceConfConnectResponder.CLOSE:
			  		this.closeReceived = true;
			  		break;
			  	case VoiceConfConnectResponder.RESULT:
			  		this.resultReceived = true;
			  		break;
			  	case VoiceConfConnectResponder.FAULT:
			  		this.faultReceived = true;
			  		break;
			  	case VoiceConferenceFacade.MUTE_ALL_USERS_COMMAND:
			  		this.muteAllReceived = true;
			  		break;
			  	case VoiceConferenceFacade.EJECT_USER_COMMAND:
			  		this.ejectReceived = true;
			  		break;
			  	case VoiceConferenceFacade.MUTE_UNMUTE_USER_COMMAND:
			  		this.muteUnmuteReceived = true;
			  		break;
			  	case VoiceConferenceFacade.USER_JOIN_EVENT:
			  		this.userJoin = true;
			  		break;
			  	case VoiceConferenceFacade.MUTE_EVENT:
			  		this.muteReceived = true;
			  		break;
			  }
		}
		
		public function sendCustomNote(note:String):void{
			sendNotification(note);
		}

	}
}