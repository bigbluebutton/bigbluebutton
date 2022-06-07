package org.bigbluebutton.api2.domain;


import java.util.List;
import java.util.Map;


public class Meeting2 {

    public final MeetingProp2 props;
    public final DurationProp2 durationProp;
    public final RecordProp2 recordProp;
    public final WelcomeProp2 welcomeProp;
    public final VoiceProp2 voiceProp;
    public final PasswordProp2 passwordProp;
    public final UsersProp2 usersProp;
    public final boolean forciblyEnded;
    public final String logoutUrl;
    public final String defaultAvatarURL;
    public final Map<String, String> metadata;
    public final List<String> breakoutRooms;

    public Meeting2(MeetingProp2 props,
            DurationProp2 durationProp,
            RecordProp2 recordProp,
            WelcomeProp2 welcomeProp,
            VoiceProp2 voiceProp,
            PasswordProp2 passwordProp,
            UsersProp2 usersProp,
            boolean forciblyEnded,
            String logoutUrl,
            String defaultAvatarURL,
            Map<String, String> metadata,
            List<String> breakoutRooms) {
        this.props = props;
        this.durationProp = durationProp;
        this.recordProp = recordProp;
        this.welcomeProp = welcomeProp;
        this.voiceProp = voiceProp;
        this.passwordProp = passwordProp;
        this.usersProp = usersProp;
        this.forciblyEnded = forciblyEnded;
        this.logoutUrl = logoutUrl;
        this.defaultAvatarURL = defaultAvatarURL;
        this.metadata = metadata;
        this.breakoutRooms = breakoutRooms;
    }
}
