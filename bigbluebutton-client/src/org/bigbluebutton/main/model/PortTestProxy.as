package org.bigbluebutton.main.model
{
	import flash.events.NetStatusEvent;
	import flash.net.NetConnection;
	
	import org.bigbluebutton.core.porttester.PortTest;
	import org.bigbluebutton.main.MainApplicationConstants;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;

	public class PortTestProxy extends Proxy implements IProxy
	{
		public static const NAME:String = 'PortTestProxy';
		
		private var nc:NetConnection;
		private var protocol:String;
		private var port:String;
		private var hostname:String;
		private var application:String;
		private var uri:String;
		
		public function PortTestProxy()
		{
			super(NAME);
		}
		
		public function connect(protocol:String = "",
								  hostname:String = "",
								  port:String = "",
								  application:String = ""):void
		{
			var portTest:PortTest = new PortTest(protocol,hostname,port,application);
			portTest.addConnectionSuccessListener(connectionListener);
			portTest.connect();
		}
		
		private function connectionListener(status:String, protocol:String, hostname:String, port:String, application:String):void {
			if (status == "SUCCESS") {
				uri = protocol + "://" + hostname + "/" + application;
				LogUtil.debug("Successfully connected to " + uri);
				facade.sendNotification(MainApplicationConstants.PORT_TEST_SUCCESS, 
				 		{protocol:protocol, hostname:hostname, port:port, application:application});				
			} else {
				LogUtil.error("Failed to connect to " + uri);
				facade.sendNotification(MainApplicationConstants.PORT_TEST_FAILED, 
				 		{protocol:protocol, hostname:hostname, port:port, application:application});
			}				 		
		}
		
		public function connect1(protocol:String = "",
								  hostname:String = "",
								  port:String = "",
								  application:String = ""):void
		{
			this.protocol = protocol;
			this.hostname = hostname;
			this.port = port;
			this.application = application;
			
			nc = new NetConnection();
			nc.client = this;
			nc.addEventListener( NetStatusEvent.NET_STATUS, netStatusEventHandler );

			uri = protocol + "://" + hostname + "/" + application;
			LogUtil.debug("Testing connection to " + uri);
			try 
			{
				nc.connect( uri );
			}
			catch(e:ArgumentError) 
			{
				LogUtil.error("Incorrect arguments on connecting wiht port testing");
				facade.sendNotification(MainApplicationConstants.PORT_TEST_FAILED, 
				 		{protocol:protocol, hostname:hostname, port:port, application:application});
			}	
		}
			
		public function close() : void
		{	
			nc.removeEventListener(NetStatusEvent.NET_STATUS, netStatusEventHandler);
			nc.close();
		}
	
		protected function netStatusEventHandler(event:NetStatusEvent):void 
		{
			var info:Object = event.info;
			var statusCode : String = info.code;
			
			if ( statusCode == "NetConnection.Connect.Success" )
			{
				LogUtil.debug("Successfully connected to " + uri);
				facade.sendNotification(MainApplicationConstants.PORT_TEST_SUCCESS, 
				 		{protocol:protocol, hostname:hostname, port:port, application:application});
			}
			else if ( statusCode == "NetConnection.Connect.Rejected" ||
				 	  statusCode == "NetConnection.Connect.Failed" || 
				 	  statusCode == "NetConnection.Connect.Closed" ) 
			{
				LogUtil.error("Failed to connect to " + uri);
				facade.sendNotification(MainApplicationConstants.PORT_TEST_FAILED, 
				 		{protocol:protocol, hostname:hostname, port:port, application:application});
			} else {
				LogUtil.error("Failed to connect to " + uri + " due to " + statusCode);
			}
			// Close NetConnection.
			close();
		}
		
		/**
		 * The Red5 oflaDemo returns bandwidth stats.
		 */		
		public function onBWDone() : void {	}
		
		
	}
}