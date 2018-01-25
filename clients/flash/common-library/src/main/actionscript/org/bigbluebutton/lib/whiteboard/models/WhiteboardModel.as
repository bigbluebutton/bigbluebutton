package org.bigbluebutton.lib.whiteboard.models {
	import org.bigbluebutton.lib.whiteboard.commands.GetWhiteboardHistorySignal;
	
	public class WhiteboardModel implements IWhiteboardModel {
		
		[Inject]
		public var getWhiteboardHistorySignal:GetWhiteboardHistorySignal;
		
		private var _whiteboards:Object = new Object();
		
		public function getWhiteboard(wbId:String, requestHistory:Boolean = true):Whiteboard {
			var wb:Whiteboard;
			
			if (_whiteboards.propertyIsEnumerable(wbId)) {
				return _whiteboards[wbId];
			}
			
			wb = new Whiteboard(wbId);
			_whiteboards[wbId] = wb;
			
			if (requestHistory) {
				getWhiteboardHistorySignal.dispatch(wbId);
			}
			
			return wb;
		}
		
		public function addAnnotation(wbId:String, annotation:Annotation):void {
			var wb:Whiteboard = getWhiteboard(wbId);
			if (annotation.status == AnnotationStatus.DRAW_START || annotation.type == AnnotationType.POLL) {
				wb.addAnnotation(annotation);
			} else {
				wb.updateAnnotation(annotation);
			}
		}
		
		public function addAnnotationFromHistory(wbId:String, annotations:Array):void {
			var wb:Whiteboard = getWhiteboard(wbId, false);
			if (wb != null && !wb.historyLoaded) {
				if (annotations.length > 0) {
					for (var i:int = 0; i < annotations.length; i++) {
						var an:Annotation = annotations[i] as Annotation;
						wb.addAnnotationAt(an, i);
					}
				}
				
				wb.historyLoaded = true;
			}
		}
		
		public function removeAnnotation(wbId:String, shapeId:String):void {
			var wb:Whiteboard = getWhiteboard(wbId);
			if (wb != null) {
				wb.undo(shapeId);
			}
		}
		
		public function getAnnotations(wbId:String):Array {
			var wb:Whiteboard = getWhiteboard(wbId);
			if (wb != null) {
				return wb.getAnnotations();
			}
			// Just return an empty array.
			return new Array();
		}
		
		public function clear(wbId:String, fullClear:Boolean, userId:String):void {
			var wb:Whiteboard = getWhiteboard(wbId);
			if (wb != null) {
				if (fullClear) {
					wb.clearAll();
				} else {
					wb.clear(userId);
				}
			}
		}
		
		public function accessModified(wbId:String, multiUser:Boolean):void {
			var wb:Whiteboard = getWhiteboard(wbId);
			wb.multiUser = multiUser;
		}
		
		public function getMultiUser(wbId:String):Boolean {
			var wb:Whiteboard = getWhiteboard(wbId);
			return wb.multiUser;
		}
		
		public function updateCursorPosition(wbId:String, userId:String, x:Number, y:Number):void {
			var wb:Whiteboard = getWhiteboard(wbId);
			wb.cursorChange(userId, x, y);
		}
	}
}
