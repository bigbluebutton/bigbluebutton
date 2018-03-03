package org.bigbluebutton.air.whiteboard.services {
	import org.bigbluebutton.air.common.models.IMessageListener;
	import org.bigbluebutton.air.whiteboard.models.Annotation;
	import org.bigbluebutton.air.whiteboard.models.IWhiteboardModel;
	import org.bigbluebutton.air.whiteboard.util.AnnotationUtil;
	
	public class WhiteboardMessageReceiver implements IMessageListener {
		private static var LOG:String = "WhiteboardMessageReciever - ";
		
		private var _whiteboardModel:IWhiteboardModel;
		
		public function WhiteboardMessageReceiver(whiteboardModel:IWhiteboardModel) {
			_whiteboardModel = whiteboardModel;
		}
		
		public function onMessage(messageName:String, message:Object):void {
			// LogUtil.debug("WB: received message " + messageName);
			switch (messageName) {
				case "GetWhiteboardAnnotationsRespMsg":
					handleGetWhiteboardAnnotationsRespMsg(message);
					break;
				case "ModifyWhiteboardAccessEvtMsg":
					handleModifyWhiteboardAccessEvtMsg(message);
					break;
				case "SendWhiteboardAnnotationEvtMsg":
					handleSendWhiteboardAnnotationEvtMsg(message);
					break;
				case "ClearWhiteboardEvtMsg":
					handleClearWhiteboardEvtMsg(message);
					break;
				case "UndoWhiteboardEvtMsg":
					handleUndoWhiteboardEvtMsg(message);
					break;
				case "SendCursorPositionEvtMsg":
					handleSendCursorPositionEvtMsg(message);
					break;
				default:
					//          LogUtil.warn("Cannot handle message [" + messageName + "]");
			}
		}
		
		private function handleGetWhiteboardAnnotationsRespMsg(message:Object):void {
			var whiteboardId:String = message.body.whiteboardId;
			var multiUser:Boolean = message.body.multiUser as Boolean;
			var annotations:Array = message.body.annotations as Array;
			var tempAnnotations:Array = new Array();
			
			for (var i:int = 0; i < annotations.length; i++) {
				var processedAnnotation:Annotation = AnnotationUtil.createAnnotation(annotations[i]);
				if (processedAnnotation != null) {
					tempAnnotations.push(processedAnnotation);
				}
			}
			
			_whiteboardModel.addAnnotationFromHistory(whiteboardId, tempAnnotations);
			_whiteboardModel.accessModified(whiteboardId, multiUser);
		}
		
		private function handleModifyWhiteboardAccessEvtMsg(message:Object):void {
			_whiteboardModel.accessModified(message.body.whiteboardId, message.body.multiUser);
		}
		
		private function handleSendWhiteboardAnnotationEvtMsg(message:Object):void {
			var receivedAnnotation:Object = message.body.annotation;
			var processedAnnotation:Annotation = AnnotationUtil.createAnnotation(receivedAnnotation);
			if (processedAnnotation != null) {
				_whiteboardModel.addAnnotation(receivedAnnotation.wbId, processedAnnotation);
			}
		}
		
		private function handleClearWhiteboardEvtMsg(message:Object):void {
			if (message.body.hasOwnProperty("whiteboardId") && message.body.hasOwnProperty("fullClear") && message.body.hasOwnProperty("userId")) {
				_whiteboardModel.clear(message.body.whiteboardId, message.body.fullClear, message.body.userId);
			}
		}
		
		private function handleUndoWhiteboardEvtMsg(message:Object):void {
			if (message.body.hasOwnProperty("whiteboardId") && message.body.hasOwnProperty("annotationId")) {
				_whiteboardModel.removeAnnotation(message.body.whiteboardId, message.body.annotationId);
			}
		}
		
		private function handleSendCursorPositionEvtMsg(message:Object):void {
			var userId:String = message.header.userId as String;
			var whiteboardId:String = message.body.whiteboardId as String;
			var xPercent:Number = message.body.xPercent as Number;
			var yPercent:Number = message.body.yPercent as Number;
			
			_whiteboardModel.updateCursorPosition(whiteboardId, userId, xPercent, yPercent);
		}
	}
}
