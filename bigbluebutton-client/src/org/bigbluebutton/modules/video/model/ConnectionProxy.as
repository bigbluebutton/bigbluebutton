package org.bigbluebutton.modules.video.model
{
	import flash.net.NetConnection;
	
	import org.bigbluebutton.modules.video.model.services.NetConnectionDelegate;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;

	public class ConnectionProxy extends Proxy implements IProxy
	{
		public static const NAME:String = "ConnectionProxy";
		
		private var _netDelegate:NetConnectionDelegate;
				
		public function ConnectionProxy()
		{
			super(NAME);
			_netDelegate = new NetConnectionDelegate();
			_netDelegate.addConnectionListener(connectionListener);
		}	
				
		public function connect(host : String) : void
		{
//			var encodingType : uint = ObjectEncoding.AMF0;
//			var proxyType : String = "none";
//			var serverType : int = 0; // Red5
//			
//			_media.generalSettings = new GeneralSettings( host,
//														serverType,
//														encodingType,
//														0 /*"none"*/ );
//			
//			delegate.connect(host,proxyType,encodingType);
		}
			
		public function disconnect() : void
		{
//			delegate.close();	
		}
		
		public function get connection():NetConnection {
			return _netDelegate.connection;
		}

		private function connectionListener(connected:Boolean):void {
			if (connected) {
				trace(NAME + ":Connected to the Video application");
//				join();
			} else {
//				leave();
				trace(NAME + ":Disconnected from the Video application");
//				notifyConnectionStatusListener(false);
			}
		}
	}
}