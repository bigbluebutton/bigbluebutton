package org.bigbluebutton.common.messaging
{
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeMessage;
	import org.puremvc.as3.multicore.utilities.pipes.messages.Message;
	import org.puremvc.as3.multicore.utilities.pipes.plumbing.PipeListener;

	public class Endpoint
	{
		private var _router:Router;
		private var _fromAddress:String;
		private var _toAddress:String;
		private var _outpipe : OutputPipe;
		private var _inpipe : InputPipe;
		private var _inpipeListener : PipeListener;
				
		public function Endpoint(router:Router, fromAddress:String, toAddress:String, messageReceiver:Function)
		{
			_router = router;
			_fromAddress = fromAddress;
			_toAddress = toAddress;
			
			_inpipe = new InputPipe(_toAddress);
			_outpipe = new OutputPipe(_fromAddress);
			_inpipeListener = new PipeListener(this, messageReceiver);
			_inpipe.connect(_inpipeListener);
			_router.registerOutputPipe(_outpipe.name, _outpipe);
			_router.registerInputPipe(_inpipe.name, _inpipe)			
		}

		public function sendMessage(message:String, dest:String, body:Object):void {
			var msg:IPipeMessage = new Message(Message.NORMAL);
			msg.setHeader({MSG:message, SRC: _fromAddress,
   						TO: dest });
   			msg.setPriority(Message.PRIORITY_HIGH);
   			msg.setBody(body);
   			_outpipe.write(msg);
		}
	}
}