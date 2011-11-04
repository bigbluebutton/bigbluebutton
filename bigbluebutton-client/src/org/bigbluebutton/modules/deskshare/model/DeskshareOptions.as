package org.bigbluebutton.modules.deskshare.model
{
	import org.bigbluebutton.core.BBB;
	
	public class DeskshareOptions
	{
		[Bindable] public var autoStart:Boolean = false;
		
		public function parseOptions():void {
			var vxml:XML = BBB.getConfigForModule("DeskShareModule");
			if (vxml != null) {
				if (vxml.@autoStart != undefined) {
					autoStart = (vxml.@autoStart.toString().toUpperCase() == "TRUE") ? true : false;
				}
			}
		}
	}
}