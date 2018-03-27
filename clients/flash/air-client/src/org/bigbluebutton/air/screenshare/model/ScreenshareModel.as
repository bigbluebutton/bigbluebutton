package org.bigbluebutton.air.screenshare.model {
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class ScreenshareModel implements IScreenshareModel {
		private var _screenshareStreamStartedSignal:ISignal = new Signal();
		
		private var _screenshareStreamStoppedSignal:ISignal = new Signal();
		
		private var _isScreenSharing:Boolean = false;
		
		private var _stream:ScreenshareStream = new ScreenshareStream();
		
		public function get screenshareStreamStartedSignal():ISignal {
			return _screenshareStreamStartedSignal;
		}
		
		public function get screenshareStreamStoppedSignal():ISignal {
			return _screenshareStreamStoppedSignal;
		}
		
		public function get isSharing():Boolean {
			return _isScreenSharing;
		}
		
		public function get url():String {
			return _stream.url;
		}
		
		public function set url(u:String):void {
			_stream.url = u;
		}
		
		public function get width():int {
			return _stream.width;
		}

		public function get height():int {
			return _stream.height;
		}

		public function get streamId():String {
			return _stream.streamId;
		}
		
		public function set streamId(s:String):void {
			_stream.streamId = s;
		}
		
		public function get authToken():String {
			return _stream.authToken;
		}
		
		public function set authToken(token:String):void {
			_stream.authToken = token;
		}
		
		public function get jnlp():String {
			return _stream.jnlp;
		}
		
		public function set jnlp(j:String):void {
			_stream.jnlp = j;
		}
		
		public function get session():String {
			return _stream.session;
		}
		
		public function set session(j:String):void {
			_stream.session = j;
		}
		
		public function screenshareStreamStarted(streamId:String, width:int, height:int, url:String, session:String):void {
			this.streamId = streamId;
			this._stream.width = width;
			this._stream.height = height;
			this.url = url;
			this.session = session;
			
			_isScreenSharing = true;
			screenshareStreamStartedSignal.dispatch(streamId, width, height);
		}
		
		public function screenshareStreamStopped(session:String, reason:String):void {
			if (this.session == session) {
				_isScreenSharing = false;
				screenshareStreamStoppedSignal.dispatch(session, reason);
			}
		}
		
		public function screenshareStreamPaused(session:String):void {
			if (this.session == session) {
				_isScreenSharing = false;
				screenshareStreamStoppedSignal.dispatch(session, "PAUSED");
			}
		}
	
	}
}
