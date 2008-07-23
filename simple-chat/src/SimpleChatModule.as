package
{
	import flexlib.mdi.containers.MDIWindow;
	
	import org.bigbluebutton.common.BigBlueButtonModule;
	import org.bigbluebutton.common.IRouterAware;
	import org.bigbluebutton.common.InputPipe;
	import org.bigbluebutton.common.OutputPipe;
	import org.bigbluebutton.common.Router;
	import org.bigbluebutton.main.MainApplicationConstants;
	import org.bigbluebutton.main.view.components.MainApplicationShell;
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeMessage;
	import org.puremvc.as3.multicore.utilities.pipes.messages.Message;
	import org.puremvc.as3.multicore.utilities.pipes.plumbing.PipeListener;
	
	public class SimpleChatModule extends BigBlueButtonModule implements IRouterAware
	{
		public static const NAME:String = "SimpleChatModule";
		
		public static const TO_SIMPLE_CHAT:String = "To Simple Chat";
		public static const FROM_SIMPLE_CHAT:String = "From Simple Chat";
		
		public var activeWindow:MDIWindow;
		
		private var outpipe : OutputPipe;
		private var inpipe : InputPipe;
		private var inpipeListener : PipeListener;
		
		private var delegate:Red5Delegate;
		private var url:String = "rtmp://134.117.58.92/test";
		
		public function SimpleChatModule()
		{
			super(NAME);
			this.preferedX = 200;
			this.preferedY = 200;
			this.startTime = BigBlueButtonModule.START_ON_LOGIN;
		}
		
		override public function getMDIComponent():MDIWindow{
			return this.activeWindow;
		}
		
		override public function acceptRouter(router:Router, shell:MainApplicationShell):void{
			super.acceptRouter(router, shell);
			inpipe = new InputPipe(TO_SIMPLE_CHAT);
			outpipe = new OutputPipe(FROM_SIMPLE_CHAT);
			inpipeListener = new PipeListener(this, messageReceiver);
			router.registerOutputPipe(outpipe.name, outpipe);
			router.registerInputPipe(inpipe.name, inpipe);
			addWindow();
		}
		
		private function addWindow():void{
			var msg:IPipeMessage = new Message(Message.NORMAL);
			msg.setHeader({MSG:MainApplicationConstants.ADD_WINDOW_MSG, SRC: SimpleChatModule.FROM_SIMPLE_CHAT,
   						TO: MainApplicationConstants.TO_MAIN });
   			
   			activeWindow = new simple_chat();
   			delegate = new Red5Delegate(activeWindow as simple_chat, this.url);
   			msg.setBody(this);
   			outpipe.write(msg);
		}
		
		override public function logout():void{
			activeWindow.close();
		}
		
		private function messageReceiver(message:IPipeMessage):void{
			
		}

	}
}