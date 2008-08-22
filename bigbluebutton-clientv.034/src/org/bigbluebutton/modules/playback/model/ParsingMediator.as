package org.bigbluebutton.modules.playback.model
{
	import org.bigbluebutton.modules.chat.ChatModuleConstants;
	import org.bigbluebutton.modules.playback.PlaybackFacade;
	import org.bigbluebutton.modules.playback.controller.notifiers.ParseNotifier;
	import org.bigbluebutton.modules.presentation.PresentationConstants;
	import org.bigbluebutton.modules.voiceconference.VoiceModuleConstants;
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
		private var mainSequence:XMLList;
		
		public function ParsingMediator(xml:XML)
		{
			super(NAME, xml);
			startTime = xml.@start;
		}
		
		override public function initializeNotifier(key:String):void{
			super.initializeNotifier(key);
			parse();
		}
		
		public function get xml():XML{
			return viewComponent as XML;
		}
		
		private function parse():void{
			mainSequence = xml.par.seq;
			
			sendNotification(PlaybackFacade.PARSE_COMPLETE, 
				new ParseNotifier(mainSequence.chat, ChatModuleConstants.TO_CHAT_MODULE, startTime));
				
			sendNotification(PlaybackFacade.PARSE_COMPLETE,
				new ParseNotifier(mainSequence.presentation, PresentationConstants.TO_PRESENTATION_MODULE, startTime));
		
			sendNotification(PlaybackFacade.PARSE_COMPLETE,
				new ParseNotifier(mainSequence.voice, VoiceModuleConstants.TO_VOICE_MODULE, startTime));
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
			//timer.start();
		}
		
		private function stopPlayback():void{
			//timer.stop();
		}

	}
}