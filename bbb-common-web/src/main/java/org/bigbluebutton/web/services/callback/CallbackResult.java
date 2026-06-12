package org.bigbluebutton.web.services.callback;

public record CallbackResult(Type type, String reason) {

    public enum Type {
        SUCCESS,
        TRANSIENT_FAILURE,
        PERMANENT_FAILURE
    }

    public static CallbackResult success() {
        return new CallbackResult(Type.SUCCESS, null);
    }

    public static CallbackResult transientFailure(String reason) {
        return new CallbackResult(Type.TRANSIENT_FAILURE, reason);
    }

    public static CallbackResult permanentFailure(String reason) {
        return new CallbackResult(Type.PERMANENT_FAILURE, reason);
    }
}
