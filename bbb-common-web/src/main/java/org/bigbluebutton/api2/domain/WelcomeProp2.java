package org.bigbluebutton.api2.domain;

public class WelcomeProp2 {
    public final String welcomeMsg;
    public final String welcomeMsgForModerators;

    public WelcomeProp2(String welcomeMsgTemplate,
                        String welcomeMsg,
                        String welcomeMsgForModerators) {
        this.welcomeMsg = welcomeMsg;
        this.welcomeMsgForModerators = welcomeMsgForModerators;
    }
}
