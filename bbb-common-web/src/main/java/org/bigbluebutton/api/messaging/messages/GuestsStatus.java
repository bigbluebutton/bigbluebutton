package org.bigbluebutton.api.messaging.messages;

public class GuestsStatus {

    public final String userId;
    public final String status;

    public GuestsStatus(String userId, String status) {
      this.userId = userId;
      this.status = status;
    }
}
