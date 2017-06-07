package org.bigbluebutton.core.connection.messages
{
  public class UserBroadcastCamStartMsg
  {
    public var header: MsgFromClientHdr;
    public var body: UserBroadcastCamStartMsgBody;

    public function UserBroadcastCamStartMsg(header: MsgFromClientHdr, body: UserBroadcastCamStartMsgBody): void {
    	this.header = header;
    	this.body = body;
    }
  }
}