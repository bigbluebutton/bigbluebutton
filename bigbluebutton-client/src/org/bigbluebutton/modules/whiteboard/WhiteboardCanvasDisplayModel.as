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
package org.bigbluebutton.modules.whiteboard
{
  import flash.display.DisplayObject;
  import flash.events.Event;
  import flash.events.FocusEvent;
  import flash.events.KeyboardEvent;
  import flash.ui.Keyboard;
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.common.IBbbCanvas;
  import org.bigbluebutton.core.managers.UserManager;
  import org.bigbluebutton.main.events.MadePresenterEvent;
  import org.bigbluebutton.modules.present.events.NavigationEvent;
  import org.bigbluebutton.modules.whiteboard.business.shapes.DrawObject;
  import org.bigbluebutton.modules.whiteboard.business.shapes.GraphicFactory;
  import org.bigbluebutton.modules.whiteboard.business.shapes.GraphicObject;
  import org.bigbluebutton.modules.whiteboard.business.shapes.ShapeFactory;
  import org.bigbluebutton.modules.whiteboard.business.shapes.TextObject;
  import org.bigbluebutton.modules.whiteboard.business.shapes.WhiteboardConstants;
  import org.bigbluebutton.modules.whiteboard.events.GraphicObjectFocusEvent;
  import org.bigbluebutton.modules.whiteboard.events.WhiteboardDrawEvent;
  import org.bigbluebutton.modules.whiteboard.events.WhiteboardUpdate;
  import org.bigbluebutton.modules.whiteboard.models.Annotation;
  import org.bigbluebutton.modules.whiteboard.models.WhiteboardModel;
  import org.bigbluebutton.modules.whiteboard.views.WhiteboardCanvas;
  
    /**
    * Class to handle displaying of received annotations from the server.
    */
  public class WhiteboardCanvasDisplayModel {
	private static const LOGGER:ILogger = getClassLogger(WhiteboardCanvasDisplayModel);
    
    public var whiteboardModel:WhiteboardModel;
    public var wbCanvas:WhiteboardCanvas;  
    private var _annotationsList:Array = new Array();
    private var shapeFactory:ShapeFactory = new ShapeFactory();
    private var currentlySelectedTextObject:TextObject =  null;
        
    private var bbbCanvas:IBbbCanvas;
    private var width:Number;
    private var height:Number;
            
	private var zoomPercentage:Number = 1;
	
    public function doMouseDown(mouseX:Number, mouseY:Number):void {
      publishText();
    }
    
    private function publishText():void {
      /**
       * Check if the presenter is starting a new text annotation without committing the last one.
       * If so, publish the last text annotation. 
       */
      if (currentlySelectedTextObject != null && currentlySelectedTextObject.status != TextObject.TEXT_PUBLISHED) {
        sendTextToServer(TextObject.TEXT_PUBLISHED, currentlySelectedTextObject);
      }
    }
    
    public function drawGraphic(event:WhiteboardUpdate):void{
      var o:Annotation = event.annotation;
      //  LogUtil.debug("**** Drawing graphic [" + o.type + "] *****");
      if (o.type != DrawObject.TEXT) {    
        var dobj:DrawObject;
        switch (o.status) {
          case DrawObject.DRAW_START:
            dobj = shapeFactory.makeDrawObject(o, whiteboardModel);  
            if (dobj != null) {
              dobj.draw(o, shapeFactory.parentWidth, shapeFactory.parentHeight, zoomPercentage);
              wbCanvas.addGraphic(dobj);
              _annotationsList.push(dobj);              
            }
            break;
          case DrawObject.DRAW_UPDATE:
          case DrawObject.DRAW_END:
            if (_annotationsList.length > 0) {
              var gobj:Object = _annotationsList.pop();
              if (gobj.id == o.id) {
                // LogUtil.debug("Removing shape [" + gobj.id + "]");
                wbCanvas.removeGraphic(gobj as DisplayObject);
              } else { // no DRAW_START event was thrown for o so place gobj back on the top
                _annotationsList.push(gobj);
              }              
            }
                 
            dobj = shapeFactory.makeDrawObject(o, whiteboardModel);  
            if (dobj != null) {
              dobj.draw(o, shapeFactory.parentWidth, shapeFactory.parentHeight, zoomPercentage);
              wbCanvas.addGraphic(dobj);
              _annotationsList.push(dobj);              
            }
            break;
        }                   
      } else { 
        drawText(o);  
      }
    }
                   
    // Draws a TextObject when/if it is received from the server
    private function drawText(o:Annotation):void {    
      switch (o.status) {
        case TextObject.TEXT_CREATED:
          if (isPresenter)
            addPresenterText(o, true);
          else
            addNormalText(o);                            
          break;
        case TextObject.TEXT_UPDATED:
          if (!isPresenter) {
                        modifyText(o);
          }   
          break;
        case TextObject.TEXT_PUBLISHED:
          modifyText(o);
          // Inform others that we are done with listening for events and that they should re-listen for keyboard events. 
          if (isPresenter) {
            bindToKeyboardEvents(true);
            wbCanvas.stage.focus = null;
            currentlySelectedTextObject = null;
          }
          break;
      }        
    }
        
    /* adds a new TextObject that is suited for a presenter. For example, it will be made editable and the appropriate listeners will be registered so that
    the required events will be dispatched  */
    private function addPresenterText(o:Annotation, background:Boolean=false):void {
      if (!isPresenter) return;
            
            /**
            * We will not be listening for keyboard events to input texts. Tell others to not listen for these events. For example, the presentation module
            * listens for Keyboard.ENTER, Keyboard.SPACE to advance the slides. We don't want that while the presenter is typing texts.
            */
            bindToKeyboardEvents(false);
      
            var tobj:TextObject = shapeFactory.makeTextObject(o);
            tobj.setGraphicID(o.id);
            tobj.status = o.status;
      tobj.multiline = true;
      tobj.wordWrap = true;
            
      if (background) {
                tobj.makeEditable(true);
                tobj.border = true;
        tobj.background = true;
        tobj.backgroundColor = 0xFFFFFF;                
      }
      
      tobj.registerListeners(textObjGainedFocusListener, textObjLostFocusListener, textObjTextChangeListener, textObjSpecialListener);
      
      tobj._whiteboardID = whiteboardModel.getCurrentWhiteboardId();
      
      wbCanvas.addGraphic(tobj);
      wbCanvas.stage.focus = tobj;
            _annotationsList.push(tobj);
                       
    }
    
    /* adds a new TextObject that is suited for a viewer. For example, it will not
    be made editable and no listeners need to be attached because the viewers
    should not be able to edit/modify the TextObject 
    */
    private function addNormalText(o:Annotation):void {
            var tobj:TextObject = shapeFactory.makeTextObject(o);
            tobj.setGraphicID(o.id);
            tobj.status = o.status;
      tobj.multiline = true;
      tobj.wordWrap = true;
      tobj.background = false;
      tobj.makeEditable(false);
      wbCanvas.addGraphic(tobj);
            _annotationsList.push(tobj);
    }
    
    private function removeText(id:String):void {
      var tobjData:Array = getGobjInfoWithID(id);
      if (tobjData != null) {
        var removeIndex:int = tobjData[0];
        var tobjToRemove:TextObject = tobjData[1] as TextObject;
        wbCanvas.removeGraphic(tobjToRemove);
        _annotationsList.splice(removeIndex, 1);
      }
    }  
    
    /* method to modify a TextObject that is already present on the whiteboard, as opposed to adding a new TextObject to the whiteboard */
    private function modifyText(o:Annotation):void {
      removeText(o.id);
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
            _annotationsList.splice(removeIndex, 1);
    }  
    
    private function removeShape(id:String):void {
      var dobjData:Array = getGobjInfoWithID(id);
      var removeIndex:int = dobjData[0];
      var dobjToRemove:DrawObject = dobjData[1] as DrawObject;
      wbCanvas.removeGraphic(dobjToRemove);
            _annotationsList.splice(removeIndex, 1);
    }
    
    /* returns an array of the GraphicObject that has the specified id,
    and the index of that GraphicObject (if it exists, of course) 
    */
    private function getGobjInfoWithID(id:String):Array {  
      var data:Array = new Array();
      for(var i:int = 0; i < _annotationsList.length; i++) {
        var currObj:GraphicObject = _annotationsList[i] as GraphicObject;
        if(currObj.id == id) {
          data.push(i);
          data.push(currObj);
          return data;
        }
      }
      return null;
    }
    
    private function removeLastGraphic():void {
      var gobj:GraphicObject = _annotationsList.pop();
      if (gobj.type == WhiteboardConstants.TYPE_TEXT) {
        (gobj as TextObject).makeEditable(false);
        (gobj as TextObject).deregisterListeners(textObjGainedFocusListener, textObjLostFocusListener, textObjTextChangeListener, textObjSpecialListener);
      }  
      wbCanvas.removeGraphic(gobj as DisplayObject);
    }
    
    // returns all DrawObjects in graphicList
    private function getAllShapes():Array {
      var shapes:Array = new Array();
      for(var i:int = 0; i < _annotationsList.length; i++) {
        var currGobj:GraphicObject = _annotationsList[i];
        if(currGobj.type == WhiteboardConstants.TYPE_SHAPE) {
          shapes.push(currGobj as DrawObject);
        }
      }
      return shapes;
    }
    
    // returns all TextObjects in graphicList
    private function getAllTexts():Array {
      var texts:Array = new Array();
      for(var i:int = 0; i < _annotationsList.length; i++) {
        var currGobj:GraphicObject = _annotationsList[i];
        if(currGobj.type == WhiteboardConstants.TYPE_TEXT) {
          texts.push(currGobj as TextObject)
        }
      }
      return texts;
    }
    
    public function clearBoard(event:WhiteboardUpdate = null):void {
      var numGraphics:int = this._annotationsList.length;
      for (var i:Number = 0; i < numGraphics; i++){
        removeLastGraphic();
      }
      wbCanvas.textToolbar.visible = false;
    }
    
    public function undoAnnotation(id:String):void {
      /** We'll just remove the last annotation for now **/
      if (this._annotationsList.length > 0) {
        removeLastGraphic();
      }
    }
        
    public function receivedAnnotationsHistory(wbId:String):void {
      var annotations:Array = whiteboardModel.getAnnotations(wbId);
      for (var i:int = 0; i < annotations.length; i++) {
        var an:Annotation = annotations[i] as Annotation;
        if ( an.type != DrawObject.TEXT) {
           var dobj:DrawObject = shapeFactory.makeDrawObject(an, whiteboardModel);  
           if (dobj != null) {
              dobj.draw(an, shapeFactory.parentWidth, shapeFactory.parentHeight, zoomPercentage);
              wbCanvas.addGraphic(dobj);
              _annotationsList.push(dobj);              
           }        
        } else { 
          if (an.annotation.text != "") {
              addNormalText(an);     
          }
        }             
      }
            
      if (_annotationsList.length > 0) {
        for (var ij:int = 0; ij < this._annotationsList.length; ij++){
          redrawGraphic(this._annotationsList[ij] as GraphicObject, ij);
        }                
        }
      }

        /*********************************************************
        * HACK! HACK! HACK! HACK! HACK! HACK! HACK! HACK! HACK! 
        * To tell us that the Whiteboard Canvas has been overlayed into the Presentation Canvas.
        * The problem was that latecomers query for annotations history before the Whiteboard Canvas has
        * been overlayed on top of the presentation canvas. When we receive the history and try to
        * display the TEXT annotation, the text will be very small because when we calculate the font size,
        * the value for the canvas width and height is still zero.
        * 
        * We need to setup the sequence of whiteboard startup properly to handle latecomers but this will
        * do for now.
        */
        private var wbCanvasInitialized:Boolean = false;
        public function parentCanvasInitialized():void {
            wbCanvasInitialized = true;
        }
        
        public function get canvasInited():Boolean {
            return wbCanvasInitialized;
        }
        
        /**********************************************************/
        
        public function changePage(wbId:String):void{
            publishText();
            
//            LogUtil.debug("**** CanvasDisplay changePage. Clearing page *****");
            clearBoard();
            
            var annotations:Array = whiteboardModel.getAnnotations(wbId);
//            LogUtil.debug("**** CanvasDisplay changePage [" + annotations.length + "] *****");
            if (annotations.length == 0) {
                /***
                * Check if the whiteboard canvas has already been overlayed into the presentation canvas.
                * If not, don't query for history. The overlay canvas event will trigger the querying of
                * the history.
                */
                if (wbCanvasInitialized) wbCanvas.queryForAnnotationHistory(wbId);
            } else {
                for (var i:int = 0; i < annotations.length; i++) {
                    var an:Annotation = annotations[i] as Annotation;
                    // LogUtil.debug("**** Drawing graphic from changePage [" + an.type + "] *****");
                    if(an.type != DrawObject.TEXT) {
                        var dobj:DrawObject = shapeFactory.makeDrawObject(an, whiteboardModel);  
                        if (dobj != null) {
                            dobj.draw(an, shapeFactory.parentWidth, shapeFactory.parentHeight, zoomPercentage);
                            wbCanvas.addGraphic(dobj);
                            _annotationsList.push(dobj);              
                        }      
                    } else { 
                        addNormalText(an);        
                    }              
                }  
                
                for (var ij:int = 0; ij < this._annotationsList.length; ij++){
                    redrawGraphic(this._annotationsList[ij] as GraphicObject, ij);
                }
            }
        }
    
    public function zoomCanvas(width:Number, height:Number, zoom:Number):void{
	    zoomPercentage = zoom / 100;
      shapeFactory.setParentDim(width, height);  
      this.width = width;
      this.height = height;

      for (var i:int = 0; i < this._annotationsList.length; i++){
          redrawGraphic(this._annotationsList[i] as GraphicObject, i);
      }
      wbCanvas.textToolbar.visible = false;
    }
        
    /* called when a user is made presenter, automatically make all the textfields currently on the page editable, so that they can edit it. */
    public function makeTextObjectsEditable(e:MadePresenterEvent):void {
//      var texts:Array = getAllTexts();
//      for(var i:int = 0; i < texts.length; i++) {
//        (texts[i] as TextObject).makeEditable(true);
//        (texts[i] as TextObject).registerListeners(textObjGainedFocusListener, textObjLostFocusListener, textObjTextListener, textObjSpecialListener);
//      }
    }
    
    /* when a user is made viewer, automatically make all the textfields currently on the page uneditable, so that they cannot edit it any
       further and so that only the presenter can edit it.
    */
    public function makeTextObjectsUneditable(e:MadePresenterEvent):void {
//      var texts:Array = getAllTexts();
//      for(var i:int = 0; i < texts.length; i++) {
//        (texts[i] as TextObject).makeEditable(false);
//        (texts[i] as TextObject).deregisterListeners(textObjGainedFocusListener, textObjLostFocusListener, textObjTextListener, textObjSpecialListener);
//      }
    }
  
    private function redrawGraphic(gobj:GraphicObject, objIndex:int):void {
            var o:Annotation;
            if (gobj.type != DrawObject.TEXT) {
                wbCanvas.removeGraphic(gobj as DisplayObject);
                o = whiteboardModel.getAnnotation(gobj.id);
                
                if (o != null) {
                    var dobj:DrawObject = shapeFactory.makeDrawObject(o, whiteboardModel);  
                    if (dobj != null) {
                        dobj.draw(o, shapeFactory.parentWidth, shapeFactory.parentHeight, zoomPercentage);
                        wbCanvas.addGraphic(dobj);
                        _annotationsList[objIndex] = dobj;              
                    }          
                }
            } else if(gobj.type == WhiteboardConstants.TYPE_TEXT) {
                var origTobj:TextObject = gobj as TextObject;                
                var an:Annotation = whiteboardModel.getAnnotation(origTobj.id);
                if (an != null) {
                  wbCanvas.removeGraphic(origTobj as DisplayObject);
                  //          addNormalText(an);
                  var tobj:TextObject = shapeFactory.redrawTextObject(an, origTobj);
                  tobj.setGraphicID(origTobj.id);
                  tobj.status = origTobj.status;
                  tobj.multiline = true;
                  tobj.wordWrap = true;
                  tobj.background = false;
                  tobj.makeEditable(false);
                  tobj.background = false;          
                  wbCanvas.addGraphic(tobj);
                  _annotationsList[objIndex] = tobj;
                }            
      }
    }
        
    /**************************************************************************************************************************************
        * The following methods handles the presenter typing text into the textbox. The challenge here is how to maintain focus
        * on the textbox while the presenter changes the size of the font and color.
        * 
        * The text annotation will have 3 states (CREATED, EDITED, PUBLISHED). When the presenter creates a textbox, the other
        * users are notified and the text annotation is in the CREATED state. The presenter can then type text, change size, font and 
        * the other users are updated. This is the EDITED state. When the presented hits the ENTER/RETURN key, the text is committed/published.
        * 
        */
    public function textObjSpecialListener(event:KeyboardEvent):void {
      // check for special conditions
      if (event.keyCode  == Keyboard.DELETE || event.keyCode  == Keyboard.BACKSPACE || event.keyCode  == Keyboard.ENTER) { 
        var sendStatus:String = TextObject.TEXT_UPDATED;
        var tobj:TextObject = event.target as TextObject;  
        sendTextToServer(sendStatus, tobj);  
      }
      // stops stops page changing when trying to navigate the text box
      if (event.keyCode == Keyboard.LEFT || event.keyCode == Keyboard.RIGHT) {
        event.stopPropagation();
      }
    }
    
        public function textObjTextChangeListener(event:Event):void {
            // The text is being edited. Notify others to update the text.
            var sendStatus:String = TextObject.TEXT_UPDATED;
            var tf:TextObject = event.target as TextObject;  
            sendTextToServer(sendStatus, tf);  
        }
            
    public function textObjGainedFocusListener(event:FocusEvent):void {
//      LogUtil.debug("### GAINED FOCUS ");
            // The presenter is ready to type in the text. Maintain focus to this textbox until the presenter hits the ENTER/RETURN key.
            maintainFocusToTextBox(event);
    }
    
    public function textObjLostFocusListener(event:FocusEvent):void {
//      LogUtil.debug("### LOST FOCUS ");
            // The presenter is moving the mouse away from the textbox. Perhaps to change the size and color of the text.
            // Maintain focus to this textbox until the presenter hits the ENTER/RETURN key.
            maintainFocusToTextBox(event);
    }
    
        private function maintainFocusToTextBox(event:FocusEvent):void {
            var tf:TextObject = event.currentTarget as TextObject;
            if (wbCanvas.stage.focus != tf) wbCanvas.stage.focus = tf;
            if (tf.stage.focus != tf) tf.stage.focus = tf;
            currentlySelectedTextObject = tf;
            var e:GraphicObjectFocusEvent = new GraphicObjectFocusEvent(GraphicObjectFocusEvent.OBJECT_SELECTED);
            e.data = tf;
            wbCanvas.dispatchEvent(e);            
        }
        
    public function modifySelectedTextObject(textColor:uint, bgColorVisible:Boolean, backgroundColor:uint, textSize:Number):void {
            // The presenter has changed the color or size of the text. Notify others of these change.
      currentlySelectedTextObject.textColor = textColor;
      currentlySelectedTextObject.textSize = textSize;
      currentlySelectedTextObject.applyFormatting();
      sendTextToServer(TextObject.TEXT_UPDATED, currentlySelectedTextObject);
    }
  
        /***************************************************************************************************************************************/
        
        /***
        * Tell others that it's ok for them to rebind to keyboard events as we are done with listening for keyboard events as
        * input to the text annotation.
        */
        private function bindToKeyboardEvents(bindToEvents:Boolean):void {
            var navEvent:NavigationEvent = new NavigationEvent(NavigationEvent.BIND_KEYBOARD_EVENT);
            navEvent.bindToKeyboard = bindToEvents;
            wbCanvas.dispatchEvent(navEvent);            
        }
        
    private function sendTextToServer(status:String, tobj:TextObject):void {
      switch (status) {
        case TextObject.TEXT_CREATED:
          tobj.status = TextObject.TEXT_CREATED;
          break;
        case TextObject.TEXT_UPDATED:
          tobj.status = TextObject.TEXT_UPDATED;
          break;
        case TextObject.TEXT_PUBLISHED:
          tobj.status = TextObject.TEXT_PUBLISHED;
          break;
      }  
            
      if (status == TextObject.TEXT_PUBLISHED) {
          tobj.deregisterListeners(textObjGainedFocusListener, textObjLostFocusListener, textObjTextChangeListener, textObjSpecialListener);
          var e:GraphicObjectFocusEvent = new GraphicObjectFocusEvent(GraphicObjectFocusEvent.OBJECT_DESELECTED);
          e.data = tobj;
          wbCanvas.dispatchEvent(e);   
                             
      }

//      LogUtil.debug("SENDING TEXT: [" + tobj.textSize + "]");
      
      var annotation:Object = new Object();
      annotation["type"] = "text";
      annotation["id"] = tobj.id;
      annotation["status"] = tobj.status;  
      annotation["text"] = tobj.text;
      annotation["fontColor"] = tobj.textColor;
      annotation["backgroundColor"] = tobj.backgroundColor;
      annotation["background"] = tobj.background;
      annotation["x"] = tobj.getOrigX();
      annotation["y"] = tobj.getOrigY();
	    annotation["dataPoints"] = tobj.getOrigX() + "," +tobj.getOrigY();
      annotation["fontSize"] = tobj.textSize;
      annotation["calcedFontSize"] = GraphicFactory.normalize(tobj.textSize, shapeFactory.parentHeight);
      annotation["textBoxWidth"] = tobj.textBoxWidth;
      annotation["textBoxHeight"] = tobj.textBoxHeight;
      
      if (tobj._whiteboardID != null) {
        annotation["whiteboardId"] = tobj._whiteboardID;        
        var msg:Annotation = new Annotation(tobj.id, "text", annotation);
        wbCanvas.sendGraphicToServer(msg, WhiteboardDrawEvent.SEND_TEXT);
      }
      

      
/*      
      var tan:TextDrawAnnotation = shapeFactory.createTextObject(tobj.text, tobj.textColor, 
        tobj.getOrigX(), tobj.getOrigY(), tobj.textBoxWidth, tobj.textBoxHeight, tobj.textSize);
      tan.id = tobj.id;
      tan.status = tobj.status; 
      wbCanvas.sendGraphicToServer(tan.createAnnotation(whiteboardModel), WhiteboardDrawEvent.SEND_TEXT);
*/      
      
    }
    
    public function isPageEmpty():Boolean {
      return _annotationsList.length == 0;
    }
    
        /** Helper method to test whether this user is the presenter */
        private function get isPresenter():Boolean {
            return UserManager.getInstance().getConference().amIPresenter;
        }
  }
}
