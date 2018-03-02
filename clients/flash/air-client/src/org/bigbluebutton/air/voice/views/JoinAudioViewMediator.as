package org.bigbluebutton.air.voice.views {
	import flash.events.MouseEvent;
	
	import org.bigbluebutton.air.common.PageEnum;
	import org.bigbluebutton.air.main.models.IUISession;
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.voice.commands.ShareMicrophoneSignal;
	import org.bigbluebutton.lib.voice.models.AudioTypeEnum;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class JoinAudioViewMediator extends Mediator {
		
		[Inject]
		public var view:JoinAudioView;
		
		[Inject]
		public var uiSession:IUISession;
		
		[Inject]
		public var conferenceParameters:IConferenceParameters;
		
		[Inject]
		public var shareMicrophoneSignal:ShareMicrophoneSignal;
		
		public override function initialize():void {
			super.initialize();
			
			view.listenOnlyButton.addEventListener(MouseEvent.CLICK, listenOnlyButtonHandler);
			view.microphoneButton.addEventListener(MouseEvent.CLICK, microphoneButtonHandler);
		}
		
		private function listenOnlyButtonHandler(event:MouseEvent):void {
			var audioOptions:Object = new Object();
			audioOptions.shareMic = true;
			audioOptions.listenOnly = false;
			shareMicrophoneSignal.dispatch(AudioTypeEnum.LISTEN_ONLY, conferenceParameters.webvoiceconf);
			uiSession.popPage();
		}
		
		private function microphoneButtonHandler(event:MouseEvent):void {
			uiSession.pushPage(PageEnum.ECHOTEST);
		}
		
		override public function destroy():void {
			super.destroy();
			
			view.listenOnlyButton.removeEventListener(MouseEvent.CLICK, listenOnlyButtonHandler);
			view.microphoneButton.removeEventListener(MouseEvent.CLICK, microphoneButtonHandler);
		}
	}
}
