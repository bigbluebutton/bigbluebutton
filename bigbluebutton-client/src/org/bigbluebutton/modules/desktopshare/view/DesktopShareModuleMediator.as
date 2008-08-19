package org.bigbluebutton.modules.desktopshare.view
{
	
	import flash.events.Event;
	import flash.events.MouseEvent;
	
	import org.bigbluebutton.common.InputPipe;
	import org.bigbluebutton.common.OutputPipe;
	import org.bigbluebutton.common.Router;
	import org.bigbluebutton.main.MainApplicationConstants;
	import org.bigbluebutton.modules.desktopshare.DesktopShareModule;
	import org.bigbluebutton.modules.desktopshare.DesktopShareModuleConstants;
	import org.bigbluebutton.modules.desktopshare.model.business.DesktopShareProxy;
	import org.bigbluebutton.modules.desktopshare.view.components.DesktopShareWindow;
	import org.bigbluebutton.modules.log.LogModuleFacade;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeMessage;
	import org.puremvc.as3.multicore.utilities.pipes.messages.Message;
	import org.puremvc.as3.multicore.utilities.pipes.plumbing.PipeListener;
	import org.bigbluebutton.modules.desktopshare.DesktopShareModule;
	import org.bigbluebutton.modules.desktopshare.model.business.DesktopShareProxy;
	import org.bigbluebutton.modules.desktopshare.view.components.DesktopShareWindow;
	import org.bigbluebutton.modules.desktopshare.DesktopShareModuleConstants;

	public class DesktopShareModuleMediator extends Mediator implements IMediator
	{
		public static const NAME:String = 'ChatModuleMediator';
		private var outpipe : OutputPipe;
		private var inpipe : InputPipe;
		private var router : Router;
		private var inpipeListener : PipeListener;
		public var desktopShareWindow : DesktopShareWindow;
		private var log : LogModuleFacade = LogModuleFacade.getInstance("LogModule");
		private var module:DesktopShareModule;
		
		public function DesktopShareModuleMediator(viewComponent:DesktopShareModule)
		{
			super( NAME, viewComponent );	
			module = viewComponent;
			router = viewComponent.router;
			//log.debug("initializing input pipes for module...");
			inpipe = new InputPipe(DesktopShareModuleConstants.TO_DESKTOPSHARE_MODULE);
			//log.debug("initializing output pipes for module...");
			outpipe = new OutputPipe(DesktopShareModuleConstants.FROM_DESKTOPSHARE_MODULE);
			//log.debug("initializing pipe listener for module...");
			inpipeListener = new PipeListener(this, messageReceiver);
			router.registerOutputPipe(outpipe.name, outpipe);
			router.registerInputPipe(inpipe.name, inpipe);
			desktopShareWindow = viewComponent.desktopShareWindow;
			addWindow();
		}
		
		override public function initializeNotifier(key:String):void
		{
			super.initializeNotifier(key);
		}
		
		private function addWindow() : void
		{
			// create a message
   			var msg:IPipeMessage = new Message(Message.NORMAL);
   			msg.setHeader( {MSG:MainApplicationConstants.ADD_WINDOW_MSG, SRC: DesktopShareModuleConstants.FROM_DESKTOPSHARE_MODULE,
   						TO: MainApplicationConstants.TO_MAIN });
   			msg.setPriority(Message.PRIORITY_HIGH );
   			
			desktopShareWindow.width = 600;
			desktopShareWindow.height = 400;
			desktopShareWindow.title = DesktopShareWindow.TITLE;
			msg.setBody(viewComponent as DesktopShareModule);
			module.activeWindow = desktopShareWindow;
			outpipe.write(msg);
			desktopShareWindow.closeBtn.addEventListener(MouseEvent.CLICK, removeWindow);
			//log.debug("A message has been sent to show the window.");			
		}
		
		private function removeWindow(event:Event) : void
		{
			var msg:IPipeMessage = new Message(Message.NORMAL);
   			msg.setHeader( {MSG:MainApplicationConstants.REMOVE_WINDOW_MSG, SRC: DesktopShareModuleConstants.FROM_DESKTOPSHARE_MODULE,
   						TO: MainApplicationConstants.TO_MAIN });
   			msg.setPriority(Message.PRIORITY_HIGH );
   			desktopShareWindow.closeBtn.removeEventListener(MouseEvent.CLICK, removeWindow);
   			msg.setBody(viewComponent as DesktopShareModule);
			outpipe.write(msg);
			//log.debug("A message has been sent to remove the chat window.");
			//log.debug("Disconnecting chat module...");
			//proxy.closeConnection();
		}
		
		protected function get desktopShareModule():DesktopShareModule
		{
			return viewComponent as DesktopShareModule;
		}
		
		private function messageReceiver(message : IPipeMessage) : void
		{
			var msg : String = message.getHeader().MSG;
		}
		
		public function get proxy():DesktopShareProxy
		{
			return facade.retrieveProxy(DesktopShareProxy.NAME) as DesktopShareProxy;
		} 
		
	}
}