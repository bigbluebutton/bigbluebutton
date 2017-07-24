package org.bigbluebutton.messages;

import org.bigbluebutton.messages.ValidateAuthTokenReplyPayload;
import org.junit.Assert;
import org.junit.Test;

import com.google.gson.Gson;

public class ValidateAuthTokenReplyTest {
  @Test
  public void testValidateAuthTokenReply() {
    String meetingId = "abc123";
    ValidateAuthTokenReplyPayload payload = new ValidateAuthTokenReplyPayload(meetingId, "user1", "myToken", true);
    ValidateAuthTokenReply msg = new ValidateAuthTokenReply(MessageType.DIRECT, payload);    
    Gson gson = new Gson();
    String json = gson.toJson(msg);
    System.out.println(json);
    
    ValidateAuthTokenReply rxMsg = gson.fromJson(json, ValidateAuthTokenReply.class);
    
    Assert.assertEquals(rxMsg.payload.meetingId, meetingId);
    Assert.assertEquals(rxMsg.payload.valid, true);
    Assert.assertEquals(rxMsg.header.name, ValidateAuthTokenReply.NAME);
  }
}
