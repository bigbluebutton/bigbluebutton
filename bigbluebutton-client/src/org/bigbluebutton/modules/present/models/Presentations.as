package org.bigbluebutton.modules.present.models
{
    import flash.events.IEventDispatcher;
    import flash.utils.Dictionary;

    public class Presentations
    {
        private var _presentations:Dictionary = new Dictionary();
        private var _currentPresentation:Presentation;
        
        private var _dispatcher:IEventDispatcher;
        
        public function Presentations(dispatcher:IEventDispatcher)
        {    
            _dispatcher = dispatcher;
        }
        
    }
}