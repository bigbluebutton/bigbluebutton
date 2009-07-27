package org.bigbluebutton.common.mate
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.AsyncErrorEvent;
	import flash.events.EventDispatcher;
	import flash.events.IOErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.SecurityErrorEvent;
	import flash.events.SyncEvent;
	import flash.net.NetConnection;
	import flash.net.SharedObject;
	
	public class SharedObjectService extends EventDispatcher
	{
		private var nc:NetConnection;
		private var so:SharedObject;
		
		public var url:String;
		public var sharedObject:String;
		
		public function SharedObjectService()
		{
			nc = new NetConnection();
			nc.client = this;
			nc.addEventListener(AsyncErrorEvent.ASYNC_ERROR, onAsyncError);
			nc.addEventListener(IOErrorEvent.IO_ERROR, onIOError);
			nc.addEventListener(NetStatusEvent.NET_STATUS, onNetStatus);
			nc.addEventListener(SecurityErrorEvent.SECURITY_ERROR, onSecurityError);
		}
		
		public function connect(url:String, sharedObject:String, connection:NetConnection = null):void{
			if (nc.connected) return;
			
			this.url = url;
			this.sharedObject = sharedObject;
			
			if (connection != null){
				this.nc = connection; 
				connectToSharedObject();
			} 
			else nc.connect(url);
		}
		
		private function onAsyncError(event:NetStatusEvent):void{
			var e:SharedObjectEvent = new SharedObjectEvent(SharedObjectEvent.SHARED_OBJECT_UPDATE_FAILED);
			e.message = event;
			dispatchEvent(e);
		}
		
		private function onIOError(event:NetStatusEvent):void{
			
		}
		
		private function onNetStatus(event:NetStatusEvent):void{
			switch(event.info.code){
				case "NetConnection.Connect.Failed":
					sendConnectionFailedEvent(event);
				break;
				case "NetConnection.Connect.Success":
					connectToSharedObject();
				break;
				case "NetConnection.Connect.Rejected":
				break;
				case "NetConnection.Connect.Closed":
				break;
				case "NetConnection.Connect.InvalidApp":
				break;
				case "NetConnection.Connect.AppShutdown":
				break;
			}
		}
		
		private function onSecurityError(event:NetStatusEvent):void{ 
		}
		
		private function connectToSharedObject():void{
			so = SharedObject.getRemote(sharedObject, url, false);
			so.addEventListener(AsyncErrorEvent.ASYNC_ERROR, onAsyncError);
			so.addEventListener(NetStatusEvent.NET_STATUS, onNetStatus);
			so.addEventListener(SyncEvent.SYNC, onSharedObjectSync);
			so.client = this;
			so.connect(nc);
		}
		
		public function updateSharedObject(message:Object):void{
			//Alert.show(message as String);
			so.send("sharedObjectCallback", message);
		}
		
		public function sharedObjectCallback(message:Object):void{
			var event:SharedObjectEvent = new SharedObjectEvent(SharedObjectEvent.SHARED_OBJECT_UPDATE_SUCCESS);
			event.message = message;
			var dispatcher:Dispatcher = new Dispatcher();
			dispatcher.dispatchEvent(event);
			//dispatchEvent(event);
		}
		
		private function onSharedObjectSync(event:SyncEvent):void{
			
		}
		
		private function sendConnectionFailedEvent(event:NetStatusEvent):void{
			
		}

	}
}