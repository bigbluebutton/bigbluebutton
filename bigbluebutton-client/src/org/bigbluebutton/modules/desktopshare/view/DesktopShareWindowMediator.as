package org.bigbluebutton.modules.desktopshare.view
{
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	import org.bigbluebutton.modules.desktopshare.view.components.DesktopShareWindow;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.bigbluebutton.modules.desktopshare.model.business.DesktopShareProxy;
	import org.bigbluebutton.modules.desktopshare.DesktopShareFacade;
	import flash.events.Event;
	import org.bigbluebutton.modules.desktopshare.model.vo.ImageVO;

	public class DesktopShareWindowMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "DesktopShareMediator";
		public static const NEW_IMAGE:String = "newImage";
		
		
		public function DesktopShareWindowMediator(viewComponent:DesktopShareWindow)
		{
			super(NAME, viewComponent);
			viewComponent.addEventListener(DesktopShareWindowMediator.NEW_IMAGE, sendNewImage);
		}
		
		public function get desktopShareWindow():DesktopShareWindow
		{
			return viewComponent as DesktopShareWindow;
		}
		
		public function sendNewImage(e:Event):void
		{
			proxy.sendImageToSharedObject(desktopShareWindow.im);
		}
		override public function listNotificationInterests():Array
		{
			return [
					DesktopShareFacade.NEW_IMAGE
				   ];
		}
		override public function handleNotification(notification:INotification):void
		{
			switch(notification.getName())
			{
				case DesktopShareFacade.NEW_IMAGE:
					this.desktopShareWindow.showNewImage(notification.getBody() as ImageVO);
					break;	
			}
		}
		public function get proxy():DesktopShareProxy
		{
			return facade.retrieveProxy(DesktopShareProxy.NAME) as DesktopShareProxy;
		} 
		
	}
}