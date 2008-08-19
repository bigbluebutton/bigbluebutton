package org.bigbluebutton.modules.desktopshare
{
	import org.bigbluebutton.common.Router;
	import flexlib.mdi.containers.MDIWindow;
	import org.bigbluebutton.common.IRouterAware;
	import org.bigbluebutton.common.BigBlueButtonModule;
	import org.bigbluebutton.main.view.components.MainApplicationShell;
	import org.bigbluebutton.modules.desktopshare.model.business.DesktopShareProxy;
	import org.bigbluebutton.modules.desktopshare.view.components.DesktopShareWindow;
	import org.bigbluebutton.modules.log.LogModuleFacade;
	import org.bigbluebutton.modules.viewers.ViewersFacade;
	import org.bigbluebutton.modules.desktopshare.DesktopShareFacade;
	import org.bigbluebutton.modules.viewers.model.business.Conference;
	import org.bigbluebutton.common.Constants;
	import flash.system.Capabilities;

	public class DesktopShareModule extends BigBlueButtonModule implements IRouterAware
	{
		public static const NAME:String = 'DesktopShareModule';
		public var desktopShareWindow : DesktopShareWindow;
		private var facade : DesktopShareFacade;		
		private var log : LogModuleFacade = LogModuleFacade.getInstance("LogModule");
		
		public var activeWindow:MDIWindow;
		
		public function DesktopShareModule()
		{
			super(NAME);
			//log.debug("Creating new Window...");
			desktopShareWindow = new DesktopShareWindow;
			//log.debug("Getting an instance of Facade...");
			facade = DesktopShareFacade.getInstance();			
			this.preferedX = Capabilities.screenResolutionX - 410;
			this.preferedY = 20;
		}
		
		override public function acceptRouter(router : Router, shell : MainApplicationShell):void
		{
			super.acceptRouter(router, shell);
			//log.debug("Setting Router for Module...");
			DesktopShareFacade(facade).startup(this);
			var conf:Conference = ViewersFacade.getInstance().retrieveMediator(Conference.NAME) as Conference;
			var proxy:DesktopShareProxy = facade.retrieveProxy(DesktopShareProxy.NAME) as DesktopShareProxy;
			proxy.join((conf.me.userid) as String,Constants.red5Host, conf.room);
		}
		
		override public function getMDIComponent():MDIWindow{
			return activeWindow;
		}
		
		override public function logout():void
		{
		    facade.removeCore(DesktopShareFacade.NAME);
		}
		
	}
}