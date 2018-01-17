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
package org.bigbluebutton.modules.whiteboard.business.shapes {
	import flash.events.Event;
	import flash.events.FocusEvent;
	import flash.events.KeyboardEvent;
	import flash.text.AntiAliasType;
	import flash.text.TextFieldType;
	import flash.text.TextFormat;	
	import org.bigbluebutton.common.IMETextField;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.modules.whiteboard.models.Annotation;
	import org.bigbluebutton.modules.whiteboard.models.AnnotationStatus;
	
	public class TextObject extends IMETextField implements GraphicObject {
		private var _id:String;
		private var _type:String;
		private var _status:String;
		private var _userId:String;
		
		protected var _ao:Object;
		protected var _parentWidth:Number;
		protected var _parentHeight:Number;
		
		private var _editable:Boolean;
		private var _fontSize:Number;
		
		public function TextObject(id:String, type:String, status:String,  userId:String) {
			_id = id;
			_type = type;
			_status = status;
			_userId = userId;
			
			mouseEnabled = false;
			mouseWheelEnabled = false;
			multiline = true;
			wordWrap = true;
			maxChars = 1024;
			
			//determine editability
			makeEditable(userId == UsersUtil.getMyUserID() && status != AnnotationStatus.DRAW_END);
		}
		
		public function get id():String {
			return _id;
		}
		
		public function get toolType():String {
			return _type;
		}
		
		public function get userId():String {
			return _userId;
		}
		
		public function get status():String {
			return _status;
		}
		
		public function get fontSize():Number {
			return _fontSize;
		}
		
		public function get whiteboardId():String {
			return _ao.whiteboardId;
		}
		
		public function denormalize(val:Number, side:Number):Number {
			return (val*side)/100.0;
		}
		
		public function normalize(val:Number, side:Number):Number {
			return (val*100.0)/side;
		}
		
		public function draw(a:Annotation, parentWidth:Number, parentHeight:Number):void {
			_ao = a.annotation;
			_parentWidth = parentWidth;
			_parentHeight = parentHeight;
			_fontSize = _ao.fontSize;
			
			if (_status == AnnotationStatus.DRAW_END) {
				makeEditable(false);
			}
			
			makeGraphic();
		}
	
		public function updateAnnotation(a:Annotation):void {
			_ao = a.annotation;
			_status = _ao.status;
			
			if (_status == AnnotationStatus.DRAW_END) {
				makeEditable(false);
			}
			
			makeGraphic();
		}
		
		public function redraw(parentWidth:Number, parentHeight:Number):void {
			_parentWidth = parentWidth;
			_parentHeight = parentHeight;
			
			makeGraphic();
		}
		
		private function makeGraphic():void {
			x = denormalize(_ao.x, _parentWidth);
			y = denormalize(_ao.y, _parentHeight);
			
			var fontSize:Number = denormalize(_ao.calcedFontSize, _parentHeight);
			applyTextFormat(fontSize);
 
			width = denormalize(_ao.textBoxWidth, _parentWidth);
			height = denormalize(_ao.textBoxHeight, _parentHeight);
			
			if (!_editable) {
				text = _ao.text;
				textColor = _ao.fontColor;
			}
		}
		
		private function applyTextFormat(size:Number):void {
			var tf:TextFormat = new TextFormat();
			tf.size = size;
			tf.font = "arial";
			defaultTextFormat = tf;
			setTextFormat(tf);
		
			if (size < 48) {
				antiAliasType = AntiAliasType.ADVANCED;
			} else {
				antiAliasType = AntiAliasType.NORMAL;
			}
		}
	
		private function makeEditable(editable:Boolean):void {
			if(editable) {
				type = TextFieldType.INPUT;
				background = true;
				border = true;
			} else {
				type = TextFieldType.DYNAMIC;
				background = false;
				border = false;
			}
			_editable = editable;
		}
		
		public function applyNewFormat(fontColor:Number, fontSize:Number):void {
			textColor = fontColor;
			_fontSize = fontSize;
			
			applyTextFormat(fontSize);
		}
		
		public function registerListeners(textObjLostFocus:Function, textObjTextListener:Function, textObjKeyDownListener:Function):void {
			this.addEventListener(FocusEvent.FOCUS_OUT, textObjLostFocus);
			this.addEventListener(Event.CHANGE, textObjTextListener);
			this.addEventListener(KeyboardEvent.KEY_DOWN, textObjKeyDownListener);
		}
		
		public function deregisterListeners(textObjLostFocus:Function, textObjTextListener:Function, textObjKeyDownListener:Function):void {
			this.removeEventListener(FocusEvent.FOCUS_OUT, textObjLostFocus);
			this.removeEventListener(Event.CHANGE, textObjTextListener);
			this.removeEventListener(KeyboardEvent.KEY_DOWN, textObjKeyDownListener);
		}
	}
}
