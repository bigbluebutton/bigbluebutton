package org.bigbluebutton.api.domain;

public class RegisteredUser {
    public final String authToken;
    public final String userId;
    public final Long registeredOn;

    private String guestStatus;

    public RegisteredUser(String authToken, String userId, String guestStatus) {
        this.authToken = authToken;
        this.userId = userId;
        this.guestStatus = guestStatus;
        registeredOn = System.currentTimeMillis();
    }

    public void setGuestStatus(String status) {
        this.guestStatus = status;
    }

    public String getGuestStatus() {
        return guestStatus;
    }

}
