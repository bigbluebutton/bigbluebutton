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
		public function changePage(e:PageEvent):void{
			LogUtil.debug("Sending [whiteboard.setActivePage] to server.");
			var message:Object = new Object();
			message["pageNum"] = e.pageNum;
			
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
			LogUtil.debug("Sending [whiteboard.enableWhiteboard] to server.");
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
			LogUtil.debug("Sending [whiteboard.toggleGrid] to server.");
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
			LogUtil.debug("Sending [whiteboard.undo] to server.");
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
			LogUtil.debug("Sending [whiteboard.clear] to server.");
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

        public function requestAnnotationHistory():void{
            LogUtil.debug("Sending [whiteboard.requestAnnotationHistory] to server.");
            var _nc:ConnectionManager = BBB.initConnectionManager();
            _nc.sendMessage("whiteboard.requestAnnotationHistory", 
                function(result:String):void { // On successful result
                    LogUtil.debug(result); 
                },	                   
                function(status:String):void { // status - On error occurred
                    LogUtil.error(status); 
                }
            );
        }
        
		/**
		 * Sends a TextObject to the Shared Object on the red5 server, and then triggers an update across all clients
		 * @param shape The shape sent to the SharedObject
		 * 
		 */		
		public function sendText(e:WhiteboardDrawEvent):void{
			LogUtil.debug("Sending [whiteboard.sendAnnotation] (TEXT) to server.");
/*			var tobj:TextObject = e.message as TextObject;
			
			var annotation:Object = new Object();
			annotation["type"] = "text";
			annotation["id"] = tobj.getGraphicID();
			annotation["status"] = tobj.status;  
			annotation["text"] = tobj.text;
			annotation["fontColor"] = tobj.textColor;
			annotation["backgroundColor"] = tobj.backgroundColor;
			annotation["background"] = tobj.background;
			annotation["x"] = tobj.getOrigX();
			annotation["y"] = tobj.getOrigY();
			annotation["fontSize"] = tobj.textSize;
			
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage("whiteboard.sendAnnotation", 
				function(result:String):void { // On successful result
					LogUtil.debug(result); 
				},	                   
				function(status:String):void { // status - On error occurred
					LogUtil.error(status); 
				},
				annotation
			);
*/		}		

		/**
		 * Sends a shape to the Shared Object on the red5 server, and then triggers an update across all clients
		 * @param shape The shape sent to the SharedObject
		 * 
		 */		
		public function sendShape(e:WhiteboardDrawEvent):void {
			LogUtil.debug("Sending [whiteboard.sendAnnotation] (SHAPE) to server.");
/*			var shape:DrawObject = e.message as DrawObject;
			
			var annotation:Object = new Object();
			annotation["type"] = shape.getType();
			annotation["points"] = shape.getShapeArray();
			annotation["color"] = shape.getColor();
			annotation["thickness"] = shape.getThickness();
			annotation["id"] = shape.getGraphicID();
			annotation["status"] = shape.status;
			annotation["fill"] = shape.getFill();
			annotation["fillColor"] = shape.getFillColor();
			annotation["transparency"] = shape.getTransparency();
			
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage("whiteboard.sendAnnotation",               
					function(result:String):void { // On successful result
						LogUtil.debug(result); 
					},	                   
					function(status:String):void { // status - On error occurred
						LogUtil.error(status); 
					},
					annotation
			);
*/		}
		
		public function checkIsWhiteboardOn():void {
			LogUtil.debug("Sending [whiteboard.isWhiteboardEnabled] to server.");
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
			LogUtil.debug("Sending [whiteboard.isWhiteboardEnabled] to server.");
			
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