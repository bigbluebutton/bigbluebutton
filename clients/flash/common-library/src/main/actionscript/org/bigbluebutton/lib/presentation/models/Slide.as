package org.bigbluebutton.lib.presentation.models {
	
	import flash.utils.ByteArray;
	
	import mx.controls.SWFLoader;
	
	import org.bigbluebutton.lib.whiteboard.models.IAnnotation;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class Slide {
		public var loadRequested:Boolean = false;
		
		private var _loaded:Boolean = false;
		
		private var _id:String;
		
		private var _slideURI:String;
		
		private var _slideNum:Number;
		
		private var _thumbURI:String;
		
		private var _txtURI:String;
		
		private var _current:Boolean;
		
		private var _data:ByteArray;
		
		private var _swfFile:SWFLoader = new SWFLoader();
		
		private var _annotations:Array = [];
		
		private var _x:Number = 0;
		
		private var _y:Number = 0;
		
		private var _widthPercent:Number = 100;
		
		private var _heightPercent:Number = 100;
		
		private var _sizeSynced:Boolean = false;
		
		private var _slideLoadedSignal:ISignal = new Signal;
		
		public function Slide(id:String, slideNum:Number, slideURI:String, thumbURI:String, txtURI:String, current:Boolean, x:Number, y:Number, widthPercent:Number, heightPercent:Number) {
			_id = id;
			_slideNum = slideNum;
			_slideURI = slideURI;
			_thumbURI = thumbURI;
			_txtURI = txtURI;
			_current = current;
			_x = x;
			_y = y;
			_widthPercent = widthPercent;
			_heightPercent = heightPercent;
			_sizeSynced = true;
		}
		
		public function get id():String {
			return _id;
		}
		
		public function get thumb():String {
			return _thumbURI;
		}
		
		public function get slideNumber():Number {
			return _slideNum;
		}
		
		public function get data():ByteArray {
			return _data;
		}
		
		public function set data(d:ByteArray):void {
			_data = d;
			if (_data != null) {
				_loaded = true;
				slideLoadedSignal.dispatch();
			}
		}
		
		public function set swfSource(source:Object):void {
			_swfFile.source = source;
			if (_swfFile.source != null) {
				_loaded = true;
				slideLoadedSignal.dispatch();
			}
		}
		
		public function get SWFFile():SWFLoader {
			return _swfFile;
		}
		
		public function get slideURI():String {
			return _slideURI;
		}
		
		public function get loaded():Boolean {
			return _loaded;
		}
		
		public function get slideLoadedSignal():ISignal {
			return _slideLoadedSignal;
		}
		
		public function set current(b:Boolean):void {
			_current = b;
		}
		
		public function get current():Boolean {
			return _current;
		}
		
		public function get annotations():Array {
			return _annotations;
		}
		
		public function get x():Number {
			return _x;
		}
		
		public function get y():Number {
			return _y;
		}
		
		public function get widthPercent():Number {
			return _widthPercent;
		}
		
		public function get heightPercent():Number {
			return _heightPercent;
		}
		
		public function get sizeSynced():Boolean {
			return _sizeSynced;
		}
		
		public function addAnnotation(annotation:IAnnotation):void {
			trace("adding a new annotation");
			_annotations.push(annotation);
		}
		
		public function updateAnnotation(annotation:IAnnotation):IAnnotation {
			for (var i:int = 0; i < _annotations.length; i++) {
				if ((_annotations[i] as IAnnotation).anID == annotation.anID) {
					_annotations[i].update(annotation);
					trace("updating an existing annotation");
					return _annotations[i];
				}
			}
			// if the annotation can't be found then add it instead
			addAnnotation(annotation);
			return annotation;
		}
		
		public function undoAnnotation():IAnnotation {
			if (_annotations.length > 0) {
				return _annotations.pop();
			}
			return null;
		}
		
		public function clearAnnotations():void {
			while (_annotations.length > 0) {
				_annotations.pop();
			}
		}
		
		public function setViewedRegion(x:Number, y:Number, widthPercent:Number, heightPercent:Number):void {
			_x = x;
			_y = y;
			_widthPercent = widthPercent;
			_heightPercent = heightPercent;
			_sizeSynced = true;
		}
	}
}
