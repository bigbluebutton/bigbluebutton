package org.bigbluebutton.modules.playback.controller.notifiers
{
	public class ParseNotifier
	{
		public var list:XMLList;
		public var moduleName:String;
		
		public function ParseNotifier(list:XMLList, moduleName:String)
		{
			this.list = list;
			this.moduleName = moduleName;
		}

	}
}