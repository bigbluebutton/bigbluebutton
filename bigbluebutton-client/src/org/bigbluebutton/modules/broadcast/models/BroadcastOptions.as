package org.bigbluebutton.modules.broadcast.models
{
	import org.bigbluebutton.core.BBB;

	public class BroadcastOptions {
		[Bindable]
		public var streamsUri:String;
				
		[Bindable]
		public var position:String = "absolute";
		
    public var showWindowControls:Boolean = false;
    public var showStreams:Boolean = true;
    public var autoPlay:Boolean = false;
    	
		public function BroadcastOptions() {
			var cxml:XML = 	BBB.getConfigForModule("BroadcastModule");
			if (cxml != null) {
				if (cxml.@streamsUri != undefined) {
					streamsUri = cxml.@streamsUri.toString();
				}
        if (cxml.@showWindowControls != undefined) {
          showWindowControls = (cxml.@showWindowControls.toString().toUpperCase() == "TRUE") ? true : false;
        }
        if (cxml.@showStreams != undefined) {
          showStreams = (cxml.@showStreams.toString().toUpperCase() == "TRUE") ? true : false;
        }
        if (cxml.@autoPlay != undefined) {
          autoPlay = (cxml.@autoPlay.toString().toUpperCase() == "TRUE") ? true : false;
        }
				if (cxml.@position != undefined) {
					position = cxml.@position.toString();
				}
			}
		}
	}
}