package org.bigbluebutton.modules.playback.controller.notifiers
{
	public class ParseNotifier
	{
		public var list:XMLList;
		public var moduleName:String;
		public var startTime:Number
		
		public function ParseNotifier(list:XMLList, moduleName:String, startTime:Number)
		{
			this.list = list;
			this.moduleName = moduleName;
			this.startTime = startTime;
		}

	}
}