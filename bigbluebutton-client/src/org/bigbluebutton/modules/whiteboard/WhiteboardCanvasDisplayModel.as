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
	import org.bigbluebutton.modules.whiteboard.business.shapes.DrawObjectFactory;
	import org.bigbluebutton.modules.whiteboard.business.shapes.GraphicFactory;
	import org.bigbluebutton.modules.whiteboard.business.shapes.GraphicObject;
	import org.bigbluebutton.modules.whiteboard.business.shapes.Pencil;
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
	import org.bigbluebutton.modules.whiteboard.models.Annotation;
	import org.bigbluebutton.modules.whiteboard.views.WhiteboardCanvas;
	
    /**
    * Class to handle displaying of received annotations from the server.
    */
	public class WhiteboardCanvasDisplayModel {
		public var wbCanvas:WhiteboardCanvas;	
		private var graphicList:Array = new Array();
		
		private var shapeFactory:ShapeFactory = new ShapeFactory();

		private var bbbCanvas:IBbbCanvas;
		private var width:Number;
		private var height:Number;


		
		public function drawGraphic(event:WhiteboardUpdate):void{
			var o:Annotation = event.annotation;
			var recvdShapes:Boolean = event.recvdShapes;
            LogUtil.debug("**** Drawing graphic [" + o.type + "] *****");
			if(o.type != "text") {
				var dobj:DrawObject = drawObjectFactory(o.annotation);
				drawShape(dobj, recvdShapes);					
			} else { 
				drawText(o, recvdShapes);	
			}
		}
		
        
        private function drawObjectFactory(a:Object):DrawObject {
            var drawFactory:DrawObjectFactory = new DrawObjectFactory();
            var d:DrawObject = drawFactory.makeDrawObject(a.type, a.points, a.color, a.thickness, a.fill, a.fillColor, a.transparency);
            
            d.setGraphicID(a.id);
            d.status = a.status;
            return d;
        }
        
		// Draws a DrawObject when/if it is received from the server
		private function drawShape(o:DrawObject, recvdShapes:Boolean):void {			
			switch (o.status) {
				case DrawObject.DRAW_START:
					addNewShape(o);														
					break;
				case DrawObject.DRAW_UPDATE:
				case DrawObject.DRAW_END:
					if (graphicList.length == 0 || o.getType() == DrawObject.PENCIL || o.getType() == DrawObject.ERASER || recvdShapes) {
						addNewShape(o);
					} else {
						removeLastGraphic();		
						addNewShape(o);
					}					
					break;
			}        
		}
		
		// Draws a TextObject when/if it is received from the server
		private function drawText(o:Annotation, recvdShapes:Boolean):void {		
			if (recvdShapes) {
				LogUtil.debug("RX: Got text [" + o.type + " " + o.status + " " + o.id + "]");	
			}
			switch (o.status) {
				case TextObject.TEXT_CREATED:
					if (isPresenter)
						addPresenterText(o);
					else
						addNormalText(o);														
					break;
				case TextObject.TEXT_UPDATED:
				case TextObject.TEXT_PUBLISHED:
					if (isPresenter) {
						if (recvdShapes) addPresenterText(o);
					} else {
						if(graphicList.length == 0 || recvdShapes) {
							addNormalText(o);
						} else modifyText(o);
					} 	
					break;
			}        
		}
		
		private function addNewShape(o:DrawObject):void {
			LogUtil.debug("Adding new shape [" + o.getType() + "," + o.getGraphicID() + "," + o.status + "]");
            if (o.getType() == DrawObject.TEXT) return;

			var dobj:DrawObject = shapeFactory.makeShape(o);
            LogUtil.debug("Adding new shape 1 [" + dobj.getType() + "," + dobj.getGraphicID() + "," + dobj.status + "]");
			wbCanvas.addGraphic(dobj);
            LogUtil.debug("Adding new shape 2 [" + dobj.getGraphicID() + ", [" + dobj.x + "," + dobj.y + "]");
            
            var points:String = "{type=" + dobj.getType() + ",points=";
            for (var p:int = 0; p < dobj.getShapeArray().length; p++) {
                points += dobj.getShapeArray()[p] + ",";
            }
            points +=  "]}";
            
            LogUtil.debug("PencilDrawListener sendShapeToServer - Got here 2 [" + points + "]");
            
            LogUtil.debug("Adding new shape 3 [" + points + "]");
			graphicList.push(dobj);
		}
		
		private function calibrateNewTextWith(o:Annotation):TextObject {
			var tobj:TextObject = shapeFactory.makeTextObject(o);
			tobj.setGraphicID(o.id);
			tobj.status = o.status;
            LogUtil.debug("Created text object [" + tobj.getGraphicID() + "] in [" + tobj.text + "," + tobj.x + "," + tobj.y + "," + tobj.textSize + "]");
			return tobj;
		}
			
		/* adds a new TextObject that is suited for a presenter. For example, it will
		   be made editable and the appropriate listeners will be registered so that
		   the required events will be dispatched 
		*/
		private function addPresenterText(o:Annotation):void {
			if(!isPresenter) return;
			var tobj:TextObject = calibrateNewTextWith(o);
			tobj.multiline = true;
			tobj.wordWrap = true;
			tobj.autoSize = TextFieldAutoSize.LEFT;
			tobj.makeEditable(true);
            LogUtil.debug("Putting text object [" + tobj.getGraphicID() + "] in [" + tobj.x + "," + tobj.y + "]");
//			tobj.registerListeners(textObjGainedFocusListener, textObjLostFocusListener, textObjTextListener, textObjSpecialListener);
			wbCanvas.addGraphic(tobj);
			wbCanvas.stage.focus = tobj;
			graphicList.push(tobj);
		}
		
		/* adds a new TextObject that is suited for a viewer. For example, it will not
		   be made editable and no listeners need to be attached because the viewers
		   should not be able to edit/modify the TextObject 
		*/
		private function addNormalText(o:Annotation):void {
			if (isPresenter) return;
			var tobj:TextObject = calibrateNewTextWith(o);
			//LogUtil.debug("TEXT ADDED: " + tobj.getGraphicID());
			tobj.multiline = true;
			tobj.wordWrap = true;
			tobj.autoSize = TextFieldAutoSize.LEFT;
			tobj.makeEditable(false);
			wbCanvas.addGraphic(tobj);
			graphicList.push(tobj);
		}
		
		/* method to modify a TextObject that is already present on the whiteboard, as opposed to adding a new TextObject to the whiteboard */
		private function modifyText(o:Annotation):void {
			var tobj:TextObject = calibrateNewTextWith(o);
			var id:String = tobj.getGraphicID();
			removeText(id);
			LogUtil.debug("Text modified to " + tobj.text);
			addNormalText(o);
		}
		
		/* the following three methods are used to remove any GraphicObjects (and its subclasses) if the id of the object to remove is specified. The latter
			two are convenience methods, the main one is the first of the three.
		*/
		private function removeGraphic(id:String):void {
			var gobjData:Array = getGobjInfoWithID(id);
			var removeIndex:int = gobjData[0];
			var gobjToRemove:GraphicObject = gobjData[1] as GraphicObject;
			wbCanvas.removeGraphic(gobjToRemove as DisplayObject);
			graphicList.splice(removeIndex, 1);
		}	
	
		private function removeShape(id:String):void {
			var dobjData:Array = getGobjInfoWithID(id);
			var removeIndex:int = dobjData[0];
			var dobjToRemove:DrawObject = dobjData[1] as DrawObject;
			wbCanvas.removeGraphic(dobjToRemove);
			graphicList.splice(removeIndex, 1);
		}
	
		private function removeText(id:String):void {
			var tobjData:Array = getGobjInfoWithID(id);
			var removeIndex:int = tobjData[0];
			var tobjToRemove:TextObject = tobjData[1] as TextObject;
			wbCanvas.removeGraphic(tobjToRemove);
			graphicList.splice(removeIndex, 1);
		}	
		
		/* returns an array of the GraphicObject that has the specified id,
		 and the index of that GraphicObject (if it exists, of course) 
		*/
		private function getGobjInfoWithID(id:String):Array {	
			var data:Array = new Array();
			for(var i:int = 0; i < graphicList.length; i++) {
				var currObj:GraphicObject = graphicList[i] as GraphicObject;
				if(currObj.getGraphicID() == id) {
					data.push(i);
					data.push(currObj);
					return data;
				}
			}
			return null;
		}

		private function removeLastGraphic():void {
			var gobj:GraphicObject = graphicList.pop();
			if(gobj.getGraphicType() == WhiteboardConstants.TYPE_TEXT) {
				(gobj as TextObject).makeEditable(false);
//				(gobj as TextObject).deregisterListeners(textObjGainedFocusListener, textObjLostFocusListener, textObjTextListener, textObjSpecialListener);
			}	
			wbCanvas.removeGraphic(gobj as DisplayObject);
		}

		// returns all DrawObjects in graphicList
		private function getAllShapes():Array {
			var shapes:Array = new Array();
			for(var i:int = 0; i < graphicList.length; i++) {
				var currGobj:GraphicObject = graphicList[i];
				if(currGobj.getGraphicType() == WhiteboardConstants.TYPE_SHAPE) {
					shapes.push(currGobj as DrawObject);
				}
			}
			return shapes;
		}
		
		// returns all TextObjects in graphicList
		private function getAllTexts():Array {
			var texts:Array = new Array();
			for(var i:int = 0; i < graphicList.length; i++) {
				var currGobj:GraphicObject = graphicList[i];
				if(currGobj.getGraphicType() == WhiteboardConstants.TYPE_TEXT) {
					texts.push(currGobj as TextObject)
				}
			}
			return texts;
		}
		
		public function clearBoard(event:WhiteboardUpdate = null):void {
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
/*			var page:Number = e.pageNum;
			var graphicObjs:ArrayCollection = e.graphicObjs;

			clearBoard();
			for (var i:int = 0; i < graphicObjs.length; i++){
				var o:GraphicObject = graphicObjs.getItemAt(i) as GraphicObject;
				if(o.getGraphicType() == WhiteboardConstants.TYPE_SHAPE)
					drawShape(o as DrawObject, true);
				else if(o.getGraphicType() == WhiteboardConstants.TYPE_TEXT) 
					drawText(o as TextObject, true);	
			}
			
			if(isPresenter) {
				var evt:GraphicObjectFocusEvent = new GraphicObjectFocusEvent(GraphicObjectFocusEvent.OBJECT_DESELECTED);
				evt.data = null;
				wbCanvas.dispatchEvent(evt);
			}
*/		}
		
		public function zoomCanvas(width:Number, height:Number):void{
			shapeFactory.setParentDim(width, height);	
			this.width = width;
			this.height = height;

			for (var i:int = 0; i < this.graphicList.length; i++){
				redrawGraphic(this.graphicList[i] as GraphicObject, i);
			}		
		}
				
		/* called when a user is made presenter, automatically make all the textfields currently on the page editable, so that they can edit it. */
		public function makeTextObjectsEditable(e:MadePresenterEvent):void {
//			var texts:Array = getAllTexts();
//			for(var i:int = 0; i < texts.length; i++) {
//				(texts[i] as TextObject).makeEditable(true);
//				(texts[i] as TextObject).registerListeners(textObjGainedFocusListener, textObjLostFocusListener, textObjTextListener, textObjSpecialListener);
//			}
		}
		
		/* when a user is made viewer, automatically make all the textfields currently on the page uneditable, so that they cannot edit it any
		   further and so that only the presenter can edit it.
		*/
		public function makeTextObjectsUneditable(e:MadePresenterEvent):void {
			LogUtil.debug("MADE PRESENTER IS PRESENTER FALSE");
//			var texts:Array = getAllTexts();
//			for(var i:int = 0; i < texts.length; i++) {
//				(texts[i] as TextObject).makeEditable(false);
//				(texts[i] as TextObject).deregisterListeners(textObjGainedFocusListener, textObjLostFocusListener, textObjTextListener, textObjSpecialListener);
//			}
		}


		
		private function redrawGraphic(gobj:GraphicObject, objIndex:int):void {
			if(gobj.getGraphicType() == WhiteboardConstants.TYPE_SHAPE) {
				var origDobj:DrawObject = gobj as DrawObject;
				wbCanvas.removeGraphic(origDobj);
				origDobj.graphics.clear();
				var dobj:DrawObject =  shapeFactory.makeShape(origDobj);
				dobj.setGraphicID(origDobj.getGraphicID());
				dobj.status = origDobj.status;
				wbCanvas.addGraphic(dobj);
				graphicList[objIndex] = dobj;
			} else if(gobj.getGraphicType() == WhiteboardConstants.TYPE_TEXT) {
                var origTobj:TextObject = gobj as TextObject;
//                wbCanvas.removeGraphic(origTobj);
//                origTobj.graphics.clear();
//                var tobj:TextObject =  shapeFactory.makeTextObject(origTobj);
 //               tobj.setGraphicID(origTobj.getGraphicID());
 //               tobj.status = origTobj.status;
 //               wbCanvas.addGraphic(tobj);
 //               graphicList[objIndex] = tobj;
			}
		}
		
		public function isPageEmpty():Boolean {
			return graphicList.length == 0;
		}
		
        /** Helper method to test whether this user is the presenter */
        private function get isPresenter():Boolean {
            return UserManager.getInstance().getConference().amIPresenter();
        }
	}
}
