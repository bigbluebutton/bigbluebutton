package org.bigbluebutton.modules.broadcast.models
{
	[Bindable]
	public class Streams {		
		public var streamNames:Array = new Array();
		public var streamUrls:Array = new Array();
		public var streamIds:Array = new Array();
		
		
		public function getStreamNameAndUrl(streamId:String):Object {
			var streamIndex:int = 0;
			for (var i:int = 0; i < streamIds.length; i++) {
				if (streamId == streamIds[i]) {
					var info:Object = new Object();
					info["name"] = streamNames[i];
					info["url"] = streamUrls[i];
					return info;
				}
			}
			
			return null;
		} 
		
		public function getStreamIndex(streamId:String):Number {
			var streamIndex:int = 0;
			for (var i:int = 0; i < streamIds.length; i++) {
				if (streamId == streamIds[i]) {
					return i;
				}
			}
			
			return 0;
		}
	}
}