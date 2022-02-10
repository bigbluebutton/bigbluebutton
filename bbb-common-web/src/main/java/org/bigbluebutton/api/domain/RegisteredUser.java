package org.bigbluebutton.api.domain;

public class RegisteredUser {
    public final String authToken;
    public final String userId;
    public final Long registeredOn;


    private String guestStatus;
    private Boolean excludeFromDashboard;
    private Long guestWaitedOn;
    private Boolean leftGuestLobby;

    public RegisteredUser(String authToken, String userId, String guestStatus, Boolean excludeFromDashboard, Boolean leftGuestLobby) {
        this.authToken = authToken;
        this.userId = userId;
        this.guestStatus = guestStatus;
        this.excludeFromDashboard = excludeFromDashboard;
        this.leftGuestLobby = leftGuestLobby;

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

    public Boolean getLeftGuestLobby() { return leftGuestLobby; }

    public void setExcludeFromDashboard(Boolean excludeFromDashboard) {
        this.excludeFromDashboard = excludeFromDashboard;
    }

    public Boolean getExcludeFromDashboard() {
        return excludeFromDashboard;
    }

    public void updateGuestWaitedOn() {
        this.guestWaitedOn = System.currentTimeMillis();
    }

    public void setLeftGuestLobby(boolean bool) {
        this.leftGuestLobby = bool;
    }
    public Long getGuestWaitedOn() {
        return this.guestWaitedOn;
    }
}
