package org.bigbluebutton.modules.sample_module
{
	import flexlib.mdi.containers.MDIWindow;
	
	import org.bigbluebutton.common.BigBlueButtonModule;
	import org.bigbluebutton.common.IRouterAware;
	import org.bigbluebutton.common.Router;
	import org.bigbluebutton.main.view.components.MainApplicationShell;
	import org.bigbluebutton.modules.sample_module.view.SampleWindow;
	
	/**
	 * This is a Sample Module. It is very minimalistic. You can copy it and use it as a start point for your own BBB module 
	 * @author Denis
	 * 
	 */	
	public class SampleModule extends BigBlueButtonModule implements IRouterAware
	{
		public static const NAME:String = "SampleModule";
		private var window:SampleWindow;
		private var facade:SampleFacade;
		
		public function SampleModule()
		{
			super(NAME);
			this.window = new SampleWindow();
			this.facade = SampleFacade.getInstance();
			this.preferedX = 400;
			this.preferedY = 200;
			this.startTime = BigBlueButtonModule.START_ON_LOGIN;
		}
		
		override public function acceptRouter(router:Router, shell:MainApplicationShell):void{
			super.acceptRouter(router, shell);
			facade.startup(this);
		}
		
		override public function getMDIComponent():MDIWindow{
			return this.window;
		}
		
		override public function logout():void{
			facade.removeCore(SampleFacade.NAME);
		}

	}
}