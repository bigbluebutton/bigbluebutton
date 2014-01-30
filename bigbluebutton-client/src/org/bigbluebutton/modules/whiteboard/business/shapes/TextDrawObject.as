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
    import org.bigbluebutton.modules.whiteboard.models.Annotation;
    
    public class TextDrawObject extends DrawObject implements GraphicObject {
        public static const TYPE_NOT_EDITABLE:String = "dynamic";
        public static const TYPE_EDITABLE:String = "editable";
        
        public static const TEXT_CREATED:String = "textCreated";
        public static const TEXT_UPDATED:String = "textEdited";
        public static const TEXT_PUBLISHED:String = "textPublished";
        
        public static const TEXT_TOOL:String = "textTool";
        
        private var _editable:Boolean;
        
        private var _type:String = DrawObject.TEXT;
        
        
        private var _origParentWidth:Number = 0;
        private var _origParentHeight:Number = 0;
        
        private var _textField:TextField = new TextField();
        
        public function TextDrawObject(id:String, type:String, status:String) {
            super(id, type, status);
            
            addChild(_textField);
        }	
        
        public function get origParentWidth():Number {
            return _origParentWidth;
        }
        
        public function get origParentHeight():Number {
            return _origParentHeight;
        }
        
        public function get textField():TextField {
            return _textField;
        }
        
        override public function draw(a:Annotation, parentWidth:Number, parentHeight:Number, zoom:Number):void {
            LogUtil.debug("Drawing TEXT");
            
            this.x = denormalize(a.annotation.x, parentWidth);
            this.y = denormalize(a.annotation.y, parentHeight);
            
            var newFontSize:Number = a.annotation.fontSize;
            
            if (_origParentHeight == 0 && _origParentWidth == 0) {
                // LogUtil.debug("Old parent dim [" + _origParentWidth + "," + _origParentHeight + "]");
                newFontSize = a.annotation.fontSize;
                _origParentHeight = parentHeight;
                _origParentWidth = parentWidth;               
            } else {
                newFontSize = (parentHeight/_origParentHeight) * a.annotation.fontSize;
                // LogUtil.debug("2 Old parent dim [" + _origParentWidth + "," + _origParentHeight + "] newFontSize=" + newFontSize);
            }     
            
            _textField.text = a.annotation.text;
            _textField.antiAliasType = AntiAliasType.ADVANCED;
            var format:TextFormat = new TextFormat();
            format.size = newFontSize;
            format.font = "arial";
            _textField.defaultTextFormat = format;
            _textField.setTextFormat(format);
            
            this.width = denormalize(a.annotation.textBoxWidth, parentWidth);
            this.height = denormalize(a.annotation.textBoxHeight, parentHeight);
            
            LogUtil.debug("2 Old parent dim [" + _origParentWidth + "," + _origParentHeight + "][" + width + "," + height + "] newFontSize=" + newFontSize);
        }
        
        public function redrawText(a:Annotation, origParentWidth:Number, origParentHeight:Number, parentWidth:Number, parentHeight:Number):void {
            this.x = denormalize(a.annotation.x, parentWidth);
            this.y = denormalize(a.annotation.y, parentHeight);
            
            var newFontSize:Number = a.annotation.fontSize;
            newFontSize = (parentHeight/origParentHeight) * a.annotation.fontSize;
            
            /** Pass around the original parent width and height when this text was drawn. 
             * We need this to redraw the the text to the proper size properly.
             * **/
            _origParentHeight = origParentHeight;
            _origParentWidth = origParentWidth;               
            
            _textField.text = a.annotation.text;
            _textField.antiAliasType = AntiAliasType.ADVANCED;
            var format:TextFormat = new TextFormat();
            format.size = newFontSize;
            format.font = "arial";
            _textField.defaultTextFormat = format;
            _textField.setTextFormat(format);
            
            this.width = denormalize(a.annotation.textBoxWidth, parentWidth);
            this.height = denormalize(a.annotation.textBoxHeight, parentHeight);
            
            LogUtil.debug("Redraw dim [" + _origParentWidth + "," + _origParentHeight + "][" + width + "," + height + "] newFontSize=" + newFontSize);
            
            //           LogUtil.debug("Redraw 2 Old parent dim [" + this.width + "," + this.height + "] newFontSize=" + newFontSize);
        }
        
        public function displayForPresenter():void {
            _textField.multiline = true;
            _textField.wordWrap = true;
            _textField.type = TextFieldType.INPUT;
            _textField.border = true;
            _textField.background = true;
            _textField.backgroundColor = 0xFFFFFF;
        }
        
        public function displayNormally():void {
            _textField.multiline = true;
            _textField.wordWrap = true;
        }
        
        public function makeEditable(editable:Boolean):void {
            if(editable) {
                _textField.type = TextFieldType.INPUT;
            } else {
                _textField.type = TextFieldType.DYNAMIC;
            }
            this._editable = editable;
        }
        
        public function registerListeners(textObjGainedFocus:Function, textObjLostFocus:Function, textObjTextListener:Function, textObjDeleteListener:Function):void {											  
            _textField.addEventListener(FocusEvent.FOCUS_IN, textObjGainedFocus);
            _textField.addEventListener(FocusEvent.FOCUS_OUT, textObjLostFocus);
            _textField.addEventListener(TextEvent.TEXT_INPUT, textObjTextListener);
            _textField.addEventListener(KeyboardEvent.KEY_DOWN, textObjDeleteListener);
        }		
        
        public function deregisterListeners(textObjGainedFocus:Function, textObjLostFocus:Function, textObjTextListener:Function, textObjDeleteListener:Function):void {			
            _textField.removeEventListener(FocusEvent.FOCUS_IN, textObjGainedFocus);
            _textField.removeEventListener(FocusEvent.FOCUS_OUT, textObjLostFocus);
            _textField.removeEventListener(TextEvent.TEXT_INPUT, textObjTextListener);
            _textField.removeEventListener(KeyboardEvent.KEY_DOWN, textObjDeleteListener);
        }
        
        
    }
}