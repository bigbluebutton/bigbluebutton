package org.bigbluebutton.core.services
{
    import flash.events.IEventDispatcher;
    
    import org.bigbluebutton.common.LogUtil;
    import org.bigbluebutton.core.controllers.events.FailedToJoinEvent;
    import org.bigbluebutton.core.model.UsersModel;
    import org.bigbluebutton.core.vo.UserSession;

    public class JoinAPIServiceXMLParser
    {       
        public function parseJoinServiceResult(xml:XML, dispatcher:IEventDispatcher, users:UsersModel):void {
            var returncode:String = xml.returncode;
            if (returncode == 'FAILED') {
                LogUtil.debug("Failed to join the conference.");
                var event:FailedToJoinEvent = new FailedToJoinEvent();
                event.logoutURL = xml.logoutURL;
                dispatcher.dispatchEvent(event);                
            } else if (returncode == 'SUCCESS') {                
                var user:UserSession = new UserSession();                     
                user.username = xml.fullname;
                user.conference = xml.conference;
                user.conferenceName = xml.confname;
                user.meetingID = xml.meetingID;
                user.externUserID = xml.externUserID;
                user.internalUserID = xml.internalUserId;
                user.role = xml.role;
                user.room = xml.room;
                user.authToken = xml.room;
                user.record = xml.record as Boolean;
                user.webvoiceconf = xml.webvoiceconf;
                user.voicebridge = xml.voicebridge;
                user.mode = xml.mode;
                user.welcome = xml.welcome;
                user.logoutUrl = xml.logoutUrl;
                
                users.loggedInUser = user;
            }           
        }
    }
}