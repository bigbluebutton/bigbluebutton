package org.bigbluebutton.air.whiteboard.models {
	import mx.collections.ArrayCollection;
	
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class Whiteboard {
		private var _id:String;
		
		private var _historyLoaded:Boolean = false;
		
		private var _annotations:ArrayCollection = new ArrayCollection();
		
		private var _annotationsMap:Object = new Object();
		
		private var _multiUser:Boolean = false;
		
		private var _annotationHistorySignal:ISignal = new Signal();
		
		private var _annotationAddedSignal:ISignal = new Signal();
		
		private var _annotationUndoSignal:ISignal = new Signal();
		
		private var _annotationClearSignal:ISignal = new Signal();
		
		private var _cursorChangeSignal:ISignal = new Signal();
		
		private var _multiUserChangeSignal:ISignal = new Signal();
		
		public function Whiteboard(id:String) {
			_id = id;
		}
		
		public function get id():String {
			return _id;
		}
		
		public function get historyLoaded():Boolean {
			return _historyLoaded;
		}
		
		public function set historyLoaded(v:Boolean):void {
			_historyLoaded = v;
			_annotationHistorySignal.dispatch();
		}
		
		public function get multiUser():Boolean {
			return _multiUser;
		}
		
		public function set multiUser(v:Boolean):void {
			_multiUser = v;
			_multiUserChangeSignal.dispatch(v);
		}
		
		public function addAnnotation(annotation:Annotation):void {
			_annotations.addItem(annotation);
			_annotationsMap[annotation.id] = annotation;
			
			_annotationAddedSignal.dispatch(annotation);
		}
		
		public function addAnnotationAt(annotation:Annotation, index:int, notify:Boolean = false):void {
			_annotations.addItemAt(annotation, index);
			_annotationsMap[annotation.id] = annotation;
		}
		
		public function updateAnnotation(annotation:Annotation):void {
			var a:Annotation = getAnnotation(annotation.id);
			if (a != null) {
				a.update(annotation);
			} else {
				addAnnotation(annotation);
			}
		}
		
		public function undo(id:String):void {
			if (_annotationsMap.propertyIsEnumerable(id)) {
				var annotation:Annotation = _annotationsMap[id];
				delete _annotationsMap[id];
				_annotations.removeItem(annotation);
				_annotationUndoSignal.dispatch(annotation);
			}
		}
		
		public function clearAll():void {
			_annotations.removeAll();
			_annotationsMap = new Object();
			_annotationClearSignal.dispatch(true, []);
		}
		
		public function clear(userId:String):void {
			var removedAnnotations:Array = [];
			for each (var annotation:Annotation in _annotationsMap) {
				if (annotation.userId == userId) {
					delete _annotationsMap[annotation.id]
					_annotations.removeItem(annotation);
					
					removedAnnotations.push(annotation);
				}
			}
			_annotationClearSignal.dispatch(false, removedAnnotations);
		}
		
		public function getAnnotations():Array {
			return _annotations.toArray();
		}
		
		public function getAnnotation(id:String):Annotation {
			if (_annotationsMap.propertyIsEnumerable(id)) {
				return _annotationsMap[id];
			} else {
				return null;
			}
		}
		
		public function cursorChange(userId:String, x:Number, y:Number):void {
			_cursorChangeSignal.dispatch(userId, x, y);
		}
		
		public function get annotationHistorySignal():ISignal {
			return _annotationHistorySignal;
		}
		
		public function get annotationAddedSignal():ISignal {
			return _annotationAddedSignal;
		}
		
		public function get annotationUndoSignal():ISignal {
			return _annotationUndoSignal;
		}
		
		public function get annotationClearSignal():ISignal {
			return _annotationClearSignal;
		}
		
		public function get cursorChangeSignal():ISignal {
			return _cursorChangeSignal;
		}
		
		public function get multiUserChangeSignal():ISignal {
			return _multiUserChangeSignal;
		}
	}
}
