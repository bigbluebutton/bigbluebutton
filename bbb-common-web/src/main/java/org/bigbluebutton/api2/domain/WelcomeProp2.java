package org.bigbluebutton.api2.domain;

public class WelcomeProp2 {
    public final String welcomeMsgTemplate;
    public final String welcomeMsg;
    public final String modOnlyMessage;

    public WelcomeProp2(String welcomeMsgTemplate,
                        String welcomeMsg,
                        String modOnlyMessage) {
        this.welcomeMsgTemplate = welcomeMsgTemplate;
        this.welcomeMsg = welcomeMsg;
        this.modOnlyMessage = modOnlyMessage;
    }
}
