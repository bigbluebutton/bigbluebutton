package org.bigbluebutton.modules.playback.controller
{
	import org.bigbluebutton.modules.playback.controller.notifiers.ParseNotifier;
	import org.bigbluebutton.modules.playback.model.MessagingMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;
	
	public class ParseCompleteCommand extends SimpleCommand
	{
		override public function execute(notification:INotification):void{
			var note:ParseNotifier = notification.getBody() as ParseNotifier;
			var moduleName:String = note.moduleName;
			var list:XMLList = note.list;
			var startTime:Number = note.startTime;
			
			facade.registerMediator(new MessagingMediator(list, moduleName, startTime));
		}

	}
}