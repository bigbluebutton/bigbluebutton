package org.bigbluebutton.messages;

import org.bigbluebutton.messages.ValidateAuthTokenRequestTimedoutPayload;
import org.junit.Assert;
import org.junit.Test;

import com.google.gson.Gson;

public class ValidateAuthTokenRequestTimedoutTest {
  @Test
  public void testValidateAuthTokenRequest() {
    String meetingId = "abc123";
    ValidateAuthTokenRequestTimedoutPayload payload = new ValidateAuthTokenRequestTimedoutPayload(meetingId, "user1", "myToken");
    ValidateAuthTokenRequestTimedout msg = new ValidateAuthTokenRequestTimedout(MessageType.DIRECT, payload);    
    Gson gson = new Gson();
    String json = gson.toJson(msg);
    System.out.println(json);
    
    ValidateAuthTokenRequestTimedout rxMsg = gson.fromJson(json, ValidateAuthTokenRequestTimedout.class);
    
    Assert.assertEquals(rxMsg.payload.meetingId, meetingId);
    Assert.assertEquals(rxMsg.header.name, ValidateAuthTokenRequestTimedout.NAME);
  }
}
