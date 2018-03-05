package org.bigbluebutton.air.screenshare.model
{

	public class ScreenshareModel implements IScreenshareModel
	{
		
		private var _isScreenSharing:Boolean = false;
		private var _stream:ScreenshareStream = new ScreenshareStream();
		
		public function get isSharing():Boolean {
			return _isScreenSharing;
		}
		
		public function get width():int {
			return _stream.width;
		}
		
		public function set width(w:int):void {
			_stream.width = w;
		}
		
		public function get height():int {
			return _stream.height;
		}
		
		public function set height(h:int):void {
			_stream.height = h;
		}
		
		public function get url():String {
			return _stream.url;
		}
		
		public function set url(u:String):void {
			_stream.url = u;
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
	}
}