package org.bigbluebutton.modules.whiteboard
{
	import flash.display.Shape;
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.common.IBbbCanvas;
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.modules.whiteboard.business.shapes.DrawObject;
	import org.bigbluebutton.modules.whiteboard.business.shapes.GraphicObject;
	import org.bigbluebutton.modules.whiteboard.business.shapes.ShapeFactory;
	import org.bigbluebutton.modules.whiteboard.business.shapes.TextFactory;
	import org.bigbluebutton.modules.whiteboard.business.shapes.TextObject;
	import org.bigbluebutton.modules.whiteboard.events.PageEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardUpdate;
	import org.bigbluebutton.modules.whiteboard.views.WhiteboardCanvas;
	
	public class WhiteboardCanvasModel {
		public var wbCanvas:WhiteboardCanvas;
		
		private var isDrawing:Boolean; 
		private var sending:Boolean = false;
		private var feedback:Shape = new Shape();
		private var latentFeedbacks:Array = new Array();
		private var segment:Array = new Array();
		private var graphicList:Array = new Array();
		
		private var shapeFactory:ShapeFactory = new ShapeFactory();
		private var textFactory:TextFactory = new TextFactory();
		private var bbbCanvas:IBbbCanvas;
		
		private var graphicType:String = GraphicObject.TYPE_SHAPE;
		private var shapeStyle:String = DrawObject.PENCIL;
		private var drawColor:uint = 0x000000;
		private var thickness:uint = 1;
		private var fillOn:Boolean = false;
		private var transparencyOn:Boolean = false;
		
		// represents the max number of 'points' enumerated in 'segment'
		// before sending an update to server. Used to prevent 
		// spamming red5 with unnecessary packets
		private var sendShapeFrequency:uint = 30;
				
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
			
			var dobj:DrawObject = shapeFactory.createDrawObject(this.shapeStyle, segment, this.drawColor, this.thickness,
																this.fillOn, this.transparencyOn);
			
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
		
		public function doMouseDoubleClick(mouseX:Number, mouseY:Number):void {
			if(graphicType == GraphicObject.TYPE_TEXT) {
				LogUtil.error("double click received at " + mouseX + "," + mouseY);
			}
		}
		
		public function doMouseMove(mouseX:Number, mouseY:Number):void{
			if (isDrawing){
				segment.push(mouseX);
				segment.push(mouseY);
				if (segment.length > sendShapeFrequency) {
					sendShapeToServer(drawStatus);
				}
			}
		}
		
		public function drawSegment(event:WhiteboardUpdate):void{
			var o:DrawObject = event.data;
			drawShape(o);
		}
		
		private function drawShape(o:DrawObject):void{		
			LogUtil.debug("Got shape [" + o.getType() + " " + o.status + "]");
			switch (o.status) {
				case DrawObject.DRAW_START:
						addNewShape(o);														
					break;
				case DrawObject.DRAW_UPDATE:
				case DrawObject.DRAW_END:
					if (graphicList.length == 0 || o.getType() == DrawObject.PENCIL) {
						addNewShape(o);
					} else {
						removeLastShape();		
						addNewShape(o);
					}					
					break;
			}        
		}
		
		private function addNewShape(o:DrawObject):void {
			LogUtil.debug("Adding new shape");
			var dobj:DrawObject = shapeFactory.makeShape(o);
			wbCanvas.addShape(dobj.getShape());
			graphicList.push(dobj);
		}
		
		private function addNewText(t:TextObject):void {
			LogUtil.debug("Adding new text");
			var tobj:TextObject = textFactory.makeText(t);
			wbCanvas.addText(tobj.getTextField());
			graphicList.push(tobj);
		}
		
		public function setGraphicType(type:String):void{
			this.graphicType = type;
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
			
		public function toggleFill():void{
			fillOn = !fillOn;
		}
		
		public function toggleTransparency():void{
			transparencyOn = !transparencyOn;
		}
		
		public function setFill(fill:Boolean):void{
			this.fillOn = fill;
		}
		
		public function setTransparent(transp:Boolean):void{
			this.transparencyOn = transp;
		}
		
		private function removeLastGraphic():void {
			var gobj:GraphicObject = graphicList.pop() as GraphicObject;
			if(gobj.getGraphicType() == GraphicObject.TYPE_SHAPE) {
				var dobj:DrawObject = gobj as DrawObject;
				wbCanvas.removeShape(dobj.getShape());
			} else if(gobj.getGraphicType() == GraphicObject.TYPE_TEXT) {
				var tobj:TextObject = gobj as TextObject;
				wbCanvas.removeText(tobj.getTextField());
			}	
		}
		
		private function removeLastShape():void {
			var gobj:GraphicObject = graphicList.pop() as GraphicObject;
			var dobj:DrawObject = gobj as DrawObject;
			wbCanvas.removeShape(dobj.getShape());
		}
		
		private function removeLastText():void {
			var gobj:GraphicObject = graphicList.pop() as GraphicObject;
			var tobj:TextObject = gobj as TextObject;
			wbCanvas.removeText(tobj.getTextField());	
		}
		
		public function clearBoard(event:WhiteboardUpdate = null):void{
			var numGraphics:int = this.graphicList.length;
			for (var i:Number = 0; i < numGraphics; i++){
				removeLastGraphic();
			}
		}
		
		public function undoGraphic():void{
			if (this.graphicList.length > 0) {
				removeLastGraphic();
			}
		}
				
		public function changePage(e:PageEvent):void{
			var page:Number = e.pageNum;
			var graphicObjs:ArrayCollection = e.graphicObjs;
			
			clearBoard();
			for (var i:int = 0; i < graphicObjs.length; i++){
				var o:DrawObject = graphicObjs.getItemAt(i) as DrawObject;
				drawShape(o);
			}
		}
								
		public function zoomCanvas(width:Number, height:Number):void{
			shapeFactory.setParentDim(width, height);	
			
			this.width = width;
			this.height = height;
			
			for (var i:int = 0; i < this.graphicList.length; i++){
				redrawGraphic(this.graphicList[i] as GraphicObject);
			}				
		}
		
		public function isPageEmpty():Boolean {
			return graphicList.length == 0;
		}
			
		private function redrawGraphic(gobj:GraphicObject):void {
			if(gobj.getGraphicType() == GraphicObject.TYPE_SHAPE) {
				var dobj:DrawObject = gobj as DrawObject;
				wbCanvas.removeShape(dobj.getShape());
				shapeFactory.makeShape(dobj);
				wbCanvas.addShape(dobj.getShape());
			} else if(gobj.getGraphicType() == GraphicObject.TYPE_TEXT) {
				var tobj:TextObject = gobj as TextObject;
				wbCanvas.removeText(tobj.getTextField());
				textFactory.makeText(tobj);
				wbCanvas.addText(tobj.getTextField());
			}
		}		
	}
}