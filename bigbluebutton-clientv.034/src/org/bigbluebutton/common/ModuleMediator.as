package org.bigbluebutton.common
{
	import flexlib.mdi.containers.MDIWindow;
	
	import org.bigbluebutton.main.MainApplicationConstants;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeMessage;
	import org.puremvc.as3.multicore.utilities.pipes.messages.Message;
	import org.puremvc.as3.multicore.utilities.pipes.plumbing.PipeListener;
	
	/**
	 * This is a convinience class you can extend when creating a module. It abstracts away many annoying parts concerning
	 * communication with the BigBlueButton core. 
	 * @author Denis
	 * 
	 */	
	public class ModuleMediator extends Mediator implements IMediator
	{
		private var outpipe : OutputPipe;
		private var inpipe : InputPipe;
		private var router : Router;
		private var inpipeListener : PipeListener;
		private var displayComponent:MDIWindow;
		private var name:String;
		private var toString:String;
		private var fromString:String;
		
		/**
		 * The Constructor. 
		 * @param viewComponent - Your BigBlueButtonModule class
		 * @param toString - A constant String that the Core program will use to communicate to your module
		 * @param fromString - A constant String that your program will use to communicate to the Core program
		 * 
		 */		
		public function ModuleMediator(viewComponent:BigBlueButtonModule, toString:String, fromString:String)
		{
			super(name, viewComponent);
			router = viewComponent.router;
			this.toString = toString;
			this.fromString = fromString;
			inpipe = new InputPipe(toString);
			outpipe = new OutputPipe(fromString);
			inpipeListener = new PipeListener(this, messageReceiver);
			inpipe.connect(inpipeListener);
			router.registerOutputPipe(outpipe.name, outpipe);
			router.registerInputPipe(inpipe.name, inpipe);
			displayComponent = viewComponent.getMDIComponent();
			addWindow();
		}
		
		override public function initializeNotifier(key:String):void{
			super.initializeNotifier(key);
		}
		
		private function addWindow():void{
			var msg:IPipeMessage = new Message(Message.NORMAL);
   			msg.setHeader( {MSG:MainApplicationConstants.ADD_WINDOW_MSG, SRC: fromString,
   						TO: MainApplicationConstants.TO_MAIN });
   			msg.setPriority(Message.PRIORITY_HIGH );
   			
   			msg.setBody(this.viewComponent as BigBlueButtonModule);
   			outpipe.write(msg);
		}
		
		/**
		 * Messages sent to your module will be received here. Override this function if you wish to receive them 
		 * @param message
		 * 
		 */		
		protected function messageReceiver(message:IPipeMessage):void{
			
		}

	}
}