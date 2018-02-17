package org.bigbluebutton.lib.video.models {
	
	public class Webcams {
		private var _webcams:Object;
		
		public function Webcams() {
			_webcams = new Object();
		}
		
		public function add(stream:WebcamStreamInfo):void {
			_webcams[stream.streamId] = stream;
		}
		
		public function remove(streamId:String):WebcamStreamInfo {
			var itemToRemove:WebcamStreamInfo = null;
			
			if (_webcams.propertyIsEnumerable(streamId)) {
				itemToRemove = _webcams[streamId];
				delete _webcams[streamId];
			}
			
			return itemToRemove;
		}
		
		
	}
}
