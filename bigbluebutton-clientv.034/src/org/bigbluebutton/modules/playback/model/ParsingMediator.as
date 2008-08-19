package org.bigbluebutton.modules.playback.model
{
	import flash.events.TimerEvent;
	import flash.utils.Timer;
	
	import org.bigbluebutton.modules.playback.PlaybackFacade;
	import org.bigbluebutton.modules.playback.controller.notifiers.ParseNotifier;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	/**
	 * The ParsingMediator parser a received XML file into properly timed events that are then dispatched
	 * to the MessagingProxy 
	 * @author dzgonjan
	 * 
	 */	
	public class ParsingMediator extends Mediator implements IMediator 
	{
		public static const NAME:String = "ParsingMediator";
		
		private var startTime:Number;
		private var timer:Timer;
		private var mainSequence:XMLList;
		private var events:Array;
		
		private var count:int = 0;
		
		public function ParsingMediator(xml:XML)
		{
			super(NAME, xml);
			startTime = xml.@start;
			timer = new Timer(1000);
			mainSequence = xml.par.seq;
			
			var item:XML;
			events = new Array();
			for each (item in mainSequence.chat){
				events.push(item);
			}
			sendNotification(PlaybackFacade.PARSE_COMPLETE, new ParseNotifier(mainSequence.chat, "Chat"));

			timer.addEventListener(TimerEvent.TIMER, onTimer);
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
		
		private function startPlayback():void{
			timer.start();
		}
		
		private function stopPlayback():void{
			timer.stop();
		}
		
		private function onTimer(e:TimerEvent):void{
			sendNotification(PlaybackFacade.TEST, events[count]);
			count++;
		}

	}
}