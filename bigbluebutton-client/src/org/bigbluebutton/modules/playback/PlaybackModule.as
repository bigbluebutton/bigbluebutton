package org.bigbluebutton.modules.playback
{
	import flash.system.Capabilities;
	
	import flexlib.mdi.containers.MDIWindow;
	
	import org.bigbluebutton.common.BigBlueButtonModule;
	import org.bigbluebutton.common.messaging.Router;
	import org.bigbluebutton.main.view.components.MainApplicationShell;
	
	public class PlaybackModule extends BigBlueButtonModule
	{
		public static const NAME:String = "PlaybackModule";
		
		private var facade:PlaybackFacade;
		public var activeWindow:MDIWindow;
		
		public function PlaybackModule()
		{
			super(NAME); 
			facade = PlaybackFacade.getInstance();
			this.preferedX = Capabilities.screenResolutionX/2 - 350;
			this.preferedY = Capabilities.screenResolutionY - 600;
			this.startTime = BigBlueButtonModule.START_ON_LOGIN;
		}
		
		override public function acceptRouter(router:Router):void{
			super.acceptRouter(router);
			facade.startup(this);
		}
		
		override public function getMDIComponent():MDIWindow{
			return activeWindow;
		}
		
		override public function logout():void{
			facade.removeCore(PlaybackFacade.NAME);
		}

	}
}