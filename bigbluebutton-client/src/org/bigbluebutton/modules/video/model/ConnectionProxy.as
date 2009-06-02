package org.bigbluebutton.modules.video.model
{
	import flash.net.NetConnection;
	import flash.net.ObjectEncoding;
	
	import org.bigbluebutton.modules.video.VideoModuleConstants;
	import org.bigbluebutton.modules.video.model.services.NetConnectionDelegate;
	import org.bigbluebutton.modules.video.model.vo.settings.GeneralSettings;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;

	public class ConnectionProxy extends Proxy implements IProxy
	{
		public static const NAME:String = "ConnectionProxy";
		
		private var _netDelegate:NetConnectionDelegate;
		
		public var generalSettings:GeneralSettings;
		// Is teh disconnection due to user issuing the disconnect or is it the server
		// disconnecting due to t fault?
		private var manualDisconnect:Boolean = false;
				
		public function ConnectionProxy()
		{
			super(NAME);
			_netDelegate = new NetConnectionDelegate();
			_netDelegate.addConnectionListener(connectionListener);
			
			// Create blank general settings VO.
			generalSettings = new GeneralSettings();
		}	
				
		public function connect(uri:String) : void
		{
			var encodingType : uint = ObjectEncoding.AMF0;
			var proxyType : String = "none";
			var serverType : int = 0; // Red5
			
			generalSettings = new GeneralSettings( uri,
														serverType,
														encodingType,
														0 /*"none"*/ );
			manualDisconnect = false;
			_netDelegate.connect(uri,proxyType,encodingType);
		}
			
		public function disconnect() : void
		{
			manualDisconnect = true;
			_netDelegate.disconnect();
		}
		
		public function get connection():NetConnection {
			return _netDelegate.connection;
		}

		private function connectionListener(connected:Boolean, errors:Array=null):void {
			if (connected) {
				LogUtil.debug(NAME + ":Connected to the Video application");
				sendNotification(VideoModuleConstants.CONNECTED);
			} else {
				LogUtil.debug(NAME + ":Disconnected from the Video application");
				sendNotification(VideoModuleConstants.DISCONNECTED, {manual:manualDisconnect, errors:errors});
			}
		}
	}
}