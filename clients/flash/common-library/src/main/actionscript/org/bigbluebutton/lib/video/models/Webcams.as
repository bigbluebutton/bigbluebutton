package org.bigbluebutton.lib.video.models {
	import org.osflash.signals.Signal;
	
	public class Webcams {
		private var _webcams:Object;
		
		private var _webcamChangeSignal:Signal;
		
		public function get webcamChangeSignal():Signal {
			return _webcamChangeSignal;
		}
		
		public function Webcams() {
			_webcams = new Object();
			_webcamChangeSignal = new Signal();
		}
		
		public function add(stream:WebcamStreamInfo):void {
			_webcams[stream.streamId] = stream;
			_webcamChangeSignal.dispatch(stream, WebcamChangeEnum.ADD);
		}
		
		public function remove(streamId:String):WebcamStreamInfo {
			var itemToRemove:WebcamStreamInfo = null;
			
			if (_webcams.propertyIsEnumerable(streamId)) {
				itemToRemove = _webcams[streamId];
				delete _webcams[streamId];
				
				_webcamChangeSignal.dispatch(itemToRemove, WebcamChangeEnum.REMOVE);
			}
			
			return itemToRemove;
		}
		
		public function getAll():Array {
			var webcams:Array = new Array();
			
			for each (var webcam:WebcamStreamInfo in _webcams) {
				webcams.push(webcam);
			}
			
			return webcams;
		}
	}
}
