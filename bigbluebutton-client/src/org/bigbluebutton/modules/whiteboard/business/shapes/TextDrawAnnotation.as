package org.bigbluebutton.modules.whiteboard.business.shapes
{
  import org.bigbluebutton.modules.whiteboard.models.Annotation;
  import org.bigbluebutton.modules.whiteboard.models.WhiteboardModel;

  public class TextDrawAnnotation extends DrawAnnotation
  {
    private var _type:String = DrawObject.TEXT;
    private var _text:String;
    private var _textBoxWidth:Number = 0;
    private var _textBoxHeight:Number = 0;
    private var _x:Number;
    private var _y:Number;
    private var _fontColor:uint;
    private var _fontStyle:String = "arial";
    private var _fontSize:Number;
    private var _calcedFontSize:Number;
    
    public function TextDrawAnnotation(text:String, color:uint, x:Number, y:Number, width:Number, 
                                       height:Number, fontSize:Number, calcedFontSize:Number)
    {
      _text = text;
      _fontColor = color;
      _x = x;
      _y = y;
      _textBoxWidth = width;
      _textBoxHeight = height;
      _fontSize = fontSize;
      _calcedFontSize = calcedFontSize;
    }
        
    override public function createAnnotation(wbModel:WhiteboardModel, ctrlKeyPressed:Boolean=false):Annotation {
      var ao:Object = new Object();
      ao["type"] = DrawObject.TEXT;
      ao["id"] = _id;
      ao["status"] = _status;  
      ao["text"] = _text;
      ao["fontColor"] = _fontColor;
      ao["x"] = _x;
      ao["y"] = _y;
	  ao["dataPoints"] = _x + "," + _y;
      ao["fontSize"] = _fontSize;
      ao["calcedFontSize"] = _calcedFontSize;
      ao["textBoxWidth"] = _textBoxWidth;
      ao["textBoxHeight"] = _textBoxHeight;
            
      var pn:Object = wbModel.getCurrentPresentationAndPage();
      if (pn != null) {
        ao["presentationID"] = pn.presentationID;
        ao["pageNumber"] = pn.currentPageNumber;
      }
            
      return new Annotation(_id, DrawObject.TEXT, ao);
    }
  }
}