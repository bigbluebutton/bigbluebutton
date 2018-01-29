package org.bigbluebutton.lib.whiteboard.views {
	
	import mx.utils.StringUtil;
	
	import org.bigbluebutton.lib.main.models.IMeetingData;
	import org.bigbluebutton.lib.user.models.User2x;
	import org.bigbluebutton.lib.user.models.UserChangeEnum;
	import org.bigbluebutton.lib.whiteboard.models.Annotation;
	import org.bigbluebutton.lib.whiteboard.models.IWhiteboardModel;
	import org.bigbluebutton.lib.whiteboard.models.Whiteboard;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class WhiteboardCanvasMediator extends Mediator {
		
		[Inject]
		public var view:WhiteboardCanvas;
		
		[Inject]
		public var _whiteboardModel:IWhiteboardModel;
		
		[Inject]
		public var _meetingData:IMeetingData;
		
		private var _whiteboard:Whiteboard;
		
		private var _cursors:Object = new Object();
		
		private var _presenterId:String;
		
		override public function initialize():void {
			view.resizeCallback = onWhiteboardResize;
			view.whiteboardChangeCallback = onWhiteboardChange;
			
			var presenter:User2x = _meetingData.users.getPresenter();
			_presenterId = (presenter ? presenter.intId : "");
			_meetingData.users.userChangeSignal.add(userChangeHandler);
		}
		
		private function userChangeHandler(user:User2x, type:int):void {
			switch (type) {
				case UserChangeEnum.PRESENTER:
					if (user.presenter) {
						_presenterId = user.intId;
					}
					
					var showName:Boolean = _whiteboard.multiUser;
					for (var key:String in _cursors) {
						(_cursors[key] as WhiteboardCursor).updatePresenter(key == _presenterId, showName);
					}
					break;
				case UserChangeEnum.LEAVE:
					if (_cursors.hasOwnProperty(user.intId)) {
						view.cursorHolder.removeChild(_cursors[user.intId]);
						delete _cursors[user.intId];
					}
					break;
			}
		}
		
		private function annotationHistoryHandler():void {
			drawAllAnnotations();
		}
		
		private function annotationAddedHandler(annotation:Annotation):void {
			annotation.draw(view.annotationHolder);
		}
		
		private function annotationUndoHandler(annotation:Annotation):void {
			annotation.remove(view.annotationHolder);
		}
		
		private function annotationClearHandler(fullClear:Boolean, removedAnnotations:Array):void {
			if (fullClear) {
				removeAllAnnotations();
			} else {
				for each (var annotation:Annotation in removedAnnotations) {
					annotation.remove(view.annotationHolder);
				}
			}
		}
		
		private function onWhiteboardChange(wbId:String):void {
			trace("Whiteboard Change Requested");
			removeAllAnnotations();
			removeWhiteboardListeners();
			if (wbId != null && wbId != "") {
				_whiteboard = _whiteboardModel.getWhiteboard(wbId);
				addWhiteboardListeners();
				drawAllAnnotations();
			}
			
			removeAllCursors();
		}
		
		private function onWhiteboardResize():void {
			drawAllAnnotations();
			repositionCursors();
		}
		
		private function drawAllAnnotations():void {
			trace("++ draw draw Draw");
			var annotations:Array = _whiteboard.getAnnotations();
			for (var i:int = 0; i < annotations.length; i++) {
				var an:Annotation = annotations[i] as Annotation;
				an.draw(view.annotationHolder);
			}
		}
		
		private function removeAllAnnotations():void {
			view.annotationHolder.removeAllElements();
			if (_whiteboard) {
				var annotations:Array = _whiteboard.getAnnotations();
				for (var i:int = 0; i < annotations.length; i++) {
					var an:Annotation = annotations[i] as Annotation;
					an.remove(view);
				}
			}
		}
		
		private function cursorChangeHandler(userId:String, x:Number, y:Number):void {
			var showName:Boolean = _whiteboard.multiUser;
			
			if (!_cursors.hasOwnProperty(userId)) {
				var user:User2x = _meetingData.users.getUser(userId);
				if (user) {
					var newCursor:WhiteboardCursor = new WhiteboardCursor(userId, user.name, x, y, view.cursorHolder.width, view.cursorHolder.height, _presenterId == userId, showName);
					view.cursorHolder.addChild(newCursor);
					
					_cursors[userId] = newCursor;
				}
			} else {
				(_cursors[userId] as WhiteboardCursor).updatePosition(x, y, showName);
			}
		}
		
		private function removeAllCursors():void {
			view.cursorHolder.removeChildren();
			_cursors = new Object();
		}
		
		private function repositionCursors():void {
			var w:Number = view.cursorHolder.width;
			var h:Number = view.cursorHolder.height;
			
			for each (var cursor:WhiteboardCursor in _cursors) {
				cursor.updateParentSize(w, h);
			}
		}
		
		private function multiUserChangeHandler(multiUser:Boolean):void {
			trace("TODO: Need to turn off names of cursors and hide non-presenters");
		}
		
		private function addWhiteboardListeners():void {
			if (_whiteboard != null) {
				_whiteboard.annotationHistorySignal.add(annotationHistoryHandler);
				_whiteboard.annotationAddedSignal.add(annotationAddedHandler);
				_whiteboard.annotationUndoSignal.add(annotationUndoHandler);
				_whiteboard.annotationClearSignal.add(annotationClearHandler);
				_whiteboard.cursorChangeSignal.add(cursorChangeHandler);
				_whiteboard.multiUserChangeSignal.add(multiUserChangeHandler);
			}
		}
		
		private function removeWhiteboardListeners():void {
			if (_whiteboard != null) {
				_whiteboard.annotationHistorySignal.remove(annotationHistoryHandler);
				_whiteboard.annotationAddedSignal.remove(annotationAddedHandler);
				_whiteboard.annotationUndoSignal.remove(annotationUndoHandler);
				_whiteboard.annotationClearSignal.remove(annotationClearHandler);
				_whiteboard.cursorChangeSignal.remove(cursorChangeHandler);
				_whiteboard.multiUserChangeSignal.remove(multiUserChangeHandler);
			}
		}
		
		override public function destroy():void {
			removeAllAnnotations();
			removeAllCursors();
			removeWhiteboardListeners();
			_meetingData.users.userChangeSignal.remove(userChangeHandler);
			_whiteboard = null;
			super.destroy();
			view = null;
		}
	}
}
