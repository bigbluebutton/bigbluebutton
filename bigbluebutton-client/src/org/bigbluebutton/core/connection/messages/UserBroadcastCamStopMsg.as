package org.bigbluebutton.core.connection.messages
{
  public class UserBroadcastCamStopMsg
  {
    public var header: MsgFromClientHdr;
    public var body: UserBroadcastCamStopMsgBody;

    public function UserBroadcastCamStopMsg(header: MsgFromClientHdr, body: UserBroadcastCamStopMsgBody): void {
    	this.header = header;
    	this.body = body;
    }
  }
}