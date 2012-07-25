package org.bigbluebutton.modules.whiteboard
{
	import flash.display.DisplayObject;
	import flash.display.Shape;
	import flash.display.Sprite;
	import flash.events.FocusEvent;
	import flash.events.KeyboardEvent;
	import flash.events.MouseEvent;
	import flash.events.TextEvent;
	import flash.geom.Point;
	import flash.text.TextField;
	import flash.text.TextFieldAutoSize;
	import flash.text.TextFieldType;
	import flash.text.TextFormat;
	import flash.ui.Keyboard;	
	import mx.collections.ArrayCollection;
	import mx.controls.TextInput;
	import mx.core.Application;
	import mx.core.UIComponent;
	import mx.managers.CursorManager;	
	import org.bigbluebutton.common.IBbbCanvas;
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.main.events.MadePresenterEvent;
	import org.bigbluebutton.modules.whiteboard.business.shapes.DrawGrid;
	import org.bigbluebutton.modules.whiteboard.business.shapes.DrawObject;
	import org.bigbluebutton.modules.whiteboard.business.shapes.GraphicFactory;
	import org.bigbluebutton.modules.whiteboard.business.shapes.GraphicObject;
	import org.bigbluebutton.modules.whiteboard.business.shapes.ShapeFactory;
	import org.bigbluebutton.modules.whiteboard.business.shapes.TextBox;
	import org.bigbluebutton.modules.whiteboard.business.shapes.TextFactory;
	import org.bigbluebutton.modules.whiteboard.business.shapes.TextObject;
	import org.bigbluebutton.modules.whiteboard.business.shapes.WhiteboardConstants;
	import org.bigbluebutton.modules.whiteboard.events.GraphicObjectFocusEvent;
	import org.bigbluebutton.modules.whiteboard.events.PageEvent;
	import org.bigbluebutton.modules.whiteboard.events.ToggleGridEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardDrawEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardSettingResetEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardUpdate;
	import org.bigbluebutton.modules.whiteboard.views.WhiteboardCanvas;
	
    /**
    * Class responsible for handling actions from presenter and sending annotations to the server.
    */
	public class WhiteboardCanvasModel {
		public var wbCanvas:WhiteboardCanvas;	
		private var isDrawing:Boolean; 
		private var sending:Boolean = false;
		private var feedback:Shape = new Shape();
		private var latentFeedbacks:Array = new Array();
		private var segment:Array = new Array();

		private var shapeFactory:ShapeFactory = new ShapeFactory();
		private var textFactory:TextFactory = new TextFactory();
		private var bbbCanvas:IBbbCanvas;
		private var lastGraphicObjectSelected:GraphicObject;
		
		private var graphicType:String = WhiteboardConstants.TYPE_SHAPE;
		private var toolType:String = DrawObject.PENCIL;
		private var drawColor:uint = 0x000000;
		private var fillColor:uint = 0x000000;
		private var thickness:uint = 1;

		private var _fontStyle:String = "_sans";
		private var _fontSize:Number = 18;
		private var _textText:String = "Hello BBB!";
				

		private var fillOn:Boolean = false;
		private var transparencyOn:Boolean = false;
		
		
		/* represents the max number of 'points' enumerated in 'segment' before sending an update to server. Used to prevent 
		   spamming red5 with unnecessary packets
		*/
		private var sendShapeFrequency:uint = 30;	
		
		/* same as above, except a faster interval may be desirable when erasing, for aesthetics */
		private var sendEraserFrequency:uint = 20;	

		private var drawStatus:String = DrawObject.DRAW_START;
		private var textStatus:String = TextObject.TEXT_CREATED;
		private var width:Number;
		private var height:Number;


		public function changeFontStyle(font:String):void {
			_fontStyle = font;	
		}
		
		public function changeFontSize(size:Number):void {
			_fontSize = size;
		}
		
		// isGrid represents the state of the current page (grid vs not grid)
		private var isGrid:Boolean = true;
		// drawGrid is the sprite added to the page when isGrid is true
		private var drawGrid:DrawGrid;
		
		public function doMouseUp():void{
			if(graphicType == WhiteboardConstants.TYPE_SHAPE) {
				if (isDrawing) {
					/**
					 * Check if we are drawing because when resizing the window, it generates
					 * a mouseUp event at the end of resize. We don't want to dispatch another
					 * shape to the viewers.
					 */
					isDrawing = false;
					
					//check to make sure unnecessary data is not sent ex. a single click when the rectangle tool is selected
					// is hardly classifiable as a rectangle, and should not be sent to the server
					if(toolType == DrawObject.RECTANGLE || toolType == DrawObject.ELLIPSE || toolType == DrawObject.TRIANGLE) {						
						var x:Number = segment[0];
						var y:Number = segment[1];
						var width:Number = segment[segment.length-2]-x;
						var height:Number = segment[segment.length-1]-y;
						
						if(!(Math.abs(width) <= 2 && Math.abs(height) <=2)) {
							sendShapeToServer(DrawObject.DRAW_END);
						}
					} else {
						sendShapeToServer(DrawObject.DRAW_END);
					}					
				}
			}
		}
				
		private function sendShapeToServer(status:String):void {
			if (segment.length == 0) return;
			
			var dobj:DrawObject = shapeFactory.createDrawObject(this.toolType, segment, this.drawColor, this.thickness, this.fillOn, this.fillColor, this.transparencyOn);

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
			
			if (this.toolType == DrawObject.PENCIL || this.toolType == DrawObject.ERASER) {
				dobj.status = DrawObject.DRAW_END;
				drawStatus = DrawObject.DRAW_START;
				segment = new Array();	
				var xy:Array = wbCanvas.getMouseXY();
				segment.push(xy[0], xy[1]);
			}
			
			wbCanvas.sendGraphicToServer(dobj, WhiteboardDrawEvent.SEND_SHAPE);			
		}
		       
		private function sendTextToServer(status:String, tobj:TextObject):void {
			switch (status) {
				case TextObject.TEXT_CREATED:
					tobj.status = TextObject.TEXT_CREATED;
					textStatus = TextObject.TEXT_UPDATED;
					break;
				case TextObject.TEXT_UPDATED:
					tobj.status = TextObject.TEXT_UPDATED;
					break;
				case TextObject.TEXT_PUBLISHED:
					tobj.status = TextObject.TEXT_PUBLISHED;
					textStatus = TextObject.TEXT_CREATED;
					break;
			}	
			LogUtil.debug("SENDING TEXT: [" + tobj.text + "]");
			wbCanvas.sendGraphicToServer(tobj, WhiteboardDrawEvent.SEND_TEXT);			
		}
        		
		public function doMouseDown(mouseX:Number, mouseY:Number):void{
			if(graphicType == WhiteboardConstants.TYPE_SHAPE) {
				isDrawing = true;
				drawStatus = DrawObject.DRAW_START;
				segment = new Array();

				segment.push(mouseX);
				segment.push(mouseY);
			} 	else if(graphicType == WhiteboardConstants.TYPE_TEXT) {
                LogUtil.error("double click received at " + mouseX + "," + mouseY);
                //				var tobj:TextObject = new TextObject("TEST", 0x000000, 0x000000, false, mouseX, mouseY, 18);
                var tobj:TextObject = textFactory.createTextObject("TEST", 0x000000, 0x000000, false, mouseX, mouseY, 18);
                LogUtil.error("double click received at [" + mouseX + "," + mouseY + "] norm=[" + tobj.getOrigX() + "," + tobj.getOrigY() + "]");
                sendTextToServer(TextObject.TEXT_CREATED, tobj);
            }
		}
				
		public function doMouseMove(mouseX:Number, mouseY:Number):void{
			if(graphicType == WhiteboardConstants.TYPE_SHAPE) {
				if (isDrawing){
					segment.push(mouseX);
					segment.push(mouseY);
					// added different "send" rates for normal shapes and the eraser in case one is preferable to the other
					if(toolType == DrawObject.ERASER) {
						if (segment.length > sendEraserFrequency) {
							sendShapeToServer(drawStatus);
						}
					} else {
						if (segment.length > sendShapeFrequency) {
							sendShapeToServer(drawStatus);
						}
					}	
				}
			}
		}
				
		public function setGraphicType(type:String):void{
			this.graphicType = type;
		}
		
		public function setTool(s:String):void{
			this.toolType = s;
		}
		
		public function changeColor(color:uint):void{
			drawColor = color;
		}
		
			
		public function changeThickness(thickness:uint):void{
			this.thickness = thickness;
		}

        /** Helper method to test whether this user is the presenter */
        private function get isPresenter():Boolean {
            return UserManager.getInstance().getConference().amIPresenter();
        }
	}
}
