package org.bigbluebutton.api2.domain;


import java.util.Map;

public class UsersProp2 {
    public final String guestPolicy;
    public final boolean userHasJoined;
    public final boolean webcamsOnlyForModerator;
    public final int maxUsers;
    public final Map<String, String> userCustomData;
    public final Map<String, User2> users;
    public final Map<String, Long> registeredUsers;

    public UsersProp2(int maxUsers,
                      boolean webcamsOnlyForModerator,
                      String guestPolicy,
                      boolean userHasJoined,
                      Map<String, String> userCustomData,
                      Map<String, User2> users,
                      Map<String, Long> registeredUsers) {
        this.maxUsers = maxUsers;
        this.webcamsOnlyForModerator = webcamsOnlyForModerator;
        this.guestPolicy = guestPolicy;
        this.userHasJoined = userHasJoined;
        this.userCustomData = userCustomData;
        this.users = users;
        this.registeredUsers = registeredUsers;
    }
}
