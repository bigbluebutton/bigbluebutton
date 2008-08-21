package org.bigbluebutton.modules.notes
{
	import org.puremvc.as3.multicore.interfaces.IFacade;
	import org.puremvc.as3.multicore.patterns.facade.Facade;
	
	public class NotesFacade extends Facade implements IFacade
	{
		public static const NAME:String = "NotesFacade";
		
		//Notification constants for the Notes Module
		public static const STARTUP = "StartNotesModule"
		
		public function NotesFacade(key:String)
		{
			super(key);
		}
		
		public static function getInstance():NotesFacade{
			if (instanceMap[NAME] == null) instanceMap[NAME] = new NotesFacade(NAME);
			return instanceMap[NAME] as NotesFacade;
		}
		
		override protected function initializeController():void{
			super.initializeController();
			registerCommand(STARTUP, StartupNotesCommand);
		}
		
		public function startup(app:NotesModule):void{
			sendNotification(STARTUP, app);
		}

	}
}