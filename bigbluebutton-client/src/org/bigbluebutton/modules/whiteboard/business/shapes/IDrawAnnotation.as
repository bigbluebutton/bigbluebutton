package org.bigbluebutton.modules.whiteboard.business.shapes
{
    import org.bigbluebutton.modules.whiteboard.models.Annotation;
    import org.bigbluebutton.modules.whiteboard.models.WhiteboardModel;

    public interface IDrawAnnotation
    {
        function createAnnotation(wbModel:WhiteboardModel, ctrlKeyPressed:Boolean=false):Annotation;
    }
}