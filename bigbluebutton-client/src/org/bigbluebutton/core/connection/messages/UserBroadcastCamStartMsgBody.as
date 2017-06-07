package org.bigbluebutton.core.connection.messages
{
  public class UserBroadcastCamStartMsgBody
  {
    public var stream: String;

    public function UserBroadcastCamStartMsgBody(stream: String): void {
    	this.stream = stream;
    }
  }
}