package org.bigbluebutton.modules.presentation.view.playback
{
	import flash.events.Event;
	
	import mx.controls.Alert;
	
	import org.bigbluebutton.modules.presentation.model.business.PresentationPlaybackProxy;
	import org.bigbluebutton.modules.presentation.view.PresentationWindow;
	import org.bigbluebutton.modules.presentation.view.PresentationWindowMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	
	public class PresentationPlaybackMediator extends PresentationWindowMediator
	{
		public function PresentationPlaybackMediator(view:PresentationWindow)
		{
			super(view);
		}
		
		override protected function openFileUploadWindow(e:Event):void{}
		
		override public function listNotificationInterests():Array{
			return [
					PresentationPlaybackProxy.PRESENTER
					];
		}
		
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()){
				case PresentationPlaybackProxy.PRESENTER:
					//Alert.show(notification.getBody() as String);
					presentationWindow.presenterName.label = notification.getBody() as String;
					break;
			}	
		}

	}
}