package org.bigbluebutton.lib.video.models {
	import org.bigbluebutton.lib.user.models.User;
	
	public class UserStreamName {
		public var streamName:String;
		
		public var user:org.bigbluebutton.lib.user.models.User;
		
		public function UserStreamName(streamName:String, user:User) {
			this.streamName = streamName;
			this.user = user;
		}
	}
}
