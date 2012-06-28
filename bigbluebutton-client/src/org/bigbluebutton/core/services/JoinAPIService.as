package org.bigbluebutton.core.services
{
    import flash.events.Event;
    import flash.events.IEventDispatcher;
    import flash.events.IOErrorEvent;
    import flash.events.SecurityErrorEvent;
    import flash.net.URLLoader;
    import flash.net.URLRequest;
    
    import org.bigbluebutton.common.LogUtil;
    import org.bigbluebutton.core.controllers.events.JoinErrorEvent;
    import org.bigbluebutton.core.model.UsersModel;

    public class JoinAPIService
    {
        private static const LOCALES_FILE:String = "conf/config.xml";
        private var _dispatcher:IEventDispatcher;
        private var _users:UsersModel;
        
        public function JoinAPIService(users:UsersModel, dispatcher:IEventDispatcher) {
            _dispatcher = dispatcher;
            _users = users;
        }
        
        public function join(uri:String):void {                       
            var _urlLoader:URLLoader = new URLLoader();
            _urlLoader.addEventListener(Event.COMPLETE, handleComplete);
            _urlLoader.addEventListener(IOErrorEvent.IO_ERROR, handleIOErrorEvent);
            _urlLoader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, handleSecurityErrorEvent);
            
            // Add a random string on the query so that we always get an up-to-date config.xml
            var date:Date = new Date();            
            LogUtil.debug("Joining uri="+ uri);
            _urlLoader.load(new URLRequest(uri + "?a=" + date.time));
        }
        
        private function handleComplete(e:Event):void {
            var _joinParser:JoinAPIServiceXMLParser = new JoinAPIServiceXMLParser();
            _joinParser.parseJoinServiceResult(new XML(e.target.data), _dispatcher, _users);
        }
        
        private function handleIOErrorEvent(e: Event):void {
            _dispatcher.dispatchEvent(new JoinErrorEvent());
        }
        
        private function handleSecurityErrorEvent(e: Event):void {
            _dispatcher.dispatchEvent(new JoinErrorEvent())
        }
    }
}