package org.bigbluebutton.core.connection.messages
{
  public class UserBroadcastCamStopMsgBody
  {
    public var stream: String;

    public function UserBroadcastCamStopMsgBody(stream: String): void {
    	this.stream = stream;
    }
  }
}