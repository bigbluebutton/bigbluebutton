package org.bigbluebutton.modules.sip
{
	import org.bigbluebutton.common.InputPipe;
	import org.bigbluebutton.common.OutputPipe;
	import org.bigbluebutton.common.Router;
	import org.bigbluebutton.main.MainApplicationConstants;
	import org.bigbluebutton.modules.sip.view.SipWindow;
	import org.bigbluebutton.modules.sip.view.mediators.SipWindowMediator;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeMessage;
	import org.puremvc.as3.multicore.utilities.pipes.messages.Message;
	import org.puremvc.as3.multicore.utilities.pipes.plumbing.PipeListener;
	
	public class SipModuleMediator extends Mediator implements IMediator
	{  
		public static const NAME:String = "SipModuleMediator";
		
		private var outpipe : OutputPipe;
		private var inpipe : InputPipe;
		private var router : Router;
		private var inpipeListener : PipeListener;
		
		private var sipWindow:SipWindow;
		
		public function SipModuleMediator(module:SipModule)
		{
			super(NAME, module);
			router = module.router;
			inpipe = new InputPipe(SipModuleConstants.TO_SIP_MODULE);
			outpipe = new OutputPipe(SipModuleConstants.FROM_SIP_MODULE);
			inpipeListener = new PipeListener(this, messageReceiver);
			router.registerOutputPipe(outpipe.name, outpipe);
			router.registerInputPipe(inpipe.name, inpipe);
			addWindow();
		}
		
		private function messageReceiver(message:IPipeMessage):void{
			var msg:String = message.getHeader().MSG;
		}
		
		private function get module():SipModule{
			return viewComponent as SipModule;
		}
		
		private function addWindow():void{
			var msg:IPipeMessage = new Message(Message.NORMAL);
			msg.setHeader({MSG:MainApplicationConstants.ADD_WINDOW_MSG, SRC: SipModuleConstants.FROM_SIP_MODULE,
   						TO: MainApplicationConstants.TO_MAIN });
   			msg.setPriority(Message.PRIORITY_HIGH);
   			
   			sipWindow = new SipWindow();
   			module.activeWindow = sipWindow;
   			msg.setBody(module);
   			outpipe.write(msg);
		}
		
		override public function initializeNotifier(key:String):void{
			super.initializeNotifier(key);
			facade.registerMediator(new SipWindowMediator(sipWindow));
		}

	}
}