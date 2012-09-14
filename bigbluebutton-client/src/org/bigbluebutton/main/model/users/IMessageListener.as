package org.bigbluebutton.main.model.users
{
    public interface IMessageListener
    {
        function onMessage(messageName:String, message:Object):void;
    }
}