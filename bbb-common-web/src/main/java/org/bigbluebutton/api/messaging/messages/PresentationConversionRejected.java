package org.bigbluebutton.api.messaging.messages;

// bbb-apps-akka will not add this presentation to a pod, so its conversion is wasted work.
public class PresentationConversionRejected implements IMessage {
    public final String meetingId;
    public final String podId;
    public final String presentationId;
    public final String reason;

    public PresentationConversionRejected(String meetingId, String podId, String presentationId, String reason) {
        this.meetingId = meetingId;
        this.podId = podId;
        this.presentationId = presentationId;
        this.reason = reason;
    }
}
