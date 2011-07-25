package org.bigbluebutton.modules.videoconf.model
{
	public class VideoConfOptions
	{
		[Bindable]
		public var autoStart:Boolean = false;
		
		[Bindable]
		public var showButton:Boolean = true;
		
		[Bindable]
		public var publishWindowVisible:Boolean = true;
		
		[Bindable]
		public var viewerWindowMaxed:Boolean = false;

		[Bindable]
		public var viewerWindowLocation:String = "middle";
		
	}
}