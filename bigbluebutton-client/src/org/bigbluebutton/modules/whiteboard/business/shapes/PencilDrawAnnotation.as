package org.bigbluebutton.modules.whiteboard.business.shapes
{
    import org.bigbluebutton.modules.whiteboard.models.Annotation;
    import org.bigbluebutton.modules.whiteboard.models.WhiteboardModel;

    public class PencilDrawAnnotation extends DrawAnnotation
    {
        private var _type:String = DrawObject.PENCIL;
        private var _shape:Array;
        private var _color:uint;
        private var _fillColor:uint;
        private var _thickness:uint;
        private var _fill:Boolean;
        private var _transparent:Boolean;

        
        public function PencilDrawAnnotation(segment:Array, color:uint, thickness:uint, trans:Boolean)
        {
            _shape = segment;
            _color = color;
            _thickness = thickness;
            _transparent = trans;
        }
               
        override public function createAnnotation(wbModel:WhiteboardModel, ctrlKeyPressed:Boolean=false):Annotation {
            var ao:Object = new Object();
            ao["type"] = _type;
            ao["points"] = _shape;
            ao["color"] = _color;
            ao["thickness"] = _thickness;
            ao["id"] = _id;
            ao["status"] = _status;
            ao["transparency"] = _transparent;

            var pn:Object = wbModel.getCurrentPresentationAndPage();
            if (pn != null) {
              ao["presentationID"] = pn.presentationID;
              ao["pageNumber"] = pn.currentPageNumber;
            }
            
            return new Annotation(_id, _type, ao);
        }
    }
}