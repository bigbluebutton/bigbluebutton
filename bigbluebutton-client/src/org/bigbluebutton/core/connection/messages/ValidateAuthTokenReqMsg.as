package org.bigbluebutton.core.connection.messages
{
  public class ValidateAuthTokenReqMsg
  {
    public var header: MsgFromClientHdr;
    public var body: ValidateAuthTokenReqMsgBody;

    public function ValidateAuthTokenReqMsg(header: MsgFromClientHdr, body: ValidateAuthTokenReqMsgBody): void {
    	this.header = header;
    	this.body = body;
    }
  }
}