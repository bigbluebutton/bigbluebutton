package org.bigbluebutton.common.mate
{
	import flash.events.EventDispatcher;
	import flash.events.NetStatusEvent;
	import flash.net.NetConnection;
	import flash.net.Responder;
	
	public class NetConnectionService extends EventDispatcher
	{
		private var nc:NetConnection;
		private var responder:Responder;
		
		public function NetConnectionService()
		{	
			responder = new Responder(
							function(result:Object):void{
								sendCallSuccessEvent(result);
							},
							function(status:Object):void{
								sendCallFailedEvent(status.toString());
							}
									);
		}
		
		public function connect(url:String, connection:NetConnection = null):void{
			if (connection != null  && this.nc == null) this.nc = connection;
			else nc = new NetConnection();
			
			if (!nc.connected){
				nc.client = this;
				nc.addEventListener(AsyncErrorEvent.ASYNC_ERROR, onAsyncError);
				nc.addEventListener(IOErrorEvent.IO_ERROR, onIOError);
				nc.addEventListener(NetStatusEvent.NET_STATUS, onNetStatus);
				nc.addEventListener(SecurityErrorEvent.SECURITY_ERROR, onSecurityError);
				nc.connect(url);
			} 
		}
		
		private function onAsyncError(event:NetStatusEvent):void{
			sendCallFailedEvent(event.info.toString());
		}
		
		private function onIOError(event:NetStatusEvent):void{
			sendCallFailedEvent(event.info.toString());
		}
		
		private function onNetStatus(event:NetStatusEvent):void{
			switch(event.info.code){
				case "NetConnection.Connect.Failed":
					sendCallFailedEvent(event.info.toString());
				break;
				case "NetConnection.Connect.Success":
				break;
				case "NetConnection.Connect.Rejected":
					sendCallFailedEvent(event.info.toString());
				break;
				case "NetConnection.Connect.Closed":
					sendCallFailedEvent(event.info.toString());
				break;
				case "NetConnection.Connect.InvalidApp":
					sendCallFailedEvent(event.info.toString());
				break;
				case "NetConnection.Connect.AppShutdown":
					sendCallFailedEvent(event.info.toString());
				break;
			}
		}
		
		private function onSecurityError(event:NetStatusEvent):void{
			sendCallFailedEvent(event.info.toString());
		}
		
		private function sendCallFailedEvent(whatHappened:String):void{
			var e:NetConnectionEvent = new NetConnectionEvent(NetConnectionEvent.NET_CONNECTION_CALL_FAILED);
			e.message = whatHappened;
			dispatchEvent(e);
		}
		
		private function sendCallSuccessEvent(result:Object):void{
			var e:NetConnectionEvent = new NetConnectionEvent(NetConnectionEvent.NET_CONNECTION_CALL_SUCCESS);
			e.message = result;
			dispatchEvent(e);
		}
		
		public function callService(serviceName:String, arg1:Object = null, arg2:Object = null):void{
			nc.call(serviceName, responder, arg1, arg2);
		}

	}
}