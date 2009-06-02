package org.bigbluebutton.modules.video.model.services
{
	import flash.net.NetConnection;
	
	public class StreamFactory
	{
		private var _conn:NetConnection;
		
		public function StreamFactory(connection:NetConnection)
		{
			_conn = connection;
		}

		public function createBroadcastStream():BroadcastStream {
			return new BroadcastStream(_conn);
		}
		
		public function createPlayStream():PlayStream {
			return new PlayStream(_conn);
		}
	}
}