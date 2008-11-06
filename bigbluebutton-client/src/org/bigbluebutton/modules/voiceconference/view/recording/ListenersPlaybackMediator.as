package org.bigbluebutton.modules.voiceconference.view.recording
{
	import org.bigbluebutton.modules.voiceconference.VoiceFacade;
	import org.bigbluebutton.modules.voiceconference.model.VoiceConferenceRoom;
	import org.bigbluebutton.modules.voiceconference.model.vo.User;
	import org.bigbluebutton.modules.voiceconference.view.ListenersWindow;
	import org.bigbluebutton.modules.voiceconference.view.ListenersWindowMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	
	public class ListenersPlaybackMediator extends ListenersWindowMediator
	{
		public static const PLAYBACK_ROOM:String = "Playback Room";
		
		public static const JOIN:String = "join";
		public static const TALK:String = "talk";
		public static const LEFT:String = "left";
		
		public function ListenersPlaybackMediator(view:ListenersWindow)
		{
			super(view);
		}
		
		override public function initializeNotifier(key:String):void{
			super.initializeNotifier(key);
			(facade as VoiceFacade).meetMeRoom = new VoiceConferenceRoom(PLAYBACK_ROOM);
		}
		
		override public function listNotificationInterests():Array{
			return [
					JOIN,
					LEFT,
					TALK
					];
		}
		
		override public function handleNotification(notification:INotification):void{
			var message:XML = notification.getBody() as XML;
			switch(notification.getName()){
				case JOIN:
					listenersWindow.meetMeRoom.dpParticipants.addItem(new User())
					break;
				case LEFT:
					break;
				case TALK:
					break;
			}
		}

	}
}