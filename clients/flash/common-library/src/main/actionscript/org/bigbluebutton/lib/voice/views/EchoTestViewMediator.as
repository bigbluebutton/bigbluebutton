package org.bigbluebutton.lib.voice.views {
	import flash.events.MouseEvent;
	import flash.events.StatusEvent;
	import flash.events.TimerEvent;
	import flash.media.Microphone;
	import flash.net.NetConnection;
	import flash.net.NetStream;
	import flash.net.ObjectEncoding;
	import flash.utils.Timer;
	
	import org.bigbluebutton.lib.main.models.IMeetingData;
	import org.bigbluebutton.lib.voice.commands.EchoTestHasAudioSignal;
	import org.bigbluebutton.lib.voice.commands.EchoTestHasNoAudioSignal;
	import org.bigbluebutton.lib.voice.commands.ShareMicrophoneSignal;
	import org.bigbluebutton.lib.voice.commands.StartEchoTestSignal;
	import org.bigbluebutton.lib.voice.commands.StopEchoTestSignal;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class EchoTestViewMediator extends Mediator {
		
		[Inject]
		public var view:EchoTestViewBase;
		
		[Inject]
		public var startEchoTestSignal:StartEchoTestSignal;
		
		[Inject]
		public var echoTestHasAudioSignal:EchoTestHasAudioSignal;
		
		[Inject]
		public var echoTestHasNoAudioSignal:EchoTestHasNoAudioSignal;
		
		[Inject]
		public var shareMicrophoneSignal:ShareMicrophoneSignal;
		
		[Inject]
		public var stopEchoTestSignal:StopEchoTestSignal;
		
		[Inject]
		public var meetingData:IMeetingData;
		
		private var selectedMicrophone:Microphone;
		
		private var micActivityTimer:Timer;
		
		private var microphoneNetConnection:NetConnection;
		
		private var netStream:NetStream;
		
		private var audioMicLevelDetected:int = 0;
		
		private var doingEchoTest:Boolean = false;
		
		public override function initialize():void {
			view.echoTestButton.addEventListener(MouseEvent.CLICK, echoTestButtonHandler);
			view.yesButton.addEventListener(MouseEvent.CLICK, yesButtonHandler);
			view.noButton.addEventListener(MouseEvent.CLICK, noButtonHandler);
			testMicrophoneLoopback();
		}
		
		private function testMicrophoneLoopback():void {
			reInitialize();
			
			selectedMicrophone = Microphone.getMicrophone(0);
			if (selectedMicrophone != null) {
				view.echoTestButton.enabled = true;
				selectedMicrophone.addEventListener(StatusEvent.STATUS, micStatusEventHandler)
				netStream.attachAudio(selectedMicrophone);
				
				startMicLevelListener();
				
				audioMicLevelDetected = 0;
			} else {
				view.echoTestButton.enabled = false;
			}
		}
		
		private function startMicLevelListener():void {
			micActivityTimer = new Timer(100);
			micActivityTimer.addEventListener(TimerEvent.TIMER, updateMicLevel);
			micActivityTimer.start();
		}
		
		private function updateMicLevel(e:TimerEvent):void {
			if (selectedMicrophone != null) {
				if (selectedMicrophone.activityLevel > audioMicLevelDetected) {
					audioMicLevelDetected = selectedMicrophone.activityLevel;
				}
				view.micLevelProgressBar.currentProgress = selectedMicrophone.activityLevel;
				view.micLevelProgressBar.totalProgress = 100;
			}
		}
		
		private function reInitialize():void {
			if (microphoneNetConnection) {
				microphoneNetConnection.close();
			}
			if (netStream) {
				netStream.close();
			}
			microphoneNetConnection = new NetConnection();
			microphoneNetConnection.objectEncoding = ObjectEncoding.AMF3;
			microphoneNetConnection.proxyType = "best";
			microphoneNetConnection.connect(null);
			netStream = new NetStream(microphoneNetConnection);
			if (selectedMicrophone != null && !selectedMicrophone.hasEventListener(StatusEvent.STATUS)) {
				selectedMicrophone.removeEventListener(StatusEvent.STATUS, micStatusEventHandler);
			}
			
			if (micActivityTimer != null && micActivityTimer.running) {
				micActivityTimer.stop();
			}
			
			selectedMicrophone = null;
		}
		
		private function micStatusEventHandler(event:StatusEvent):void {
			switch (event.code) {
				case "Microphone.Muted":
					view.echoLabel.text = "You did not allow Flash to access your mic.";
					break;
				case "Microphone.Unmuted":
					// @fixme : use => saveData.read("micGain") as Number; later
					selectedMicrophone.gain = 60;
					break;
				default:
					// LOGGER.debug("unknown micStatusHandler event: {0}", [event]);
			}
		}
		
		private function echoTestButtonHandler(e:MouseEvent):void {
			micActivityTimer.stop();
			doingEchoTest = true;
			view.setTestingState(true);
			startEchoTestSignal.dispatch();
		}
		
		protected function yesButtonHandler(e:MouseEvent):void {
			echoTestHasAudioSignal.dispatch();
			stopEchoTest();
			
			var audioOptions:Object = new Object();
			audioOptions.shareMic = !meetingData.users.me.voiceJoined;
			audioOptions.listenOnly = false;
			shareMicrophoneSignal.dispatch(audioOptions);
		}
		
		private function stopEchoTest():void {
			if (doingEchoTest) {
				doingEchoTest = false;
				stopEchoTestSignal.dispatch();
			}
		}
		
		private function noButtonHandler(e:MouseEvent):void {
			doingEchoTest = false;
			view.setTestingState(false);
			stopEchoTestSignal.dispatch();
			echoTestHasNoAudioSignal.dispatch();
			testMicrophoneLoopback();
		}
		
		override public function destroy():void {
			super.destroy();
			
			microphoneNetConnection.close();
			netStream.close();
			
			view.echoTestButton.removeEventListener(MouseEvent.CLICK, echoTestButtonHandler);
			view.yesButton.removeEventListener(MouseEvent.CLICK, yesButtonHandler);
			view.noButton.removeEventListener(MouseEvent.CLICK, noButtonHandler);
			
			if (selectedMicrophone && selectedMicrophone.hasEventListener(StatusEvent.STATUS)) {
				selectedMicrophone.removeEventListener(StatusEvent.STATUS, micStatusEventHandler)
			}
			
			micActivityTimer.removeEventListener(TimerEvent.TIMER, updateMicLevel);
		}
	}
}
