package org.bigbluebutton.api2.domain;


import org.bigbluebutton.api.domain.User;

import java.util.Map;

public class UsersProp2 {
    public final String guestPolicy;
    public final boolean userHasJoined;
    public final boolean webcamsOnlyForModerator;
    public final int maxUsers;
    public final Map<String, Object> userCustomData;
    public final Map<String, User> users;
    public final Map<String, Long> registeredUsers;

    public UsersProp2(int maxUsers,
                      boolean webcamsOnlyForModerator,
                      String guestPolicy,
                      boolean userHasJoined,
                      Map<String, Object> userCustomData,
                      Map<String, User> users,
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
