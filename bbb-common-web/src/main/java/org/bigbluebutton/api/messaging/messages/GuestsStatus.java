package org.bigbluebutton.api.messaging.messages;

public class GuestsStatus {

    public String userId;
    public String status;

    public GuestsStatus(String userId, String status) {
      this.userId = userId;
      this.status = status;
    }
}
