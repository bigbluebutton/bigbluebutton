package org.bigbluebutton.modules.whiteboard.views.models
{
    import org.bigbluebutton.modules.whiteboard.business.shapes.DrawObject;
    import org.bigbluebutton.modules.whiteboard.business.shapes.WhiteboardConstants;

    /**
    * Class that holds all properties of the currently selected whiteboard tool.
    */
    public class WhiteboardTool
    {
        public var graphicType:String = WhiteboardConstants.TYPE_SHAPE;
        public var toolType:String = DrawObject.PENCIL;
        public var drawColor:uint = 0x000000;
        public var fillColor:uint = 0x000000;
        public var thickness:uint = 1;       
        public var _fontStyle:String = "_sans";
        public var _fontSize:Number = 18;
        public var _textText:String = "Hello BBB!";        
        public var fillOn:Boolean = false;
        public var transparencyOn:Boolean = false;
    }
}