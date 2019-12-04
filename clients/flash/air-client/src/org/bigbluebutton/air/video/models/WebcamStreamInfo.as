package org.bigbluebutton.air.video.models {
	
	public class WebcamStreamInfo {
		public var streamId:String;
		
		public var userId:String;
		
		public var name:String;
		
		public function WebcamStreamInfo(streamId:String, userId:String, name:String) {
			this.streamId = streamId;
			this.userId = userId;
			this.name = name;
		}
	}
}
