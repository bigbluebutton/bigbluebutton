package org.bigbluebutton.core.events
{
import flash.events.Event;

public class TokenValidReconnectEvent extends Event
{
    public static const TOKEN_VALID_RECONNECT_EVENT:String = "auth token valid reconnect event";

    public function TokenValidReconnectEvent()
    {
        super(TOKEN_VALID_RECONNECT_EVENT, true, false);
    }

}

}
