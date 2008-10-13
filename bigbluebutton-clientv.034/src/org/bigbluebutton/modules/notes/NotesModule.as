package org.bigbluebutton.modules.notes
{
	import flexlib.mdi.containers.MDIWindow;
	
	import org.bigbluebutton.common.BigBlueButtonModule;
	import org.bigbluebutton.common.IRouterAware;
	import org.bigbluebutton.common.Router;
	import org.bigbluebutton.main.view.components.MainApplicationShell;
	
	public class NotesModule extends BigBlueButtonModule implements IRouterAware
	{
		public static const NAME:String = "NotesModule";
		
		private var facade:NotesFacade;
		public var activeWindow:MDIWindow;
		
		public function NotesModule()
		{  
			super(NAME);
			facade = NotesFacade.getInstance();
			this.preferedX = 400;
			this.preferedY = 400;
			this.startTime = BigBlueButtonModule.START_ON_LOGIN;
		}
		
		override public function acceptRouter(router:Router, shell:MainApplicationShell):void{
			super.acceptRouter(router, shell);
		}
		
		override public function getMDIComponent():MDIWindow{
			return this.activeWindow;
		}
		
		override public function logout():void{
			facade.removeCore(NotesFacade.NAME);
		}

	}
}