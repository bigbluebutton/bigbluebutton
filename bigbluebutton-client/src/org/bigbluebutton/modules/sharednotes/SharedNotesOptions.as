package org.bigbluebutton.modules.sharednotes
{
	import org.bigbluebutton.core.BBB;

	public class SharedNotesOptions
	{
		[Bindable]
		public var refreshDelay:int = 500;
		
		[Bindable]
		public var responseTimeout:int = 3000;
		
		[Bindable]
		public var enablePlayback:Boolean = false;
		
		[Bindable]
		public var position:String = "bottom-left";
		
		[Bindable]
		public var autoStart:Boolean = false;
		
		public function SharedNotesOptions()
		{
			var vxml:XML = BBB.getConfigForModule("SharedNotesModule");
			if (vxml != null) {
				if (vxml.@refreshDelay != undefined) {
					refreshDelay = Number(vxml.@refreshDelay);
				}
				if (vxml.@responseTimeout != undefined) {
					responseTimeout = Number(vxml.@responseTimeout);
				}
				if (vxml.@enablePlayback != undefined) {
					enablePlayback = (vxml.@enablePlayback.toString().toUpperCase() == "TRUE") ? true : false;
				}
				if (vxml.@position != undefined) {
					position = vxml.@position.toString();
				}
				if (vxml.@autoStart != undefined) {
					autoStart = (vxml.@autoJoin.toString().toUpperCase() == "TRUE") ? true : false;
				}
			}
		}
	}
}