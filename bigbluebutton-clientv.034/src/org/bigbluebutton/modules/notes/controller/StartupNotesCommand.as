package org.bigbluebutton.modules.notes.controller
{
	import org.bigbluebutton.modules.notes.NotesModule;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;
	
	public class StartupNotesCommand extends SimpleCommand
	{
		override public function execute(notification:INotification):void{
			var app:NotesModule = notification.getBody() as NotesModule;
		}

	}
}