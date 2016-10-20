package org.bigbluebutton.api.responses;

public class InvalidResponse {
    public final String returnCode;
    public final String messageKey;
    public final String message;

    public InvalidResponse(String returnCode, String messageKey, String message) {
        this.returnCode = returnCode;
        this.messageKey = messageKey;
        this.message = message;
    }
}
