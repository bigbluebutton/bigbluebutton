package org.bigbluebutton.api.domain;

public class RegisteredUser {
    public final String authToken;
    public final String userId;
    public final Long registeredOn;

    private String guestStatus;
    private Long guestWaitedOn;

    public RegisteredUser(String authToken, String userId, String guestStatus) {
        this.authToken = authToken;
        this.userId = userId;
        this.guestStatus = guestStatus;

        Long currentTimeMillis = System.currentTimeMillis();
        this.registeredOn = currentTimeMillis;
        this.guestWaitedOn = currentTimeMillis;
    }

    public void setGuestStatus(String status) {
        this.guestStatus = status;
    }

    public String getGuestStatus() {
        return guestStatus;
    }

    public void updateGuestWaitedOn() {
        this.guestWaitedOn = System.currentTimeMillis();
    }

    public Long getGuestWaitedOn() {
        return this.guestWaitedOn;
    }
}
