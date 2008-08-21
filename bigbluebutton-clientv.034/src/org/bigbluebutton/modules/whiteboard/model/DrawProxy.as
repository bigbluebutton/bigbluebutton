package org.bigbluebutton.modules.whiteboard.model
{
	import flash.events.SyncEvent;
	import flash.net.NetConnection;
	import flash.net.SharedObject;
	
	import org.bigbluebutton.modules.whiteboard.BoardFacade;
	import org.bigbluebutton.modules.whiteboard.model.component.DrawObject;
	import org.bigbluebutton.modules.whiteboard.model.component.DrawObjectFactory;
	import org.bigbluebutton.modules.whiteboard.model.red5.Connection;
	import org.bigbluebutton.modules.whiteboard.model.red5.ConnectionEvent;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;
	
	/**
	 * The DrawProxy class is a Delegate class for the Red5 Server. It communicates directly with the Red5
	 * server and abstracts that communication so that other classes don't have to worry about it 
	 * @author dzgonjan
	 * 
	 */	
	public class DrawProxy extends Proxy implements IProxy
	{
		public static const NAME:String = "Draw Proxy";
		public static const DEFAULT_RED5:String = "rtmp://134.117.58.92/test";
		
		private var conn:Connection;
		private var nc:NetConnection;
		private var drawSO:SharedObject;
		private var uri:String;
		
		private var drawFactory:DrawObjectFactory = new DrawObjectFactory();
		
		/**
		 * The default constructor. Initializes the Connection and the red5 NetConnection class, which
		 * interacts with the red5 server.
		 * @param drawVO The drawVO Value Object which holds the objects being drawn by the user on the Whiteboard
		 * 
		 */		
		public function DrawProxy(url:String)
		{
			super(NAME, new DrawVO());
			conn = new Connection();
			this.uri = url;
			conn.addEventListener(Connection.SUCCESS, handleSucessfulConnection);
			conn.addEventListener(Connection.FAILED, handleConnectionFailed);
			conn.addEventListener(Connection.DISCONNECTED, handleDisconnection);
			conn.setURI(this.uri);
			conn.connect();
		}
		
		/**
		 * Returns the Draw Value Object contained in this Proxy class. 
		 * @return drawVO
		 * 
		 */		
		public function get drawVO():DrawVO{
			return this.data as DrawVO;
		}
		
		/**
		 * Handles a successful connection to the red5 server 
		 * @param e The connection event passed to the method
		 * 
		 */		
		public function handleSucessfulConnection(e:ConnectionEvent):void{
			nc = conn.getConnection();
			drawSO = SharedObject.getRemote("drawSO", uri, false);
            drawSO.addEventListener(SyncEvent.SYNC, sharedObjectSyncHandler);
            drawSO.client = this;
            drawSO.connect(nc);
		}
		
		/**
		 * If the Proxy is unable to connect to the Red5 server, this event will be called 
		 * @param e The ConnectionEvent which was passed in upon unsucessful connection attempt
		 * 
		 */		
		public function handleConnectionFailed(e:ConnectionEvent):void{
			sendNotification(BoardFacade.FAILED_CONNECTION);
		}
		
		/**
		 * Once a shared object is created, it is synced accross all clients, and this method is invoked 
		 * @param e The sync event passed to the method
		 * 
		 */		
		public function sharedObjectSyncHandler(e:SyncEvent):void{
			
		}
		
		/**
		 * Handles a disconnection event
		 * @param e The dissconection event passed to the function
		 * 
		 */		
		public function handleDisconnection(e:ConnectionEvent):void{
			sendNotification(BoardFacade.FAILED_CONNECTION);
		}
		
		/**
		 * Sends a shape to the Shared Object on the red5 server, and then triggers an update across all clients
		 * @param shape The shape sent to the SharedObject
		 * 
		 */		
		public function sendShape(shape:DrawObject):void{
			try{
				drawSO.send("addSegment", shape.getShapeArray(), shape.getType(), shape.getColor(), shape.getThickness());	
			} catch(e:Error){
				sendNotification(BoardFacade.FAILED_CONNECTION);
			}
		}
		
		/**
		 * Adds a shape to the ValueObject, then triggers an update event
		 * @param array The array representation of a shape
		 * 
		 */		
		public function addSegment(array:Array, type:String, color:uint, thickness:uint):void{
			var d:DrawObject = drawFactory.makeDrawObject(type,array,color,thickness);
			this.drawVO.segment = d;
			sendNotification(BoardFacade.UPDATE, d);
		}
		
		/**
		 * Sends a call out to the red5 server to notify the clients that the board needs to be cleared 
		 * 
		 */		
		public function clearBoard():void{
			drawSO.send("clear");
		}
		
		/**
		 * Trigers the clear notification on a client 
		 * 
		 */		
		public function clear():void{
			sendNotification(BoardFacade.CLEAR_BOARD);
		}
		
		/**
		 * Sends a call out to the red5 server to notify the clients to undo a shape
		 * 
		 */		
		public function undoShape():void{
			drawSO.send("undo");
		}
		
		/**
		 * Triggers the undo shape event on all clients 
		 * 
		 */		
		public function undo():void{
			sendNotification(BoardFacade.UNDO_SHAPE);
		}

	}
}