package org.bigbluebutton.main.model.users.events
{
        import flash.events.Event;

        public class ChangeStatusBtnEvent extends Event
        {
                public static const CHANGE_BTN_STATUS:String = "CHANGE_BTN_STATUS";

                private var status:String;
                public var userId:String;

                public function ChangeStatusBtnEvent(id:String,status:String)
                {
                        userId = id;
                        this.status = status;
                        super(CHANGE_BTN_STATUS, true, false);
                }

		public function getStatusName():String
                {
                        return status;
                }
 
        }
}

