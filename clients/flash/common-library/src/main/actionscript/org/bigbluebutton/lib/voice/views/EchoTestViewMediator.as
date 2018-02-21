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
			// TODO : Show the progress bar initially and the start test button
			
			// If the start button is clicked he hide it with the progress bar
			// then show the the yes and no buttons
			
			// If the back button is selected we stop the echo test and get back the previous screen
			
			// If the yes button is clicked we :
			//  1 - Stop the echo test
			//  2 - Get back the main screen
			//  3 - Connect to the main room audio
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
			microphoneNetConnection = new NetConnection();
			microphoneNetConnection.objectEncoding = ObjectEncoding.AMF3;
			microphoneNetConnection.proxyType = "best";
			microphoneNetConnection.connect(null);
			netStream = new NetStream(microphoneNetConnection);
			if (selectedMicrophone != null) {
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
					// statusText.text = "You did not allow Flash to access your mic.";
					break;
				case "Microphone.Unmuted":
					// Comment these next 2-lines. We don't want the user hearing audio
					// while testing mic levels. (richard mar 26, 2014)
					// mic.setLoopBack(true);
					// mic.setUseEchoSuppression(true);   
					//http://stackoverflow.com/questions/2936925/no-mic-activity-with-setloopback-set-to-false-as3
					//http://groups.yahoo.com/neo/groups/flexcoders/conversations/topics/144047
					
					// mic.gain = micRecordVolume.value;
					// microphoneList = Media.getMicrophoneNames();
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
			testMicrophoneLoopback();
			echoTestHasNoAudioSignal.dispatch();
		}
		
		override public function destroy():void {
			super.destroy();
			
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
