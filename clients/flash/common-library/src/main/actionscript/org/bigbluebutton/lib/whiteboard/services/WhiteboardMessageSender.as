package org.bigbluebutton.lib.whiteboard.services {
	import org.bigbluebutton.lib.main.models.IUserSession;
	
	public class WhiteboardMessageSender {
		private static var LOG:String = "WhiteboardMessageSender - ";
		
		private var userSession:IUserSession;
		
		public function WhiteboardMessageSender(userSession:IUserSession) {
			this.userSession = userSession;
		}
		
		public function changePage(pageNum:Number):void {
			//			LogUtil.debug("Sending [whiteboard.setActivePage] to server.");
		/*
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
		 */
		}
		
		/*
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
		 */
		/*
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
		 */
		public function undoGraphic():void {
			//			LogUtil.debug("Sending [whiteboard.undo] to server.");
		/*
		   var _nc:ConnectionManager = BBB.initConnectionManager();
		   _nc.sendMessage("whiteboard.undo",
		   function(result:String):void { // On successful result
		   LogUtil.debug(result);
		   },
		   function(status:String):void { // status - On error occurred
		   LogUtil.error(status);
		   }
		   );
		 */
		}
		
		public function clearBoard():void {
			//			LogUtil.debug("Sending [whiteboard.clear] to server.");
		/*
		   var _nc:ConnectionManager = BBB.initConnectionManager();
		   _nc.sendMessage("whiteboard.clear",
		   function(result:String):void { // On successful result
		   LogUtil.debug(result);
		   },
		   function(status:String):void { // status - On error occurred
		   LogUtil.error(status);
		   }
		   );
		 */
		}
		
		public function requestAnnotationHistory(whiteboardID:String):void {
			trace("Sending [whiteboard.requestAnnotationHistory] to server.");
			var msg:Object = new Object();
			msg["whiteboardId"] = whiteboardID;
			userSession.mainConnection.sendMessage("whiteboard.requestAnnotationHistory", function(result:String):void { // On successful result
				trace(result);
			}, function(status:String):void { // status - On error occurred
				trace(status);
			}, msg);
		}
		
		public function sendText():void {
			//			LogUtil.debug("Sending [whiteboard.sendAnnotation] (TEXT) to server.");
		/*
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
		 */
		}
		
		public function sendShape():void {
			//			LogUtil.debug("Sending [whiteboard.sendAnnotation] (SHAPE) to server.");
		/*
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
		 */
		}
		
		/*
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
		 */
		public function setActivePresentation():void {
			//			LogUtil.debug("Sending [whiteboard.isWhiteboardEnabled] to server.");
		/*
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
		 */
		}
	}
}
