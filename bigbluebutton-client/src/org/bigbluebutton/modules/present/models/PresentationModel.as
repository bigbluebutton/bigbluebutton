package org.bigbluebutton.modules.present.models
{
    import flash.events.IEventDispatcher;
    
    import mx.collections.ArrayCollection;

    public class PresentationModel
    {
        private var _presentations:ArrayCollection = new ArrayCollection();
        
        private var _dispatcher:IEventDispatcher;
        
        public function PresentationModel(dispatcher:IEventDispatcher)
        {
            _dispatcher = dispatcher;
        }
        
        public function addPresentation(id:String):void {
//            var p:Presentation = new Presentation(id);
 //           _presentations.addItem(p);
        }
        
        
    }
}