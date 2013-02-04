/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
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
package org.bigbluebutton.modules.whiteboard.services
{
	import flash.net.NetConnection;
	import flash.net.Responder;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.core.managers.ConnectionManager;
	import org.bigbluebutton.modules.present.events.PresentationEvent;
	import org.bigbluebutton.modules.whiteboard.business.shapes.DrawObject;
	import org.bigbluebutton.modules.whiteboard.business.shapes.TextObject;
	import org.bigbluebutton.modules.whiteboard.events.PageEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardDrawEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardPresenterEvent;

	public class MessageSender
	{	
		public function changePage(pageNum:Number):void{
//			LogUtil.debug("Sending [whiteboard.setActivePage] to server.");
			var message:Object = new Object();
			message["pageNum"] = pageNum;
			
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage("whiteboard.setActivePage", 
				function(result:String):void { // On successful result
					LogUtil.debug(result); 
				},	                   
				function(status:String):void { // status - On error occurred
					LogUtil.error(status); 
				},
				message
			);			
		}
		
		public function modifyEnabled(e:WhiteboardPresenterEvent):void {
//			LogUtil.debug("Sending [whiteboard.enableWhiteboard] to server.");
			var message:Object = new Object();
			message["enabled"] = e.enabled;
			
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage("whiteboard.toggleGrid", 
				function(result:String):void { // On successful result
					LogUtil.debug(result); 
				},	                   
				function(status:String):void { // status - On error occurred
					LogUtil.error(status); 
				},
				message
			);
		}
		
		/**
		 * Sends a call out to the red5 server to notify the clients to toggle grid mode
		 * 
		 */		
		public function toggleGrid():void{
//			LogUtil.debug("Sending [whiteboard.toggleGrid] to server.");
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage("whiteboard.toggleGrid", 
				function(result:String):void { // On successful result
					LogUtil.debug(result); 
				},	                   
				function(status:String):void { // status - On error occurred
					LogUtil.error(status); 
				}
			);
		}
		
		/**
		 * Sends a call out to the red5 server to notify the clients to undo a GraphicObject
		 * 
		 */		
		public function undoGraphic():void{
//			LogUtil.debug("Sending [whiteboard.undo] to server.");
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage("whiteboard.undo", 
				function(result:String):void { // On successful result
					LogUtil.debug(result); 
				},	                   
				function(status:String):void { // status - On error occurred
					LogUtil.error(status); 
				}
			);
		}
		
		/**
		 * Sends a call out to the red5 server to notify the clients that the board needs to be cleared 
		 * 
		 */		
		public function clearBoard():void{
//			LogUtil.debug("Sending [whiteboard.clear] to server.");
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage("whiteboard.clear", 
				function(result:String):void { // On successful result
					LogUtil.debug(result); 
				},	                   
				function(status:String):void { // status - On error occurred
					LogUtil.error(status); 
				}
			);
		}

        public function requestAnnotationHistory(presentationID:String, pageNumber:int):void{
//            LogUtil.debug("Sending [whiteboard.requestAnnotationHistory] to server.");
            var msg:Object = new Object();
            msg["presentationID"] = presentationID;
            msg["pageNumber"] = pageNumber;
            
            var _nc:ConnectionManager = BBB.initConnectionManager();
            _nc.sendMessage("whiteboard.requestAnnotationHistory", 
                function(result:String):void { // On successful result
                    LogUtil.debug(result); 
                },	                   
                function(status:String):void { // status - On error occurred
                    LogUtil.error(status); 
                },
                msg
            );
        }
        
		/**
		 * Sends a TextObject to the Shared Object on the red5 server, and then triggers an update across all clients
		 * @param shape The shape sent to the SharedObject
		 * 
		 */		
		public function sendText(e:WhiteboardDrawEvent):void{
//			LogUtil.debug("Sending [whiteboard.sendAnnotation] (TEXT) to server.");
            var _nc:ConnectionManager = BBB.initConnectionManager();
            _nc.sendMessage("whiteboard.sendAnnotation",               
                function(result:String):void { // On successful result
//                    LogUtil.debug(result); 
                },	                   
                function(status:String):void { // status - On error occurred
                    LogUtil.error(status); 
                },
                e.annotation.annotation
            );
        }		

		/**
		 * Sends a shape to the Shared Object on the red5 server, and then triggers an update across all clients
		 * @param shape The shape sent to the SharedObject
		 * 
		 */		
		public function sendShape(e:WhiteboardDrawEvent):void {
//			LogUtil.debug("Sending [whiteboard.sendAnnotation] (SHAPE) to server.");
            			
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage("whiteboard.sendAnnotation",               
					function(result:String):void { // On successful result
//						LogUtil.debug(result); 
					},	                   
					function(status:String):void { // status - On error occurred
						LogUtil.error(status); 
					},
					e.annotation.annotation
			);
		}
		
		public function checkIsWhiteboardOn():void {
//			LogUtil.debug("Sending [whiteboard.isWhiteboardEnabled] to server.");
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage("whiteboard.isWhiteboardEnabled", 
				function(result:String):void { // On successful result
					LogUtil.debug(result); 
				},	                   
				function(status:String):void { // status - On error occurred
					LogUtil.error(status); 
				}
			);
		}
		
		public function setActivePresentation(e:PresentationEvent):void{
//			LogUtil.debug("Sending [whiteboard.isWhiteboardEnabled] to server.");
			
			var message:Object = new Object();
			message["presentationID"] = e.presentationName;
			message["numberOfSlides"] = e.numberOfPages;
			
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage("whiteboard.setActivePresentation",               
				function(result:String):void { // On successful result
					LogUtil.debug(result); 
				},	                   
				function(status:String):void { // status - On error occurred
					LogUtil.error(status); 
				},
				message
			);
		}
				
	}
}