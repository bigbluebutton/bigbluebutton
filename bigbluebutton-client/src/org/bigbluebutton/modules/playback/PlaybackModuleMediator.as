package org.bigbluebutton.modules.playback
{
	import org.bigbluebutton.common.messaging.InputPipe;
	import org.bigbluebutton.common.messaging.OutputPipe;
	import org.bigbluebutton.common.messaging.Router;
	import org.bigbluebutton.main.MainApplicationConstants;
	import org.bigbluebutton.modules.playback.view.PlaybackWindow;
	import org.bigbluebutton.modules.playback.view.PlaybackWindowMediator;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeMessage;
	import org.puremvc.as3.multicore.utilities.pipes.messages.Message;
	import org.puremvc.as3.multicore.utilities.pipes.plumbing.PipeListener;
	
	public class PlaybackModuleMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "PlaybackModuleMeditor";
		
		private var outpipe : OutputPipe;
		private var inpipe : InputPipe;
		private var _router : Router;
		private var inpipeListener : PipeListener;
		
		private var playbackWindow:PlaybackWindow
		
		public static const TO_PLAYBACK_MODULE:String = "TO_PLAYBACK_MODULE";
		public static const FROM_PLAYBACK_MODULE:String = "FROM_PLAYBACK_MODULE";
		public static const PLAYBACK_MESSAGE:String = "PLAYBACK_MESSAGE";
		public static const PLAYBACK_MODE:String = "PLAYBACK_MODE";
		
		public function PlaybackModuleMediator(module:PlaybackModule)
		{
			super(NAME, module);
			_router = module.router;
			inpipe = new InputPipe(TO_PLAYBACK_MODULE);
			outpipe = new OutputPipe(FROM_PLAYBACK_MODULE);
			inpipeListener = new PipeListener(this, messageReceiver);
			_router.registerOutputPipe(outpipe.name, outpipe);
			_router.registerInputPipe(inpipe.name, inpipe);
			addWindow();
		}
		
		private function messageReceiver(message:IPipeMessage):void{
			var msg:String = message.getHeader().MSG;
		}
		
		private function get module():PlaybackModule{
			return viewComponent as PlaybackModule;
		}
		
		public function get router():Router{
			return _router;
		}
		
		private function addWindow():void{
			var msg:IPipeMessage = new Message(Message.NORMAL);
			msg.setHeader({MSG:MainApplicationConstants.ADD_WINDOW_MSG, SRC: FROM_PLAYBACK_MODULE,
   						TO: MainApplicationConstants.TO_MAIN });
   			msg.setPriority(Message.PRIORITY_HIGH);
   			
   			playbackWindow = new PlaybackWindow();
   			module.activeWindow = playbackWindow;
   			msg.setBody(module);
   			outpipe.write(msg);
		}
		
		override public function initializeNotifier(key:String):void{
			super.initializeNotifier(key);
			facade.registerMediator(new PlaybackWindowMediator(playbackWindow));
		}
		
		override public function listNotificationInterests():Array{
			return [
					PlaybackFacade.SEND_OUT_MESSAGE
					];
		}
		
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()){
				case PlaybackFacade.SEND_OUT_MESSAGE:
					outpipe.write(notification.getBody() as IPipeMessage);
					break;
			}
		}

	}
}