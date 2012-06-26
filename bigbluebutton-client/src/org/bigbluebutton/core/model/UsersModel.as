package org.bigbluebutton.core.model
{
    import flash.events.IEventDispatcher;

    public class UsersModel
    {
        public var dispatcher:IEventDispatcher;
        
        public function UsersModel(dispatcher:IEventDispatcher)
        {
            this.dispatcher = dispatcher;
        }
    }
}