package org.bigbluebutton.messages;

import org.bigbluebutton.messages.ValidateAuthTokenRequest.ValidateAuthTokenRequestPayload;
import org.junit.Assert;
import org.junit.Test;

import com.google.gson.Gson;

public class ValidateAuthTokenRequestTest {
  @Test
  public void testValidateAuthTokenRequest() {
    String meetingId = "abc123";
    ValidateAuthTokenRequestPayload payload = new ValidateAuthTokenRequestPayload(meetingId, "user1", "myToken");
    ValidateAuthTokenRequest msg = new ValidateAuthTokenRequest(MessageType.DIRECT, payload);    
    Gson gson = new Gson();
    String json = gson.toJson(msg);
    System.out.println(json);
    
    ValidateAuthTokenRequest rxMsg = gson.fromJson(json, ValidateAuthTokenRequest.class);
    
    Assert.assertEquals(rxMsg.payload.meetingId, meetingId);
    Assert.assertEquals(rxMsg.header.name, ValidateAuthTokenRequest.NAME);
  }
}
