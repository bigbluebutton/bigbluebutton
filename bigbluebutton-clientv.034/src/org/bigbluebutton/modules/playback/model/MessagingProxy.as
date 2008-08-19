package org.bigbluebutton.modules.playback.model
{
	import org.bigbluebutton.common.InputPipe;
	import org.bigbluebutton.common.OutputPipe;
	import org.bigbluebutton.common.Router;
	import org.bigbluebutton.modules.playback.PlaybackModuleConstants;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeMessage;
	import org.puremvc.as3.multicore.utilities.pipes.messages.Message;
	import org.puremvc.as3.multicore.utilities.pipes.plumbing.PipeListener;
	
	/**
	 * This class sends out parsed XML events to modules using the piping utility of
	 * the pureMVC framework 
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class MessagingProxy extends Proxy implements IProxy
	{
		public static const NAME:String = "MessagingProxy";
		
		private var outpipe : OutputPipe;
		private var inpipe : InputPipe;
		public var router : Router;
		private var inpipeListener : PipeListener;
		private var moduleName:String;
		
		public function MessagingProxy(list:XMLList, name:String)
		{
			super(NAME, list);
			this.moduleName = name;
			router = new Router();
			inpipe = new InputPipe(PlaybackModuleConstants.TO_PLAYBACK_MODULE);
			outpipe = new OutputPipe(PlaybackModuleConstants.FROM_PLAYBACK_MODULE);
			inpipeListener = new PipeListener(this, messageReceiver);
			inpipe.connect(inpipeListener);
			router.registerOutputPipe(outpipe.name, outpipe);
			router.registerInputPipe(inpipe.name, inpipe);
		}
		
		private function messageReceiver(message:IPipeMessage):void{
			var msg:String = message.getHeader().MSG as String;
			
			switch(msg){
				
			}
		} 
		
		private function sendMessage(message:String, receiverModule:String):void{
			var msg:IPipeMessage = new Message(Message.NORMAL);
			msg.setHeader({MSG: PlaybackModuleConstants.PLAYBACK_MESSAGE, SRC: PlaybackModuleConstants.FROM_PLAYBACK_MODULE,
								TO: receiveModule});
			msg.setPriority(Message.PRIORITY_HIGH);
			
			msg.setBody(message);
			outpipe.write(msg);
		}

	}
}