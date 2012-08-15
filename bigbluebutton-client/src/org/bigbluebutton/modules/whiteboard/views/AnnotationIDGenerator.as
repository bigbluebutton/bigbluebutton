package org.bigbluebutton.modules.whiteboard.views
{
    import org.bigbluebutton.core.managers.UserManager;

    public class AnnotationIDGenerator
    {
        private var count:uint = 0;
        private var _userid:String;
        
        public function AnnotationIDGenerator()
        {
            _userid = UserManager.getInstance().getConference().getMyUserId();
        }
        
        public function generateID():String {
            var curTime:Number = new Date().getTime();
            return _userid + "-" + count++ + "-" + curTime;
        }
    }
}