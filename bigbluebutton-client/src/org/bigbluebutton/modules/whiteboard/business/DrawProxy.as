/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
* 
*/
package org.bigbluebutton.modules.whiteboard.business
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.NetStatusEvent;
	import flash.events.SyncEvent;
	import flash.events.TimerEvent;
	import flash.net.NetConnection;
	import flash.net.Responder;
	import flash.net.SharedObject;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.main.model.users.IMessageListener;
	import org.bigbluebutton.modules.present.events.PresentationEvent;
	import org.bigbluebutton.modules.whiteboard.business.shapes.DrawObject;
	import org.bigbluebutton.modules.whiteboard.business.shapes.DrawObjectFactory;
	import org.bigbluebutton.modules.whiteboard.events.PageEvent;
	import org.bigbluebutton.modules.whiteboard.events.StartWhiteboardModuleEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardDrawEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardPresenterEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardUpdate;
	
	/**
	 * The DrawProxy class is a Delegate class for the Red5 Server. It communicates directly with the Red5
	 * server and abstracts that communication so that other classes don't have to worry about it 
	 * @author dzgonjan
	 * 
	 */	
	public class DrawProxy implements IMessageListener
	{	
		private var url:String;
		private var host:String;
		private var conference:String;
		private var room:String;
		private var userid:Number;
		private var connection:NetConnection;
		
		private var manualDisconnect:Boolean = false;
		private var dispatcher:Dispatcher;
		private var drawFactory:DrawObjectFactory;
		
		private var initialLoading:Boolean = true;
		private var initialPageEvent:PageEvent;
		
		public function DrawProxy() {
			drawFactory = new DrawObjectFactory();
			dispatcher = new Dispatcher();
            BBB.initConnectionManager().addMessageListener(this);
		}
		
		public function connect(e:StartWhiteboardModuleEvent):void{
			extractAttributes(e.attributes);
		}
		
		private function extractAttributes(a:Object):void{
			host = a.host as String;
			conference = a.conference as String;
			room = a.room as String;
			userid = a.userid as Number;
			connection = a.connection;
			url = connection.uri;
		}
        
        public function onMessage(messageName:String, message:Object):void {
            LogUtil.debug("WB: received message " + messageName);
            
            switch (messageName) {
                case "WhiteboardRequestAnnotationHistoryReply":
                    handleRequestAnnotationHistoryReply(message);
                    break;
                case "WhiteboardIsWhiteboardEnabledReply":
                    handleIsWhiteboardEnabledReply(message);
                    break;
                case "WhiteboardEnableWhiteboardCommand":
                    handleEnableWhiteboardCommand(message);
                    break;    
                case "WhiteboardNewAnnotationCommand":
                    handleNewAnnotationCommand(message);
                    break;  
                case "WhiteboardClearCommand":
                    handleClearCommand(message);
                    break;  
                case "WhiteboardUndoCommand":
                    handleUndoCommand(message);
                    break;  
                case "WhiteboardChangePageCommand":
                    handleChangePageCommand(message);
                    break;                
                default:
                    LogUtil.warn("Cannot handle message [" + messageName + "]");
            }
            
        }

        private function handleChangePageCommand(message:Object):void {
            LogUtil.debug("Handle Whiteboard Change Page Command [ " + message.pageNum + ", " + message.numAnnotations + "]");
        }
        
        private function handleClearCommand(message:Object):void {
            LogUtil.debug("Handle Whiteboard Clear Command ");
            dispatcher.dispatchEvent(new WhiteboardUpdate(WhiteboardUpdate.BOARD_CLEARED));
        }
        
        private function handleUndoCommand(message:Object):void {
            LogUtil.debug("Handle Whiteboard Undo Command ");
            dispatcher.dispatchEvent(new WhiteboardUpdate(WhiteboardUpdate.SHAPE_UNDONE));
        }
        
        private function handleEnableWhiteboardCommand(message:Object):void {
            //if (result as Boolean) modifyEnabledCallback(true);
            LogUtil.debug("Handle Whiteboard Enabled Command " + message.enabled);
        }

        private function handleNewAnnotationCommand(message:Object):void {
            LogUtil.debug("Handle new annotation[" + message.type + ", " + message.id + ", " + message.status + "]");
        }
        
        private function handleIsWhiteboardEnabledReply(message:Object):void {
            //if (result as Boolean) modifyEnabledCallback(true);
            LogUtil.debug("Whiteboard Enabled? " + message.enabled);
        }
        
        private function handleRequestAnnotationHistoryReply(message:Object):void {
            if (message.count == 0) {
                LogUtil.debug("No annotations.");
            } else {
                LogUtil.debug("Number of annotations in history = " + message.count);
            }
        }
        
		
		/**
		 * Once a shared object is created, it is synced accross all clients, and this method is invoked 
		 * @param e The sync event passed to the method
		 * 
		 */		
		public function sharedObjectSyncHandler(e:SyncEvent):void{
			
		}
		
		public function setActivePresentation(e:PresentationEvent):void{
			var nc:NetConnection = connection;
			nc.call("whiteboard.setActivePresentation",
				new Responder(	        		
					function(result:Object):void { // On successful result
						LogUtil.debug("Whiteboard::setActivePresentation() : " + e.presentationName); 
					},						
					function(status:Object):void { // status - On error occurred
						LogUtil.error("Error occurred:"); 
						for (var x:Object in status) { 
							LogUtil.error(x + " : " + status[x]); 
						} 
					}
				),//new Responder
				e.presentationName, e.numberOfSlides
			); //_netConnection.call
		}
		
		public function checkIsWhiteboardOn():void {
			var nc:NetConnection = connection;
			nc.call(
				"whiteboard.isWhiteboardEnabled",// Remote function name
				new Responder(
	        		// On successful result
					function(result:Object):void { 
						LogUtil.debug("Whiteboard::checkIsWhiteboardOn() : " + result as String); 
				//		if (result as Boolean) modifyEnabledCallback(true);
					},	
					// status - On error occurred
					function(status:Object):void { 
						LogUtil.error("Error occurred:"); 
						for (var x:Object in status) { 
							LogUtil.error(x + " : " + status[x]); 
						} 
					}
				)//new Responder
				
			); //_netConnection.call
		}
		
		public function getPageHistory(e:PageEvent):void {
			var nc:NetConnection = connection;
			nc.call("whiteboard.setActivePage",
				new Responder(	        		
					function(result:Object):void { // On successful result
//						if ((result as int) != e.shapes.length) {
//							LogUtil.debug("Whiteboard: Need to retrieve shapes. Have " + e.shapes.length + " on client, " + (result as int) + " on server");
//							LogUtil.debug("Whiteboard: Retrieving shapes on page" + e.pageNum);
//							getHistory(); 
//						} else{
//							LogUtil.debug("Whiteboard: Shapes up to date, no need to update");
//						}
					},	
					
					function(status:Object):void { // status - On error occurred
						LogUtil.error("Error occurred: Whiteboard::DrawProxy::getPageHistory()"); 
						for (var x:Object in status) { 
							LogUtil.error(x + " : " + status[x]); 
						} 
					}
				),//new Responder
				e.pageNum
			); //_netConnection.call
		}
		
		/**
		 * Sends a shape to the Shared Object on the red5 server, and then triggers an update across all clients
		 * @param shape The shape sent to the SharedObject
		 * 
		 */		
		public function sendShape(e:WhiteboardDrawEvent):void{
			var shape:DrawObject = e.message;
			LogUtil.debug("*** Sending shape");
			
            var annotation:Object = new Object();
            annotation["type"] = shape.getType();
            annotation["points"] = shape.getShapeArray();
            annotation["color"] = shape.getColor();
            annotation["thickness"] = shape.getThickness();
            annotation["id"] = shape.id;
            annotation["status"] = shape.status;
            var nc:NetConnection = connection;
            nc.call("whiteboard.sendAnnotation",
                new Responder(                    
                    function(result:Object):void { // On successful result
                        //LogUtil.debug("Whiteboard::sendShape() "); 
                    },	                   
                    function(status:Object):void { // status - On error occurred
                        LogUtil.error("Error occurred:"); 
                        for (var x:Object in status) { 
                            LogUtil.error(x + " : " + status[x]); 
                        } 
                    }
                ),//new Responder
                annotation
            );
		}
		
		/**
		 * Adds a shape to the ValueObject, then triggers an update event
		 * @param array The array representation of a shape
		 * 
		 */		
		public function addSegment(array:Array, type:String, color:uint, thickness:uint, id:String, status:String):void{
			LogUtil.debug("Rx add segment ****");
			var d:DrawObject = drawFactory.makeDrawObject(type, array, color, thickness);
			d.id = id;
			d.status = status;
			
			var e:WhiteboardUpdate = new WhiteboardUpdate(WhiteboardUpdate.BOARD_UPDATED);
			e.data = d;
			dispatcher.dispatchEvent(e);
		}
        

		
		/**
		 * Sends a call out to the red5 server to notify the clients that the board needs to be cleared 
		 * 
		 */		
		public function clearBoard():void{
			var nc:NetConnection = connection;
			nc.call("whiteboard.clear",// Remote function name
				new Responder(	        		
					function(result:Object):void { // On successful result
						LogUtil.debug("Whiteboard::clearBoard()"); 
					},						
					function(status:Object):void { // status - On error occurred
						LogUtil.error("Error occurred:"); 
						for (var x:Object in status) { 
							LogUtil.error(x + " : " + status[x]); 
						} 
					}
				)//new Responder
				
			); //_netConnection.call
		}
		
		
		/**
		 * Sends a call out to the red5 server to notify the clients to undo a shape
		 * 
		 */		
		public function undoShape():void{
			var nc:NetConnection = connection;
			nc.call(
				"whiteboard.undo",// Remote function name
				new Responder(
	        		// On successful result
					function(result:Object):void { 
						LogUtil.debug("Whiteboard::undoShape()"); 
					},	
					// status - On error occurred
					function(status:Object):void { 
						LogUtil.error("Error occurred:"); 
						for (var x:Object in status) { 
							LogUtil.error(x + " : " + status[x]); 
						} 
					}
				)//new Responder
				
			); //_netConnection.call
			
			//drawSO.send("undo");
		}
		

		
		public function modifyEnabled(e:WhiteboardPresenterEvent):void{
			var nc:NetConnection = connection;
			nc.call(
				"whiteboard.enableWhiteboard",// Remote function name
				new Responder(
	        		// On successful result
					function(result:Object):void { 
						LogUtil.debug("Whiteboard::modifyEnabled() : " + e.enabled); 
					},	
					// status - On error occurred
					function(status:Object):void { 
						LogUtil.error("Error occurred:"); 
						for (var x:Object in status) { 
							LogUtil.error(x + " : " + status[x]); 
						} 
					}
				),//new Responder
				e.enabled
			); //_netConnection.call
		}
		
		public function modifyEnabledCallback(enabled:Boolean):void{
			var e:WhiteboardUpdate = new WhiteboardUpdate(WhiteboardUpdate.BOARD_ENABLED);
			e.boardEnabled = enabled;
			dispatcher.dispatchEvent(e);
		}
		
		private function getHistory():void{
			var nc:NetConnection = connection;
			nc.call(
				"whiteboard.requestAnnotationHistory",// Remote function name
				new Responder(
	        		// On successful result
					function(result:Object):void { 
						LogUtil.debug("Whiteboard::getHistory() : retrieving whiteboard history"); 
//						receivedShapesHistory(result);
					},	
					// status - On error occurred
					function(status:Object):void { 
						LogUtil.error("Error occurred:"); 
						for (var x:Object in status) { 
							LogUtil.error(x + " : " + status[x]); 
						} 
					}
				)//new Responder
				
			); //_netConnection.call
		}
		
		private function receivedShapesHistory(result:Object):void{
			if (result == null) return;
			
			var shapes:Array = result as Array;
			//LogUtil.debug("Whiteboard::recievedShapesHistory() : recieved " + shapes.length);
			
			for (var i:int=0; i < shapes.length; i++){
				var shape:Array = shapes[i] as Array;
				var shapeArray:Array = shape[0] as Array;
				var type:String = shape[1] as String;
				var color:uint = shape[2] as uint;
				var thickness:uint = shape[3] as uint;
				var id:String = shape[4] as String;
				var status:String = shape[5] as String;
				addSegment(shapeArray, type, color, thickness, id, status);
			}
		}
	}
}