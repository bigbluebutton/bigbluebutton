package org.bigbluebutton.clientcheck.model
{
	import flash.net.Socket;

	public class CustomSocket extends Socket
	{
		// need to add a port property in order to distinguish sockets when getting connection response
		private var _port:int;

		public override function connect(host:String, port:int):void
		{
			_port=port;
			super.connect(host, port);
		}

		public function get port():int
		{
			return _port;
		}
	}
}
