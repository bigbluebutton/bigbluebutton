package org.bigbluebutton.core.model
{
    import flash.events.IEventDispatcher;
    
    import org.bigbluebutton.common.LogUtil;
    import org.bigbluebutton.core.controllers.events.UserAuthenticatedEvent;
    import org.bigbluebutton.core.vo.UserSession;

    public class UsersModel
    {
       private var _loggedInUser:UserSession;       
       private var _dispatcher:IEventDispatcher;
       
       public function UsersModel(dispatcher:IEventDispatcher) {
           _dispatcher = dispatcher;
       }
       
       public function set loggedInUser(user:UserSession):void {
           LogUtil.debug("User has logged in.");
           _loggedInUser = user;
           var event:UserAuthenticatedEvent = new UserAuthenticatedEvent();
           _dispatcher.dispatchEvent(event);
       }
       
       public function get loggedInUser():UserSession {
           return _loggedInUser;
       }
    }
}