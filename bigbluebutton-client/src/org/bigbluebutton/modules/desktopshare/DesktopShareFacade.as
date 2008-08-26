package org.bigbluebutton.modules.desktopshare
{
	import org.puremvc.as3.multicore.interfaces.IFacade;
	import org.puremvc.as3.multicore.patterns.facade.Facade;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.bigbluebutton.modules.desktopshare.controller.StartupCommand;

	public class DesktopShareFacade extends Facade implements IFacade
	{
		public static const NAME:String = "DesktopShareFacade";
		public static const STARTUP:String          = "startup";
		public static const NEW_IMAGE:String      = "newImage";
		public static const IS_SHARING:String      = "isSharing";
		
		public function DesktopShareFacade()
		{
			super(NAME);
		}
		
		public static function getInstance():DesktopShareFacade{
			if (instanceMap[NAME] == null) instanceMap[NAME] = new DesktopShareFacade();
			return instanceMap[NAME] as DesktopShareFacade;
		
		}
		
		override protected function initializeController():void{
			super.initializeController();
			registerCommand(STARTUP, StartupCommand);
			
		}
		
		public function startup(app:DesktopShareModule):void {
			sendNotification(DesktopShareFacade.STARTUP, app);
		}
		
	}
}