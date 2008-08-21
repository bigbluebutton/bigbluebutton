package org.bigbluebutton.modules.whiteboard
{
	import org.bigbluebutton.common.InputPipe;
	import org.bigbluebutton.common.OutputPipe;
	import org.bigbluebutton.common.Router;
	import org.bigbluebutton.main.MainApplicationConstants;
	import org.bigbluebutton.modules.whiteboard.view.Board;
	import org.bigbluebutton.modules.whiteboard.view.BoardMediator;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeMessage;
	import org.puremvc.as3.multicore.utilities.pipes.messages.Message;
	import org.puremvc.as3.multicore.utilities.pipes.plumbing.PipeListener;
	
	public class WhiteboardModuleMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "WhiteboardModuleMediator";
		
		private var outpipe : OutputPipe;
		private var inpipe : InputPipe;
		private var router : Router;
		private var inpipeListener : PipeListener;
		
		private var board:Board;
		
		public function WhiteboardModuleMediator(module:WhiteboardModule)
		{
			super(NAME, module);
			router = module.router;
			inpipe = new InputPipe(BoardModuleConstants.TO_WHITEBOARD_MODULE);
			outpipe = new OutputPipe(BoardModuleConstants.FROM_WHITEBOARD_MODULE);
			inpipeListener = new PipeListener(this, messageReceiver);
			router.registerOutputPipe(outpipe.name, outpipe);
			router.registerInputPipe(inpipe.name, inpipe);
			addWindow();
		}
		
		private function get module():WhiteboardModule{
			return viewComponent as WhiteboardModule;
		}
		
		private function messageReceiver(message:IPipeMessage):void{
			var msg:String = message.getHeader().MSG;
		}
		
		private function addWindow():void{
			var msg:IPipeMessage = new Message(Message.NORMAL);
			msg.setHeader({MSG:MainApplicationConstants.ADD_WINDOW_MSG, SRC: BoardModuleConstants.FROM_WHITEBOARD_MODULE,
   						TO: MainApplicationConstants.TO_MAIN });
   			msg.setPriority(Message.PRIORITY_HIGH);
   			
   			board = new Board();
   			module.activeWindow = board;
   			msg.setBody(viewComponent as WhiteboardModule);
   			outpipe.write(msg);
		}
		
		/**
		 * Register this mediator with the voice facade 
		 * @param key
		 * 
		 */		
		override public function initializeNotifier(key:String):void{
			super.initializeNotifier(key);
			facade.registerMediator(new BoardMediator(board));
		}

	}
}