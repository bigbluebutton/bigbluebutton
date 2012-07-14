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
	import flash.text.AntiAliasType;
	import flash.text.TextField;
	import flash.text.TextFieldType;
	import flash.text.TextFormat;
	
	import flashx.textLayout.edit.SelectionManager;
	
	import flexlib.scheduling.scheduleClasses.utils.Selection;
	
	import mx.controls.Text;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.modules.whiteboard.WhiteboardCanvasModel;

	public class TextObject extends TextField implements GraphicObject {
		public static const TYPE_NOT_EDITABLE:String = "dynamic";
		public static const TYPE_EDITABLE:String = "editable";
		
		public static const TEXT_CREATED:String = "textCreated";
		public static const TEXT_UPDATED:String = "textEdited";
		public static const TEXT_PUBLISHED:String = "textPublished";
		
		public static const TEXT_TOOL:String = "textTool";
		
		/**
		 * Status = [CREATED, UPDATED, PUBLISHED]
		 */
		public var status:String = TEXT_CREATED;

		private var _editable:Boolean;
		
		/**
		 * ID we can use to match the shape in the client's view
		 * so we can use modify it; a unique identifier of each GraphicObject
		 */
		private var ID:String = WhiteboardConstants.ID_UNASSIGNED;
		public var textSize:Number;
		
		public function TextObject(text:String, textColor:uint, bgColor:uint, 
								   bgColorVisible:Boolean, x:Number, y:Number, textSize:Number) {
			this.text = text;
			this.textColor = textColor;
			this.backgroundColor = bgColor;
			this.background = bgColorVisible;
			this.x = x;
			this.y = y;
			this.textSize = textSize;
		}	
		
		public function getGraphicType():String {
			return WhiteboardConstants.TYPE_TEXT;
		}
		
		public function getGraphicID():String {
			return ID;
		}
		
		public function setGraphicID(id:String):void {
			this.ID = id;
		}
		
		public function denormalize(val:Number, side:Number):Number {
			return (val*side)/100.0;
		}
		
		public function normalize(val:Number, side:Number):Number {
			return (val*100.0)/side;
		}
		
		public function applyTextFormat(size:Number):void {
			this.textSize = size;
			var tf:TextFormat = new TextFormat();
			tf.size = size;
			tf.font = "arial";
			this.setTextFormat(tf);
		}
		
		public function makeGraphic(parentWidth:Number, parentHeight:Number):void {
			var startX:Number = denormalize(this.x, parentWidth);
			var startY:Number = denormalize(this.y, parentHeight);
			//LogUtil.error("denorms: " + startX + "," + startY);
			this.x = startX;
			this.y = startY;
			this.antiAliasType = AntiAliasType.ADVANCED;
			//var  format:TextFormat = new TextFormat();
			//format.color = this.textColor;
			//format.
		}	
		
		public function getProperties():Array {
			var props:Array = new Array();
			props.push(this.text);
			props.push(this.textColor);
			props.push(this.backgroundColor);
			props.push(this.background);
			props.push(this.x);
			props.push(this.y);
			return props;
		}
		
		public function makeEditable(editable:Boolean):void {
			if(editable) {
				this.type = TextFieldType.INPUT;
			} else {
				this.type = TextFieldType.DYNAMIC;
			}
			this._editable = editable;
		}
		
		public function registerListeners(textObjGainedFocus:Function,
										  textObjLostFocus:Function,
										  textObjTextListener:Function,
										  textObjDeleteListener:Function):void {
											  
			this.addEventListener(FocusEvent.FOCUS_IN, textObjGainedFocus);
			this.addEventListener(FocusEvent.FOCUS_OUT, textObjLostFocus);
			this.addEventListener(TextEvent.TEXT_INPUT, textObjTextListener);
			this.addEventListener(KeyboardEvent.KEY_DOWN, textObjDeleteListener);
		}		
		
		public function deregisterListeners(textObjGainedFocus:Function,
											textObjLostFocus:Function,
											textObjTextListener:Function,
											textObjDeleteListener:Function):void {
			
			this.removeEventListener(FocusEvent.FOCUS_IN, textObjGainedFocus);
			this.removeEventListener(FocusEvent.FOCUS_OUT, textObjLostFocus);
			this.removeEventListener(TextEvent.TEXT_INPUT, textObjTextListener);
			this.removeEventListener(KeyboardEvent.KEY_DOWN, textObjDeleteListener);
		}
	}
}