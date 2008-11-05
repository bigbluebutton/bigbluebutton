package org.bigbluebutton.modules.whiteboard
{
	import flash.system.Capabilities;
	
	import flexlib.mdi.containers.MDIWindow;
	
	import org.bigbluebutton.common.BigBlueButtonModule;
	import org.bigbluebutton.common.messaging.IRouterAware;
	import org.bigbluebutton.common.messaging.Router;
	import org.bigbluebutton.main.view.components.MainApplicationShell;
	
	public class WhiteboardModule extends BigBlueButtonModule implements IRouterAware
	{
		public static const NAME:String = "Whiteboard Module";
		
		private var facade:BoardFacade;
		public var activeWindow:MDIWindow;
		
		public function WhiteboardModule()
		{
			super(NAME);
			facade = BoardFacade.getInstance();
			this.preferedX = Capabilities.screenResolutionX - 400;
			this.preferedY = 400;
			this.startTime = BigBlueButtonModule.START_ON_LOGIN;
		}
		
		override public function acceptRouter(router:Router, shell:MainApplicationShell):void{
			super.acceptRouter(router,shell);
			facade.startup(this);
		}
		
		override public function getMDIComponent():MDIWindow{
			return activeWindow;
		}
		
		override public function logout():void{
			facade.removeCore(BoardFacade.NAME);
		}

	}
}