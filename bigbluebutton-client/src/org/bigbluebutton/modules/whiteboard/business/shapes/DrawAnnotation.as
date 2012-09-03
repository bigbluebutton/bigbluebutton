package org.bigbluebutton.modules.whiteboard.business.shapes
{
    import org.bigbluebutton.modules.whiteboard.models.Annotation;
    import org.bigbluebutton.modules.whiteboard.models.WhiteboardModel;

    public class DrawAnnotation implements IDrawAnnotation
    {
        protected var _id:String;
        protected var _status:String;
        
        public function set id(id:String):void {
            _id = id;
        }
        
        public function set status(s:String):void {
            _status = s;
        }
        
        public function createAnnotation(wbModel:WhiteboardModel, 
                                         ctrlKeyPressed:Boolean=false):Annotation {return null}
    }
}