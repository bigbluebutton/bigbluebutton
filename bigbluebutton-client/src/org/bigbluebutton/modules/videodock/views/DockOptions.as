package org.bigbluebutton.modules.videodock.views
{
	import org.bigbluebutton.core.BBB;

	public class DockOptions
	{
		[Bindable]
		public var audoDock:Boolean = true;
		
		[Bindable]
		public var maximize:Boolean = false;
		
		[Bindable]
		public var position:String = "bottom-right";
		
		[Bindable]
		public var width:int = 172;
		
		[Bindable]
		public var height:int = 179;
		
		public function DockOptions()
		{
			var vxml:XML = BBB.getConfigForModule("VideodockModule");
			if (vxml != null) {
				if (vxml.@maximizeWindow != undefined) {
					maximize = (vxml.@maximizeWindow.toString().toUpperCase() == "TRUE") ? true : false;
				}
				if (vxml.@position != undefined) {
					position = vxml.@position.toString();
				}
				if (vxml.@width != undefined) {
					width = Number(vxml.@width);
				}
				if (vxml.@height != undefined) {
					height = Number(vxml.@height);
				}
			}
		}
	}
}