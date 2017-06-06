package org.bigbluebutton.core.connection.messages
{
  public class ValidateAuthTokenReqMsgBody
  {
    public var userId: String;
    public var authToken: String;

    public function ValidateAuthTokenReqMsgBody(userId: String, authToken: String): void {
    	this.userId = userId;
    	this.authToken = authToken;
    }
  }
}