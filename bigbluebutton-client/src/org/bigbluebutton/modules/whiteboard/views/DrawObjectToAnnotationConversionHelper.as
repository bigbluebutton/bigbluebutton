package org.bigbluebutton.modules.whiteboard.views
{
    import org.bigbluebutton.modules.whiteboard.business.shapes.GraphicObject;
    import org.bigbluebutton.modules.whiteboard.models.Annotation;

    /**
    *  A helper class that converts a DrawObject into Annotation with
    * an Object suitable for sending to the server. This prevents us from
    * sending invalid data.
    */
    public class DrawObjectToAnnotationConversionHelper
    {
        public function DrawObjectToAnnotationConversionHelper()
        {
        }
        
        public function convert(dobj:GraphicObject):Annotation {
            var annotation:Annotation = new Annotation("todo", "todo", null);
            return annotation;
        }
    }
}