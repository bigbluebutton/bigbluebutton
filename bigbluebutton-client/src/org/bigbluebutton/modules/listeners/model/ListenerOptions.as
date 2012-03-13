package org.bigbluebutton.modules.listeners.model
{
	import org.bigbluebutton.core.BBB;

	public class ListenerOptions
	{
		[Bindable]
		public var windowVisible:Boolean = true;
		
		[Bindable]
		public var position:String = "middle-left";
		
		public function ListenerOptions()
		{
			var vxml:XML = BBB.getConfigForModule("ListenersModule");
			if (vxml != null) {
				windowVisible = (vxml.@windowVisible.toString().toUpperCase() == "TRUE") ? true : false;
			}
			if (vxml.@position != undefined) {
				position = vxml.@position.toString();
			}
		}

	}
}