package org.bigbluebutton.modules.broadcast.models
{
	import org.bigbluebutton.core.BBB;

	public class BroadcastOptions {
		[Bindable]
		public var streamsUri:String;
				
		[Bindable]
		public var position:String = "absolute";
		
		public var width:int = 400;
		public var height:int = 300;
		public var x:int = 1;
		public var y:int = 1;
		
		public function BroadcastOptions() {
			var cxml:XML = 	BBB.getConfigForModule("BroadcastModule");
			if (cxml != null) {
				if (cxml.@streamsUri != undefined) {
					streamsUri = cxml.@streamsUri.toString();
				}
				if (cxml.@position != undefined) {
					position = cxml.@position.toString();
				}
				if (cxml.@width != undefined) {
					width = Number(cxml.@width.toString());
				}	
				if (cxml.@height != undefined) {
					height = Number(cxml.@height.toString());
				}
				if (cxml.@x != undefined) {
					x = Number(cxml.@x.toString());
				}
				if (cxml.@y != undefined) {
					y = Number(cxml.@y.toString());
				}
			}
		}
	}
}