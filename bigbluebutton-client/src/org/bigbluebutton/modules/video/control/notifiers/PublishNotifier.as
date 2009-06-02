package org.bigbluebutton.modules.video.control.notifiers
{
	public class PublishNotifier
	{
		public var publishMode:String;
		public var streamName:String;
		
		public function PublishNotifier(publishMode:String, streamName:String)
		{
			this.publishMode = publishMode;
			this.streamName = streamName;
		}

	}
}