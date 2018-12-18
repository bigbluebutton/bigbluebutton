package org.bigbluebutton.air.common.utils {
	
	public class URLParser {
		protected const reg:RegExp = /(?P<protocol>[a-zA-Z]+) : \/\/  (?P<host>[^:\/]*) (:(?P<port>\d+))?  ((?P<path>[^?]*))? ((?P<parameters>.*))? /x;
		
		private var _protocol:String;
		
		private var _host:String;
		
		private var _port:String;
		
		private var _path:String;
		
		private var _parameters:String;
		
		public function URLParser(url:String) {
			parse(url);
		}
		
		public function parse(url:String):void {
			var results:Array = reg.exec(url);
			_protocol = results.protocol;
			_host = results.host;
			_port = results.port;
			if (_port.length == 0) {
				_port = getDefaultPortByProtocol(_protocol);
			}
			_path = results.path;
			_parameters = results.parameters;
		}
		
		private function getDefaultPortByProtocol(protocol:String):String {
			switch (protocol) {
				case "http":
					return "80";
				case "https":
					return "443";
				case "rtmp":
					return "1935";
				default:
					throw("Protocol " + protocol + " has no default port");
					// include your default port here!
			}
		}
		
		public function get protocol():String {
			return _protocol;
		}
		
		public function get host():String {
			return _host;
		}
		
		public function get port():String {
			return _port;
		}
		
		public function get path():String {
			return _path;
		}
		
		public function get parameters():String {
			return _parameters;
		}
	}
}
