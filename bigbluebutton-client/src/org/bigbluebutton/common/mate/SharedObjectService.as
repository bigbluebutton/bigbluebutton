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
	
	import mx.collections.ArrayCollection;
	
	/**
	 * The SharedObjectService abstracts the communication with Remote SharedObjects located on a server 
	 * @author Snap
	 * 
	 */	
	public class SharedObjectService extends EventDispatcher
	{
		private var nc:NetConnection;
		
		public var url:String;
		
		private var arrayOfConnectedObjects:ArrayCollection;
		private var listOfConnectedObjects:ArrayCollection;
		private var dispatcher:Dispatcher;
		
		/**
		 * The constructor 
		 * @param url - The url of the application on the server (Flash Media Server, Red5) to which you are trying to connect to
		 * @param connection - An already open connection, if you have one. If this is null, a new connection to the url parameter will be made
		 * 
		 */		
		public function SharedObjectService(url:String, connection:NetConnection = null)
		{
			arrayOfConnectedObjects = new ArrayCollection();
			listOfConnectedObjects = new ArrayCollection();
			dispatcher = new Dispatcher();
			
			if (connection != null) this.nc = connection;
			else nc = new NetConnection();
			
			this.url = url;
			nc.client = this;
			nc.addEventListener(AsyncErrorEvent.ASYNC_ERROR, onAsyncError);
			nc.addEventListener(IOErrorEvent.IO_ERROR, onIOError);
			nc.addEventListener(NetStatusEvent.NET_STATUS, onNetStatus);
			nc.addEventListener(SecurityErrorEvent.SECURITY_ERROR, onSecurityError);
			
			if (!nc.connected) nc.connect(url); 
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
					sendUpdateFailedEvent(event.info.toString());
				break;
				case "NetConnection.Connect.Success":
				break;
				case "NetConnection.Connect.Rejected":
					sendUpdateFailedEvent(event.info.toString());
				break;
				case "NetConnection.Connect.Closed":
					sendUpdateFailedEvent(event.info.toString());
				break;
				case "NetConnection.Connect.InvalidApp":
					sendUpdateFailedEvent(event.info.toString());
				break;
				case "NetConnection.Connect.AppShutdown":
					sendUpdateFailedEvent(event.info.toString());
				break;
			}
		}
		
		private function onSecurityError(event:NetStatusEvent):void{ 
			sendUpdateFailedEvent(event.info.toString());
		}
		
		/**
		 * Connects to shared object specified by the string. If unable to connect, will dispatch a SharedObjectEvent.SHARED_OBJECT_UPDATE_FAILED event
		 * @param sharedObject
		 * 
		 */		
		public function connectToSharedObject(sharedObject:String):void{
			if (!nc.connected) sendUpdateFailedEvent("NetConnection.Closed");
			if (isConnected(sharedObject)) return;
			
			var so:SharedObject = SharedObject.getRemote(sharedObject, url, false);
			arrayOfConnectedObjects.addItem(so);
			listOfConnectedObjects.addItem(sharedObject);
			so.addEventListener(AsyncErrorEvent.ASYNC_ERROR, onAsyncError);
			so.addEventListener(NetStatusEvent.NET_STATUS, onNetStatus);
			so.addEventListener(SyncEvent.SYNC, onSharedObjectSync);
			so.client = this;
			so.connect(nc);
		}
		
		/**
		 * Update the SharedObject with a message 
		 * If the object is updated successfully, the service will dispatch a bubbling event with type=sharedObject
		 * @param sharedObject - The name of the SharedObject you are sending the update to. Also the name of the event that gets dispatched on successfull update
		 * @param message - The message you are sending
		 * 
		 */		
		public function updateSharedObject(sharedObject:String, message:Object):void{
			var so:SharedObject = getSharedObject(sharedObject);
			
			if (so == null) sendUpdateFailedEvent("Could not find Shared Object: " + sharedObject); 
			
			so.send("sharedObjectCallback", sharedObject, message);
		}
		
		public function sharedObjectCallback(sharedObject:String, message:Object):void{
			var event:SharedObjectEvent = new SharedObjectEvent(sharedObject);
			event.message = message;
			dispatcher.dispatchEvent(event);
		}
		
		private function onSharedObjectSync(event:SyncEvent):void{
			var e:SharedObjectEvent = new SharedObjectEvent(SharedObjectEvent.SHARED_OBJECT_SYNC);
			e.message = event;
			dispatcher.dispatchEvent(e);
		}
		
		private function isConnected(sharedObject:String):Boolean{
			for (var i:Number = 0; i<listOfConnectedObjects.length; i++){
				if (listOfConnectedObjects.getItemAt(i) == sharedObject) return true;
			}
			return false;
		}
		
		private function sendUpdateFailedEvent(message:String):void{
			var e:SharedObjectEvent = new SharedObjectEvent(SharedObjectEvent.SHARED_OBJECT_UPDATE_FAILED);
			e.message = message;
			dispatcher.dispatchEvent(e);
		}
		
		private function getSharedObject(sharedObject:String):SharedObject{
			for (var i:Number = 0; i<listOfConnectedObjects.length; i++){
				if (listOfConnectedObjects.getItemAt(i) == sharedObject) return arrayOfConnectedObjects.getItemAt(i) as SharedObject;
			}
			return null;
		}

	}
}