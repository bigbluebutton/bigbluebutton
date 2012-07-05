/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 2.1 of the License, or (at your option) any later
 * version.
 *
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 * 
 * Author: Ajay Gopinath <ajgopi124@gmail.com>
 */
package org.bigbluebutton.modules.whiteboard.business.shapes
{
	import com.asfusion.mate.core.GlobalDispatcher;
	
	import flash.display.DisplayObject;
	import flash.display.Shape;
	import flash.display.Stage;
	import flash.events.Event;
	import flash.events.FocusEvent;
	import flash.events.KeyboardEvent;
	import flash.events.MouseEvent;
	import flash.events.TextEvent;
	import flash.text.TextField;
	import flash.text.TextFieldType;
	
	import flashx.textLayout.edit.SelectionManager;
	
	import flexlib.scheduling.scheduleClasses.utils.Selection;
	
	import mx.controls.Text;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.modules.whiteboard.WhiteboardCanvasModel;

	public class TextObject extends GraphicObject {
		public static const TYPE_NOT_EDITABLE:String = "dynamic";
		public static const TYPE_EDITABLE:String = "editable";
		
		public static const TEXT_CREATED:String = "textCreated";
		public static const TEXT_UPDATED:String = "textEdited";
		public static const TEXT_PUBLISHED:String = "textPublished";
		
		public static const TEXT_TOOL:String = "textTool";
		
		public var status:String = TEXT_CREATED;
		public var type:String = TYPE_NOT_EDITABLE;
		
		public var text:String;
		public var textColor:uint;
		public var bgColor:uint;
		public var bgColorVisible:Boolean;
		public var x:Number;
		public var y:Number;
		
		
		private var _editable:Boolean;
		private var _textField:TextField;
		
		public function TextObject() {
			super(GraphicObject.TYPE_TEXT);
		}
		
		public function getTF():TextField {
			return _textField;
		}
		
		override public function getGraphic():DisplayObject {
			return _textField;
		}
			
		override public function makeGraphic(parentWidth:Number, parentHeight:Number):void {
			var startX:Number = denormalize(x, parentWidth);
			var startY:Number = denormalize(y, parentHeight);
			//LogUtil.error("denorms: " + startX + "," + startY);
			_textField = new TextField();
			_textField.x = startX;
			_textField.y = startY;
			x = startX;
			y = startY;
			if(bgColorVisible) {
				_textField.background = true;
				_textField.backgroundColor = bgColor;
			}
			_textField.text = text;
			_textField.textColor = textColor;
		}	
		
		public function makeEditable(editable:Boolean):void {
			if(editable) {
				this.type = TYPE_EDITABLE;
				_textField.type = TextFieldType.INPUT;
			} else {
				this.type = TYPE_NOT_EDITABLE;
				_textField.type = TextFieldType.DYNAMIC;
			}
			this._editable = editable;
		}
		
		public function registerListeners(textObjGainedFocus:Function,
										  textObjLostFocus:Function,
										  textObjTextListener:Function,
										  textObjDeleteListener:Function):void {
											  
			_textField.addEventListener(FocusEvent.FOCUS_IN, textObjGainedFocus);
			_textField.addEventListener(FocusEvent.FOCUS_IN, textObjSelected);
			_textField.addEventListener(FocusEvent.FOCUS_OUT, textObjLostFocus);
			_textField.addEventListener(TextEvent.TEXT_INPUT, textObjTextListener);
			_textField.addEventListener(KeyboardEvent.KEY_DOWN, textObjDeleteListener);
		}		
		
		public function deregisterListeners(textObjGainedFocus:Function,
											textObjLostFocus:Function,
											textObjTextListener:Function,
											textObjDeleteListener:Function):void {
			
			_textField.removeEventListener(FocusEvent.FOCUS_IN, textObjGainedFocus);
			_textField.removeEventListener(FocusEvent.FOCUS_IN, textObjSelected);
			_textField.removeEventListener(FocusEvent.FOCUS_OUT, textObjLostFocus);
			_textField.removeEventListener(TextEvent.TEXT_INPUT, textObjTextListener);
			_textField.removeEventListener(KeyboardEvent.KEY_DOWN, textObjDeleteListener);
		}
		
		public function textObjSelected(event:FocusEvent):void {
			WhiteboardCanvasModel.SELECTED_OBJECT = this;
		}
		
	}
}