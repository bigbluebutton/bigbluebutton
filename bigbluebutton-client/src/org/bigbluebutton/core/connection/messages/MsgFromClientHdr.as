package org.bigbluebutton.core.connection.messages
{
  public class MsgFromClientHdr
  {
    public var name: String;
    public var meetingId: String;
    public var userId: String;

    public function MsgFromClientHdr(name: String, meetingId: String, userId: String): void {
    	this.name = name;
    	this.meetingId = meetingId;
    	this.userId = userId;
    }
  }
}