package org.bigbluebutton.modules.video.view.mediators
{
	import flash.events.Event;
	
	import org.bigbluebutton.modules.video.VideoFacade;
	import org.bigbluebutton.modules.video.model.business.PublisherModel;
	import org.bigbluebutton.modules.video.view.SettingsWindow;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	public class SettingsWindowMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "SettingsWindowMediator";
		public static const SETUP:String = "Setup Devices";
		
		public function SettingsWindowMediator(view:SettingsWindow)
		{
			super(NAME, view);
			view.addEventListener(SETUP, setupDevices);
		}
		
		public function get window():SettingsWindow{
			return viewComponent as SettingsWindow;
		}
		
		override public function listNotificationInterests():Array{
			return [];
		}
		
		override public function handleNotification(notification:INotification):void{
			
		}
		
		private function setupDevices(e:Event):void{
			sendNotification(VideoFacade.SETUP_DEVICES_COMMAND);
			var model:PublisherModel = facade.retrieveProxy(PublisherModel.NAME) as PublisherModel;
			window.camera_cb.dataProvider = model.cameraNames;
		}

	}
}