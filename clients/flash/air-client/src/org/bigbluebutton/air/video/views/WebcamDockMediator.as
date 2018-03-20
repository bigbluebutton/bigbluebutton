package org.bigbluebutton.air.video.views {
	import org.bigbluebutton.air.main.models.IMeetingData;
	import org.bigbluebutton.air.main.models.IUserSession;
	import org.bigbluebutton.air.video.models.VideoProfile;
	import org.bigbluebutton.air.video.models.WebcamChangeEnum;
	import org.bigbluebutton.air.video.models.WebcamStreamInfo;
	import org.bigbluebutton.air.video.services.IVideoConnection;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class WebcamDockMediator extends Mediator {
		
		[Inject]
		public var view:WebcamDock;
		
		[Inject]
		public var meetingData:IMeetingData;
		
		[Inject]
		public var userSession:IUserSession;
		
		override public function initialize():void {
			meetingData.webcams.webcamChangeSignal.add(onWebcamChangeSignal);
			
			// check for active webcams
			var viewedStream:String = meetingData.webcams.viewedWebcamStream;
			if (viewedStream == "") {
				// manually turned off so ignore
			} else if (viewedStream != null) {
				var previousWebcam:WebcamStreamInfo = meetingData.webcams.findWebcamByStreamId(viewedStream);
				
				if (previousWebcam != null) {
					startWebcam(previousWebcam);
				} else {
					showFirstWebcam();
				}
			} else {
				showFirstWebcam();
			}
		}
		
		private function onWebcamChangeSignal(webcam:WebcamStreamInfo, enum:int):void {
			switch (enum) {
				case WebcamChangeEnum.ADD:
					// if none showing play it
					if (meetingData.webcams.viewedWebcamStream == null) {
						startWebcam(webcam);
					}
					break;
				case WebcamChangeEnum.REMOVE:
					// if playing stop
					if (meetingData.webcams.viewedWebcamStream == webcam.streamId) {
						stopWebcam(webcam);
					}
					break;
			}
		}
		
		private function showFirstWebcam():void {
			var webcams:Array = meetingData.webcams.getAll();
			if (webcams.length > 0) {
				startWebcam(webcams[0] as WebcamStreamInfo);
			}
		}
		
		private function startWebcam(webcam:WebcamStreamInfo):void {
			var videoProfile:VideoProfile = userSession.videoProfileManager.getVideoProfileByStreamName(webcam.streamId);
			if (videoProfile) {
				view.startStream(userSession.videoConnection.connection, webcam.name, webcam.streamId, webcam.userId, videoProfile.width, videoProfile.height);
				meetingData.webcams.viewedWebcamStream = webcam.streamId;
			}
		}
		
		private function stopWebcam(webcam:WebcamStreamInfo):void {
			view.closeStream();
			meetingData.webcams.viewedWebcamStream = null;
		}
		
		override public function destroy():void {
			meetingData.webcams.webcamChangeSignal.remove(onWebcamChangeSignal);
			
			if (meetingData.webcams.viewedWebcamStream) {
				view.closeStream();
			}
		}
	}
}
