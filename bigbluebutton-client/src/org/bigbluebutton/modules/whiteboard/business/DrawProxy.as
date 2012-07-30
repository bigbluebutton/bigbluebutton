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
	import org.bigbluebutton.modules.whiteboard.business.shapes.GraphicObject;
	import org.bigbluebutton.modules.whiteboard.business.shapes.TextFactory;
	import org.bigbluebutton.modules.whiteboard.business.shapes.TextObject;
	import org.bigbluebutton.modules.whiteboard.business.shapes.WhiteboardConstants;
	import org.bigbluebutton.modules.whiteboard.events.PageEvent;
	import org.bigbluebutton.modules.whiteboard.events.StartWhiteboardModuleEvent;
	import org.bigbluebutton.modules.whiteboard.events.ToggleGridEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardDrawEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardPresenterEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardUpdate;
	import org.bigbluebutton.modules.whiteboard.models.WhiteboardModel;
	
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
		private var textFactory:TextFactory;		
		private var initialLoading:Boolean = true;
		private var initialPageEvent:PageEvent;
		public var whiteboardModel:WhiteboardModel;
		
		public function DrawProxy() {
			drawFactory = new DrawObjectFactory();
			textFactory = new TextFactory();
			dispatcher = new Dispatcher();
            BBB.initConnectionManager().addMessageListener(this);
            LogUtil.debug("DRAW PROXY INIT !!!!");
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
//            dispatcher.dispatchEvent(new WhiteboardUpdate(WhiteboardUpdate.SHAPE_UNDONE));
        }
        
        private function handleEnableWhiteboardCommand(message:Object):void {
            //if (result as Boolean) modifyEnabledCallback(true);
            LogUtil.debug("Handle Whiteboard Enabled Command " + message.enabled);
        }

        private function handleNewAnnotationCommand(message:Object):void {
            LogUtil.debug("Handle new annotation[" + message.type + ", " + message.id + ", " + message.status + "]");
			switch (message.type) {
				case "text":
//					annotation["type"] = "text";
//					annotation["id"] = tobj.getGraphicID();
//					annotation["status"] = tobj.status;  
//					annotation["text"] = tobj.text;
//					annotation["fontColor"] = tobj.textColor;
//					annotation["backgroundColor"] = tobj.backgroundColor;
//					annotation["background"] = tobj.background;
//					annotation["x"] = tobj.x;
//					annotation["y"] = tobj.y;
//					annotation["fontSize"] = tobj.textSize;
//					addText(message.type, message.text, message.fontColor, message.backgroundColor, 
					break;
				
			}
        }
					
		private function addText(graphicType:String, text:String, textColor:uint, bgColor:uint, bgColorVisible:Boolean,
								x:Number, y:Number, textSize:Number, id:String, status:String, recvdShapes:Boolean = false):void {
			LogUtil.debug("Rx add text **** with ID of " + id + " " + x + "," + y);
			var t:TextObject = new TextObject(text, textColor, bgColor, bgColorVisible, x, y, textSize);	
			t.setGraphicID(id);
			t.status = status;
			
			//			var e:WhiteboardUpdate = new WhiteboardUpdate(WhiteboardUpdate.BOARD_UPDATED);
			//			e.data = t;
			//			e.recvdShapes = recvdShapes;
			//			dispatcher.dispatchEvent(e);
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
        
		
		public function getPageHistory(e:PageEvent):void {
//			var nc:NetConnection = connection;
//
//			nc.call("whiteboard.setActivePage",
//				new Responder(	        		
//					function(result:Object):void { // On successful result
//						if ((result as int) != e.shapes.length) {
//							LogUtil.debug("Whiteboard: Need to retrieve shapes. Have " + e.shapes.length + " on client, " + (result as int) + " on server");
//							LogUtil.debug("Whiteboard: Retrieving shapes on page" + e.pageNum);
//							getHistory(); 
//						} else{
//							LogUtil.debug("Whiteboard: Shapes up to date, no need to update");
//						}
//					},	
//					
//					function(status:Object):void { // status - On error occurred
//						LogUtil.error("Error occurred: Whiteboard::DrawProxy::getPageHistory()"); 
//						for (var x:Object in status) { 
//							LogUtil.error(x + " : " + status[x]); 
//						} 
//					}
//				),//new Responder
//				e.pageNum
//			); //_netConnection.call
		}
		


		/**
		 * Adds a shape to the ValueObject, then triggers an update event
		 * @param array The array representation of a shape
		 * 
		 */		
/*		public function addSegment(graphicType:String, array:Array, type:String, color:uint, thickness:uint, 
								   fill:Boolean, fillColor:uint, transparent:Boolean, id:String, status:String, recvdShapes:Boolean = false):void{
			//LogUtil.debug("Rx add segment **** with ID of " + id + " " + type
			//+ " and " + color + " " + thickness + " " + fill + " " + transparent);
			var d:DrawObject = drawFactory.makeDrawObject(type, array, color, thickness, fill, fillColor, transparent);
			
			d.setGraphicID(id);
			d.status = status;
			
			var e:WhiteboardUpdate = new WhiteboardUpdate(WhiteboardUpdate.BOARD_UPDATED);
			e.data = d;
			e.recvdShapes = recvdShapes;
			dispatcher.dispatchEvent(e);
		}
*/				
		/**
		 * Triggers the undo shape event on all clients 
		 * 
		 */		
		public function undo():void{
			dispatcher.dispatchEvent(new WhiteboardUpdate(WhiteboardUpdate.GRAPHIC_UNDONE));
		}
				
		/**
		 * Triggers the toggle grid event
		 * 
		 */		
		public function toggleGridCallback():void{
			LogUtil.debug("TOGGLE CALLBACK RECEIVED"); 
			dispatcher.dispatchEvent(new ToggleGridEvent(ToggleGridEvent.GRID_TOGGLED));
		}
			
		public function modifyEnabledCallback(enabled:Boolean):void{
			var e:WhiteboardUpdate = new WhiteboardUpdate(WhiteboardUpdate.BOARD_ENABLED);
			e.boardEnabled = enabled;
			dispatcher.dispatchEvent(e);
		}
				
		private function receivedGraphicsHistory(result:Object):void{
			if (result == null) return;
			
			var graphicObjs:Array = result as Array;
			LogUtil.debug("Whiteboard::recievedShapesHistory() : recieved " + graphicObjs.length);
			
			var receivedShapes:Array = new Array();
			for (var i:int=0; i < graphicObjs.length-1; i++) {
				var graphic:Array = graphicObjs[i] as Array;
				var graphicType:String = graphic[0] as String;
				if(graphicType == WhiteboardConstants.TYPE_SHAPE) {
					var shapeArray:Array = graphic[1] as Array;
					var type:String = graphic[2] as String;
					var color:uint = graphic[3] as uint;
					var thickness:uint = graphic[4] as uint;
					var fill:Boolean = graphic[5] as Boolean;
					var fillColor:uint = graphic[6] as uint;
					var transparent:Boolean = graphic[7] as Boolean;
					var id:String = graphic[8] as String;
					var status:String = graphic[9] as String;
					var dobj:DrawObject = new DrawObject(type, shapeArray, color, thickness, fill, fillColor, transparent);
					dobj.setGraphicID(id);
					receivedShapes.push(dobj);
					addSegment(graphicType, shapeArray, type, color, thickness, fill, fillColor, transparent, id, status, true);
				} else if(graphicType == WhiteboardConstants.TYPE_TEXT) {
					var text:String = (graphic[1] as String);
					var textColor:uint = (graphic[2] as uint);
					var bgColor:uint = (graphic[3] as uint);
					var bgColorVisible:Boolean = (graphic[4] as Boolean);
					var x:Number = (graphic[5] as Number);
					var y:Number = (graphic[6] as Number);
					var textSize:Number = (graphic[7] as Number);
					var id_other:String = (graphic[8] as String);
					var status_other:String = (graphic[9] as String);
					var tobj:TextObject = new TextObject(text, textColor, bgColor, bgColorVisible,
														x, y, textSize);
					tobj.status = status_other
					tobj.setGraphicID(id_other);
					receivedShapes.push(tobj);
					addText(graphicType, text, textColor, bgColor, bgColorVisible, x, y, textSize, id_other, status_other, true);
				}
			}
			
			var isGrid:Boolean = graphicObjs[graphicObjs.length-1][0] as Boolean;
			if(isGrid) {
				LogUtil.debug("Contacted server and server says grid mode is on for the current page. :D");
				toggleGridCallback();
			}
		}	
	}
}
