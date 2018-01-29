package org.bigbluebutton.lib.whiteboard.views {
	import flash.display.Sprite;
	import flash.text.TextField;
	import flash.text.TextFormat;
	
	public class WhiteboardCursor extends Sprite {
		private static const PRESENTER_COLOR:uint = 0xFF0000;
		
		private static const OTHER_COLOR:uint = 0x2A992A;
		
		private var _userId:String;
		
		private var _userName:String;
		
		private var _origX:Number;
		
		private var _origY:Number;
		
		private var _parentWidth:Number;
		
		private var _parentHeight:Number;
		
		private var _isPresenter:Boolean;
		
		private var _nameTextField:TextField;
		
		private var _showUser:Boolean = false;
		
		public function WhiteboardCursor(userId:String, userName:String, x:Number, y:Number, parentWidth:Number, parentHeight:Number, isPresenter:Boolean, showUser:Boolean) {
			_userId = userId;
			_userName = userName;
			_origX = x;
			_origY = y;
			_parentWidth = parentWidth;
			_parentHeight = parentHeight;
			_isPresenter = isPresenter;
			
			_nameTextField = new TextField();
			_nameTextField.text = _userName;
			_nameTextField.x = 10;
			_nameTextField.y = -3;
			_nameTextField.alpha = 0.8;
			_nameTextField.background = true;
			_nameTextField.border = true;
			_nameTextField.multiline = false;
			_nameTextField.mouseEnabled = false;
			
			var tFormat:TextFormat = new TextFormat();
			tFormat.size = 12;
			tFormat.font = "arial";
			tFormat.bold = true;
			_nameTextField.setTextFormat(tFormat);
			
			_nameTextField.height = _nameTextField.textHeight + 4;
			_nameTextField.width = Math.min(65, _nameTextField.textWidth + 4);
			
			addChild(_nameTextField);
			
			_showUser = showUser;
			drawCursor();
			setPosition();
		}
		
		public function updatePosition(x:Number, y:Number, showUser:Boolean):void {
			_origX = x;
			_origY = y;
			_showUser = showUser;
			setPosition();
		}
		
		public function updateParentSize(parentWidth:Number, parentHeight:Number):void {
			_parentWidth = parentWidth;
			_parentHeight = parentHeight;
			
			setPosition();
		}
		
		public function updatePresenter(isPresenter:Boolean, showUser:Boolean):void {
			_isPresenter = isPresenter;
			_showUser = showUser;
			drawCursor();
		}
		
		private function setPosition():void {
			x = denormalize(_origX, _parentWidth);
			y = denormalize(_origY, _parentHeight);
			
			if (isCursorOutsideWindow()) {
				hideCursor()
			} else {
				showCursor();
			}
			_nameTextField.visible = _showUser;
		}
		
		private function showCursor():void {
			visible = true;
		}
		
		private function hideCursor():void {
			visible = false;
		}
		
		private function isCursorOutsideWindow():Boolean {
			return (_origX > 100 || _origX < 0 || _origY > 100 || _origY < 0);
		}
		
		private function drawCursor():void {
			var cursorColor:uint = (_isPresenter ? PRESENTER_COLOR : OTHER_COLOR);
			
			_nameTextField.textColor = cursorColor;
			_nameTextField.borderColor = cursorColor;
			
			_nameTextField.visible = _showUser;
			
			
			graphics.clear();
			graphics.lineStyle(6, cursorColor, 0.6);
			graphics.drawCircle(0, 0, 2.5);
		}
		
		private function denormalize(val:Number, side:Number):Number {
			return (val * side) / 100.0;
		}
	}
}
