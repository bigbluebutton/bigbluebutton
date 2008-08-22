package org.bigbluebutton.modules.playback.view
{
	import flash.events.Event;
	
	import org.bigbluebutton.modules.playback.PlaybackFacade;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	public class PlaybackWindowMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "PlaybackWindowMediator";
		
		public function PlaybackWindowMediator(view:PlaybackWindow)
		{
			super(NAME, view);
			view.addEventListener(PlaybackWindow.LOAD_FROM_SERVER, loadFromServer);
			view.addEventListener(PlaybackWindow.LOAD_LOCAL, loadLocal);
			view.addEventListener(PlaybackFacade.PLAY, onPlay);
			view.addEventListener(PlaybackFacade.STOP, onStop);
			view.addEventListener(PlaybackWindow.START_RECORDING, startRecording);
			view.addEventListener(PlaybackWindow.STOP_RECORDING, stopRecording);
		}
		
		public function get window():PlaybackWindow{
			return viewComponent as PlaybackWindow;
		}
		
		override public function listNotificationInterests():Array{
			return [
					PlaybackFacade.TEST
					];
		}
		
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()){
				case PlaybackFacade.TEST:
					var element:XML = notification.getBody() as XML;
					window.txtOutput.text += "\n" + element.toXMLString();
					break;
			}
		}
		
		private function loadFromServer(e:Event):void{
			sendNotification(PlaybackFacade.LOAD_XML);
		}
		
		private function loadLocal(e:Event):void{
			
		}
		
		private function onPlay(e:Event):void{
			sendNotification(PlaybackFacade.PLAY);
		}
		
		private function onStop(e:Event):void{
			sendNotification(PlaybackFacade.STOP);
		}
		
		private function startRecording(e:Event):void{
			sendNotification(PlaybackWindow.START_RECORDING);
		}
		
		private function stopRecording(e:Event):void{
			sendNotification(PlaybackWindow.STOP_RECORDING);
		}

	}
}