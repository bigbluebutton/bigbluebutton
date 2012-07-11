package org.bigbluebutton.modules.whiteboard
{
	import flash.display.Shape;
	import flash.display.Sprite;
	import flash.events.MouseEvent;
	import flash.text.TextField;
	import flash.text.TextFieldType;
	import flash.text.TextFormat;
	
	import mx.collections.ArrayCollection;
	import mx.core.Application;
	import mx.managers.CursorManager;
	
	import org.bigbluebutton.common.IBbbCanvas;
	import org.bigbluebutton.common.Images;
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.modules.present.events.WindowResizedEvent;
	import org.bigbluebutton.modules.whiteboard.WhiteboardCanvasModel;
	import org.bigbluebutton.modules.whiteboard.business.shapes.DrawObject;
	import org.bigbluebutton.modules.whiteboard.business.shapes.DrawObjectFactory;
	import org.bigbluebutton.modules.whiteboard.business.shapes.ShapeFactory;
	import org.bigbluebutton.modules.whiteboard.business.shapes.TextBox;
	import org.bigbluebutton.modules.whiteboard.events.PageEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardButtonEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardDrawEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardPresenterEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardUpdate;
	import org.bigbluebutton.modules.whiteboard.maps.WhiteboardEventMap;
	import org.bigbluebutton.modules.whiteboard.views.WhiteboardCanvas;
	
	public class WhiteboardCanvasModel {
		public var wbCanvas:WhiteboardCanvas;
		
		private var isDrawing:Boolean; 
		private var sending:Boolean = false;
		private var feedback:Shape = new Shape();
		private var latentFeedbacks:Array = new Array();
		private var segment:Array = new Array();
		private var shapeList:Array = new Array();
		
		private var shapeFactory:ShapeFactory = new ShapeFactory();
		private var bbbCanvas:IBbbCanvas;
		
		private var shapeStyle:String = DrawObject.PENCIL;
		private var drawColor:uint = 0x000000;
		private var thickness:uint = 1;
		private var _fontStyle:String = "_sans";
		private var _fontSize:Number = 18;
		private var _textText:String = "Hello BBB!";
				
		private var drawStatus:String = DrawObject.DRAW_START;
		private var width:Number;
		private var height:Number;

		public function changeFontStyle(font:String):void {
			_fontStyle = font;	
		}
		
		public function changeFontSize(size:Number):void {
			_fontSize = size;
		}
		
		public function doMouseUp():void {
			if (isDrawing) {
				/**
				 * Check if we are drawing because when resizing the window, it generates
				 * a mouseUp event at the end of resize. We don't want to dispatch another
				 * shape to the viewers.
				 */
				isDrawing = false;
				sendShapeToServer(DrawObject.DRAW_END);
			}
		}
		
		private var objCount:int = 0;
		
		private function sendShapeToServer(status:String):void {
			if (segment.length == 0) return;
			
			var dobj:DrawObject = shapeFactory.createDrawObject(this.shapeStyle, segment, this.drawColor, this.thickness);
			
			dobj.id = "" + objCount++;
			
			switch (status) {
				case DrawObject.DRAW_START:
					dobj.status = DrawObject.DRAW_START;
					drawStatus = DrawObject.DRAW_UPDATE;
					break;
				case DrawObject.DRAW_UPDATE:
					dobj.status = DrawObject.DRAW_UPDATE;								
					break;
				case DrawObject.DRAW_END:
					dobj.status = DrawObject.DRAW_END;
					drawStatus = DrawObject.DRAW_START;
					break;
			}
			
//			LogUtil.error("SEGMENT LENGTH = [" + segment.length + "] STATUS = [" + dobj.status + "]");
			
			if (this.shapeStyle == DrawObject.PENCIL) {
				dobj.status = DrawObject.DRAW_END;
				drawStatus = DrawObject.DRAW_START;
				segment = new Array();	
				var xy:Array = wbCanvas.getMouseXY();
				segment.push(xy[0], xy[1]);
			}
			
			wbCanvas.sendShapeToServer(dobj);			
		}
		
		public function doMouseDown(mouseX:Number, mouseY:Number):void {
			isDrawing = true;
			drawStatus = DrawObject.DRAW_START;
			segment = new Array();
			segment.push(mouseX);
			segment.push(mouseY);
			
			if (shapeStyle == DrawObject.TEXT) {
				LogUtil.debug("TEXT SHAPE");
			//	createWhiteboard();
			//	enableUserInput();		
				createTextBox();
			}

			
		}
		
		public function doMouseMove(mouseX:Number, mouseY:Number):void {
			if (isDrawing){
				segment.push(mouseX);
				segment.push(mouseY);
				if (segment.length > 30) {
					sendShapeToServer(drawStatus);
				}
			}
		}
		
		public function drawSegment(event:WhiteboardUpdate):void {
			var o:DrawObject = event.data;
			draw(o);
		}
		
		private function draw(o:DrawObject):void{		
			LogUtil.debug("Got shape [" + o.getType() + " " + o.status + "]");
			switch (o.status) {
				case DrawObject.DRAW_START:
						addNewShape(o);														
					break;
				case DrawObject.DRAW_UPDATE:
				case DrawObject.DRAW_END:
					if (shapeList.length == 0 || o.getType() == DrawObject.PENCIL) {
						addNewShape(o);
					} else {
						removeLastShape();		
						addNewShape(o);
					}					
					break;
			}        
		}
		
		private function addNewShape(o:DrawObject):void {
			LogUtil.error("Adding new shape");
			var dobj:DrawObject = shapeFactory.makeShape(o);
			wbCanvas.addShape(dobj.getShape());
			shapeList.push(dobj);
		}
			
		public function setShape(s:String):void{
			this.shapeStyle = s;
		}
				
		public function changeColor(color:uint):void{
			drawColor = color;
		}
			
		public function changeThickness(thickness:uint):void{
			this.thickness = thickness;
		}
				
		private function removeLastShape():void {
			var dobj:DrawObject = shapeList.pop() as DrawObject;
			wbCanvas.removeShape(dobj.getShape());
		}
		
	
		public function clearBoard(event:WhiteboardUpdate = null):void{
			var numShapes:int = this.shapeList.length;
			for (var i:Number = 0; i < numShapes; i++){
				removeLastShape();
			}
		}
		
		public function undoShape():void{
			if (this.shapeList.length > 0) {
				removeLastShape();
			}
		}
				
		public function changePage(e:PageEvent):void{
			var page:Number = e.pageNum;
			var shapes:ArrayCollection = e.shapes;
			
			clearBoard();
			for (var i:int = 0; i < shapes.length; i++){
				var o:DrawObject = shapes.getItemAt(i) as DrawObject;
				draw(o);
			}
		}
								
		public function zoomCanvas(width:Number, height:Number):void{
			shapeFactory.setParentDim(width, height);	
			
			this.width = width;
			this.height = height;
			
			for (var i:int = 0; i < this.shapeList.length; i++){
				redrawShape(this.shapeList[i] as DrawObject);
			}				
		}
		
		private function redrawShape(dobj:DrawObject):void {
			wbCanvas.removeShape(dobj.getShape());
			shapeFactory.makeShape(dobj);
			wbCanvas.addShape(dobj.getShape());
		}	
		
		public function isPageEmpty():Boolean {
			return shapeList.length == 0;
		}
		
		private var _textShape:Sprite;
		private var _currentText:TextField;
		
		private function createTextBox():void {
			_currentText = new TextField();
			_currentText.type = TextFieldType.INPUT;
			_currentText.x = segment[0];
			_currentText.y = segment[1];
			_currentText.width = 200;
			_currentText.height = 20;
			_currentText.background = true;
			_currentText.border = true;
			_currentText.htmlText = "FOO";
			
			var format:TextFormat = new TextFormat();
			format.font = "Verdana";
			format.color = 0xFF0000;
			format.size = 18;
			format.underline = true;
			
			_currentText.defaultTextFormat = format;
			
			// add to displaylist
			wbCanvas.addShape(_currentText);
		}
		
		private function createWhiteboard():void {
			LogUtil.debug("Creating text shape.");
			// create whiteboard sprite
			_textShape = new Sprite();
			_textShape.x = 100;
			_textShape.y = 100;
			// add to displaylist
			wbCanvas.addShape(_textShape);
			
			// draw graphics
			with(_textShape.graphics)
			{
				lineStyle(3, 0x666666, 1);
				beginFill(0xFFFFFF, 1);
				drawRect(0, 0, 100, 200);
				endFill();
			}
		}
		
		private function enableUserInput():void {
			_textShape.addEventListener(MouseEvent.CLICK, onUserInteract);
		}
		
		private function onUserInteract(event:MouseEvent):void {
			LogUtil.debug("onUserInteract");
			// remove if empty
			if(_currentText && _currentText.htmlText.length == 0)
			{
				// remove from displaylist
				_textShape.removeChild(_currentText);
			}
			
			// add new
			if(event.target == _textShape)
			{
				_currentText = new TextBox(_textText, _fontStyle, _fontSize, drawColor);
				_currentText.x = event.stageX;
				_currentText.y = event.stageY;
				
				// add to displaylist
				_textShape.addChild(_currentText);
			}
			else
			{
				// use clicked text
				_currentText = event.target as TextBox;
			}
			
			// set selection
			_currentText.setSelection(0, _currentText.htmlText.length);
			
			// set focus
			wbCanvas.stage.focus = _currentText;
		}
	}
}