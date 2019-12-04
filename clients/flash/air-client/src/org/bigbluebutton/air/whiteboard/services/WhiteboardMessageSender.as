package org.bigbluebutton.air.whiteboard.services {
	import org.bigbluebutton.air.main.models.IConferenceParameters;
	import org.bigbluebutton.air.main.models.IUserSession;
	
	public class WhiteboardMessageSender {
		private static var LOG:String = "WhiteboardMessageSender - ";
		
		private var _userSession:IUserSession;
		
		private var _conferenceParameters:IConferenceParameters;
		
		public function WhiteboardMessageSender(userSession:IUserSession, conferenceParameters:IConferenceParameters) {
			_userSession = userSession;
			_conferenceParameters = conferenceParameters;
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
		
		public function requestAnnotationHistory(whiteboardId:String):void {
			trace(LOG + "requestAnnotationHistory() -- Sending [GetWhiteboardAnnotationsReqMsg] message to server");
			
			var message:Object = {
				header: {name: "GetWhiteboardAnnotationsReqMsg", meetingId: _conferenceParameters.meetingID, userId: _conferenceParameters.internalUserID},
				body: {whiteboardId: whiteboardId}
			};
			_userSession.mainConnection.sendMessage2x(function(result:String):void { // On successful result
				trace(result);
			}, function(status:String):void { // status - On error occurred
				trace(status);
			}, message);
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
	}
}
