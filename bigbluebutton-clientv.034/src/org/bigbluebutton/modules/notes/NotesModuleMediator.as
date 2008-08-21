package org.bigbluebutton.modules.notes
{
	import org.bigbluebutton.common.InputPipe;
	import org.bigbluebutton.common.OutputPipe;
	import org.bigbluebutton.common.Router;
	import org.bigbluebutton.modules.notes.view.NotesWindow;
	import org.bigbluebutton.modules.notes.view.NotesWindowMediator;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	import org.puremvc.as3.multicore.utilities.pipes.plumbing.PipeListener;
	
	public class NotesModuleMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "NotesModuleMediator";
		
		private var outpipe : OutputPipe;
		private var inpipe : InputPipe;
		private var router : Router;
		private var inpipeListener : PipeListener;
		
		private var notesWindow:NotesWindow;
		
		public function NotesModuleMediator(module:NotesModule)
		{
			super(NAME, module);
			inpipe = new InputPipe(NotesConstants.TO_NOTES_MODULE);
			outpipe = new OutputPipe(NotesConstants.FROM_NOTES_MODULE);
			inpipeListener = new PipeListener(this, messageReceiver);
			router.registerOutputPipe(outpipe.name, outpipe);
			router.registerInputPipe(inpipe.name, inpipe);
			addWindow();
		}
		
		private function messageReceiver(message:IPipeMessage):void{
			var msg:String = message.getHeader().MSG;
		}
		
		private function get module():NotesModule{
			return viewComponent as NotesModule;
		}
		
		private function addWindow():void{
			var msg:IPipeMessage = new Message(Message.NORMAL);
			msg.setHeader({MSG:MainApplicationConstants.ADD_WINDOW_MSG, SRC: NotesConstants.FROM_NOTES_MODULE,
   						TO: MainApplicationConstants.TO_MAIN });
   			msg.setPriority(Message.PRIORITY_HIGH);
   			
   			notesWindow = new NotesWindow();
   			module.activeWindow = notesWindow;
   			msg.setBody(module);
   			outpipe.write(msg);
		}
		
		override public function listNotificationInterests():Array{
			return [];
		}
		
		override public function handleNotification(notification:INotification):void{
			
		}
		
		override protected function initializeNotifier(key:String):void{
			super.initializeNotifier();
			facade.registerMediator(new NotesWindowMediator(notesWindow));
		}

	}
}