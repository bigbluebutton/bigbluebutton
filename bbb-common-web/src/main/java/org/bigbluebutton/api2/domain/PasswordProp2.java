package org.bigbluebutton.api2.domain;

public class PasswordProp2 {
    public final String moderatorPass;
    public final String viewerPass;

    public PasswordProp2(String moderatorPass,
                         String viewerPass) {
        this.moderatorPass = moderatorPass;
        this.viewerPass = viewerPass;
    }
}
