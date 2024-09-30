package org.bigbluebutton.api.messaging.messages;

import java.util.Map;

public class RegisterUserSessionToken implements IMessage {

    public final String meetingID;
    public final String internalUserId;
    public final String sessionToken;
    public final String replaceSessionToken;
    public final String enforceLayout;
    public final Map<String, String> userSessionMetadata;

    public RegisterUserSessionToken(String meetingID,
                                    String internalUserId,
                                    String sessionToken,
                                    String replaceSessionToken,
                                    String enforceLayout,
                                    Map<String, String> userSessionMetadata
    ) {
        this.meetingID = meetingID;
        this.internalUserId = internalUserId;
        this.sessionToken = sessionToken;
        this.replaceSessionToken = replaceSessionToken;
        this.enforceLayout = enforceLayout;
        this.userSessionMetadata = userSessionMetadata;
    }
}