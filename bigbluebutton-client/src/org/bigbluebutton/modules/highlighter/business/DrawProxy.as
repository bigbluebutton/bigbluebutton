/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */
package org.bigbluebutton.modules.highlighter.business
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.SyncEvent;
	import flash.net.NetConnection;
	import flash.net.SharedObject;
	
	import org.bigbluebutton.modules.highlighter.business.shapes.DrawObject;
	import org.bigbluebutton.modules.highlighter.business.shapes.DrawObjectFactory;
	import org.bigbluebutton.modules.highlighter.events.HighlighterDrawEvent;
	import org.bigbluebutton.modules.highlighter.events.HighlighterUpdate;
	import org.bigbluebutton.modules.highlighter.events.StartHighligtherModuleEvent;
	
	/**
	 * The DrawProxy class is a Delegate class for the Red5 Server. It communicates directly with the Red5
	 * server and abstracts that communication so that other classes don't have to worry about it 
	 * @author dzgonjan
	 * 
	 */	
	public class DrawProxy
	{	
		private var url:String;
		private var host:String;
		private var conference:String;
		private var room:String;
		private var userid:Number;
		private var connection:NetConnection;
		
		private var drawSO:SharedObject;
		private var manualDisconnect:Boolean = false;
		private var dispatcher:Dispatcher;
		private var drawFactory:DrawObjectFactory;
		
		/**
		 * The default constructor. Initializes the Connection and the red5 NetConnection class, which
		 * interacts with the red5 server.
		 * @param drawVO The drawVO Value Object which holds the objects being drawn by the user on the Whiteboard
		 * 
		 */		
		public function DrawProxy()
		{
			drawFactory = new DrawObjectFactory();
			dispatcher = new Dispatcher();
		}
		
		public function connect(e:StartHighligtherModuleEvent):void{
			extractAttributes(e.attributes);
			
			drawSO = SharedObject.getRemote("drawSO", url, false);
            drawSO.addEventListener(SyncEvent.SYNC, sharedObjectSyncHandler);
            drawSO.client = this;
            drawSO.connect(connection);
		}
		
		private function extractAttributes(a:Object):void{
			host = a.host as String;
			conference = a.conference as String;
			room = a.room as String;
			userid = a.userid as Number;
			connection = a.connection;
			url = connection.uri;
		}
		
		/**
		 * Once a shared object is created, it is synced accross all clients, and this method is invoked 
		 * @param e The sync event passed to the method
		 * 
		 */		
		public function sharedObjectSyncHandler(e:SyncEvent):void{
			
		}
		
		/**
		 * Sends a shape to the Shared Object on the red5 server, and then triggers an update across all clients
		 * @param shape The shape sent to the SharedObject
		 * 
		 */		
		public function sendShape(e:HighlighterDrawEvent):void{
			var shape:DrawObject = e.message;
			try{
				drawSO.send("addSegment", shape.getShapeArray(), shape.getType(), shape.getColor(), shape.getThickness());	
			} catch(e:Error){
				LogUtil.error("DrawProxy::sendShape - sending shape failed");
			}
		}
		
		/**
		 * Adds a shape to the ValueObject, then triggers an update event
		 * @param array The array representation of a shape
		 * 
		 */		
		public function addSegment(array:Array, type:String, color:uint, thickness:uint):void{
			var d:DrawObject = drawFactory.makeDrawObject(type,array,color,thickness);
			var e:HighlighterUpdate = new HighlighterUpdate(HighlighterUpdate.BOARD_UPDATED);
			e.data = d;
			dispatcher.dispatchEvent(e);
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
			dispatcher.dispatchEvent(new HighlighterUpdate(HighlighterUpdate.BOARD_CLEARED));
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
			dispatcher.dispatchEvent(new HighlighterUpdate(HighlighterUpdate.SHAPE_UNDONE));
		}

	}
}