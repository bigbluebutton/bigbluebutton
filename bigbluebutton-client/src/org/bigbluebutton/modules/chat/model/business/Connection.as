//written by John Grden...

package org.bigbluebutton.modules.chat.model.business
{
	import flash.events.EventDispatcher;
	import mx.events.MetadataEvent;
	import flash.net.NetConnection;
	import flash.net.ObjectEncoding;
	import flash.events.NetStatusEvent;
	import flash.events.SecurityErrorEvent;
	import org.bigbluebutton.modules.log.LogModuleFacade;
	//import org.bigbluebutton.modules.chat.view.components.ChatWindow;
	//import org.bigbluebutton.modules.chat.ChatFacade;
	import mx.controls.Alert;
	
	public class Connection extends EventDispatcher
	{
		public static var SUCCESS:String = "success";
		public static var FAILED:String = "failed";
		public static var CLOSED:String = "closed";
		public static var REJECTED:String = "rejected";
		public static var INVALIDAPP:String = "invalidApp";
		public static var APPSHUTDOWN:String = "appShutdown";
		public static var SECURITYERROR:String = "securityError";
		public static var DISCONNECTED:String = "disconnected";
		private var log : LogModuleFacade = LogModuleFacade.getInstance("LogModule");
		private var nc:NetConnection;
		private var uri:String;
		
		public function Connection()
		{
			//  create the netConnection
			log.info("Creating NetConnection...");
			nc = new NetConnection();
			
			// set the encoding to AMF0 - still waiting for AMF3 to be implemented on Red5
			nc.objectEncoding = ObjectEncoding.AMF0;
			
			//  set it's client/focus to this
			nc.client = this;
			
			// add listeners for netstatus and security issues
			log.info("Listening to NetStatusEvent.NET_STATUS ...");
			nc.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
			log.info("Listening to SecurityErrorEvent.SECURITY_ERROR ...");
			nc.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);
		}
		
		public function connect():void
		{
			if(getURI().length == 0)
			{
				Alert.show("please provide a valid URI connection string", "URI Connection String missing");
				return;
			}else if(nc.connected)
			{
				Alert.show("You are already connected to " + getURI(), "Already connected");
				return;
			}
			nc.connect(getURI());
		}
		
		public function close():void
		{
			nc.close();
		}
		
		public function setURI(p_URI:String):void
		{
			uri = p_URI;
		}
		
		public function getURI():String
		{
			return uri;
		}
		
		public function getConnection():NetConnection
		{
			return nc;
		}
		
		public function getConnected():Boolean
		{
			return nc.connected;
		}
		
		public function onBWDone():void
		{
			// have to have this for an RTMP connection
		}
		
		private function netStatusHandler(event:NetStatusEvent):void 
		{	
			var e:ConnectionEvent;
			
			switch(event.info.code)
			{
				case "NetConnection.Connect.Failed":
					e = new ConnectionEvent(Connection.FAILED, false, false, event.info.code);
					dispatchEvent(e);
					log.error("Connection Failed " + event.info.code);
				break;
				
				case "NetConnection.Connect.Success":
					e = new ConnectionEvent(Connection.SUCCESS, false, false, event.info.code);
					dispatchEvent(e);
					log.info("Connected to server Susccesfully " + event.info.code);
				break;
				
				case "NetConnection.Connect.Rejected":
					e = new ConnectionEvent(Connection.REJECTED, false, false, event.info.code);
					dispatchEvent(e);
					log.error("NetConnection.Connect.Rejected " + event.info.code);
				break;
				
				case "NetConnection.Connect.Closed":
					e = new ConnectionEvent(Connection.CLOSED, false, false, event.info.code);
					dispatchEvent(e);
					log.warning("NetConnection.Connect.Closed " + event.info.code);
				break;
				
				case "NetConnection.Connect.InvalidApp":
					e = new ConnectionEvent(Connection.INVALIDAPP, false, false, event.info.code);
					dispatchEvent(e);
					log.error("NetConnection.Connect.InvalidApp " + event.info.code);
				break;
				
				case "NetConnection.Connect.AppShutdown":
					e = new ConnectionEvent(Connection.APPSHUTDOWN, false, false, event.info.code);
					dispatchEvent(e);
					log.warning("NetConnection.Connect.AppShutDown " + event.info.code);
				break;
			}
			
			if(event.info.code != "NetConnection.Connect.Success")
			{
				// I dispatch DISCONNECTED incase someone just simply wants to know if we're not connected'
				// rather than having to subscribe to the events individually
				e = new ConnectionEvent(Connection.DISCONNECTED, false, false, event.info.code);
				dispatchEvent(e);
				log.error("Module not Connected " + event.info.code);
			}
		}
		
		private function securityErrorHandler(event:SecurityErrorEvent):void
		{
			var e:ConnectionEvent = new ConnectionEvent(Connection.SECURITYERROR, false, false, event.text);
			dispatchEvent(e);
		}
		/*public function setChatLog (messages:String) : void {
			log.info("This is serChatLog" + messages);
			var face: ChatWindow = ChatFacade.getInstance().retrieveMediator("ChatMediator").getViewComponent() as ChatWindow;
			face.txtChatBox.htmlText = messages;
		}*/
	}
}
