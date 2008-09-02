package org.bigbluebutton.modules.playback.model
{
	import flash.events.TimerEvent;
	import flash.utils.Timer;
	
	import org.bigbluebutton.common.InputPipe;
	import org.bigbluebutton.common.OutputPipe;
	import org.bigbluebutton.common.Router;
	import org.bigbluebutton.modules.playback.PlaybackFacade;
	import org.bigbluebutton.modules.playback.PlaybackModuleConstants;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeMessage;
	import org.puremvc.as3.multicore.utilities.pipes.messages.Message;
	import org.puremvc.as3.multicore.utilities.pipes.plumbing.PipeListener;
	
	/**
	 * This class sends out parsed XML events to modules using the piping utility of
	 * the pureMVC framework 
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class MessagingMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "MessagingMediator";
		
		private var outpipe : OutputPipe;
		private var inpipe : InputPipe;
		public var router : Router;
		private var inpipeListener : PipeListener;
		private var destinationModule:String;
		
		private var events:Array;
		private var timer:Timer;
		private var count:int = 0;
		private var startTime:Number;
		
		public function MessagingMediator(list:XMLList, moduleName:String, startTime:Number)
		{
			super(moduleName, list);
			this.destinationModule = moduleName;
			this.startTime = startTime;
		}
		
		override public function initializeNotifier(key:String):void{
			super.initializeNotifier(key);
			
			var item:XML;
			events = new Array();
			for each (item in list){
				events.push(item);
			}
			var eventTime:Number = events[0].@time;
			timer = new Timer(eventTime-startTime);
			timer.addEventListener(TimerEvent.TIMER, onTimer);
			
			playbackModeRequest();
		}
		
		public function get list():XMLList{
			return viewComponent as XMLList;
		}
		
		private function sendMessage(message:XML):void{
			var msg:IPipeMessage = new Message(Message.NORMAL);
			msg.setHeader({MSG: PlaybackModuleConstants.PLAYBACK_MESSAGE, SRC: PlaybackModuleConstants.FROM_PLAYBACK_MODULE,
								TO: destinationModule});
			msg.setPriority(Message.PRIORITY_HIGH);
			
			msg.setBody(message);
			sendNotification(PlaybackFacade.SEND_OUT_MESSAGE, msg);
			//outpipe.write(msg);
		}
		
		private function playbackModeRequest():void{
			var msg:IPipeMessage = new Message(Message.NORMAL);
			msg.setHeader({MSG: PlaybackModuleConstants.PLAYBACK_MODE, SRC: PlaybackModuleConstants.FROM_PLAYBACK_MODULE,
								TO: destinationModule});
			//msg.setBody(null):
			sendNotification(PlaybackFacade.SEND_OUT_MESSAGE, msg);
		}
		
		override public function listNotificationInterests():Array{
			return [
					PlaybackFacade.PLAY,
					PlaybackFacade.STOP
					];
		}
		
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()){
				case PlaybackFacade.PLAY:
					startPlayback();
					break;
				case PlaybackFacade.STOP:
					stopPlayback();
					break;
			}
		}
		
		private function onTimer(e:TimerEvent):void{
			if (events[count] != null){
				sendNotification(PlaybackFacade.TEST, events[count]);
				sendMessage(events[count] as XML);
				
				count++;
				if (events[count] != null){
					if (events[count].@time - events[count-1].@time == 0){
						this.timer.delay = 1;
					} else{
						this.timer.delay = (events[count].@time - events[count-1].@time);	
					}
				}
			} else{
				timer.stop();
			}
		}
		
		private function startPlayback():void{
			timer.start();
		}
		
		private function stopPlayback():void{
			timer.stop();
		}

	}
}