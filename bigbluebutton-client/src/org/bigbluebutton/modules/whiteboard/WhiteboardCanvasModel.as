package org.bigbluebutton.modules.whiteboard
{
	import flash.display.Shape;
	
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
				
		private var drawStatus:String = DrawObject.DRAW_START;
		private var width:Number;
		private var height:Number;

		public function doMouseUp():void{
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
		
		private function sendShapeToServer(status:String):void{
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
			
			LogUtil.error("SEGMENT LENGTH = [" + segment.length + "] STATUS = [" + dobj.status + "]");
			
			if (this.shapeStyle == DrawObject.PENCIL) {
				dobj.status = DrawObject.DRAW_END;
				drawStatus = DrawObject.DRAW_START;
				segment = new Array();	
				var xy:Array = wbCanvas.getMouseXY();
				segment.push(xy[0], xy[1]);
			}
			
			wbCanvas.sendShapeToServer(dobj);			
		}
		
		public function doMouseDown(mouseX:Number, mouseY:Number):void{
			isDrawing = true;
			drawStatus = DrawObject.DRAW_START;
			segment = new Array();
			segment.push(mouseX);
			segment.push(mouseY);
		}
		
		public function doMouseMove(mouseX:Number, mouseY:Number):void{
			if (isDrawing){
				segment.push(mouseX);
				segment.push(mouseY);
				if (segment.length > 30) {
					sendShapeToServer(drawStatus);
				}
			}
		}
		
		public function drawSegment(event:WhiteboardUpdate):void{
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
	}
}