package org.bigbluebutton.api.messaging.messages;

import org.bigbluebutton.presentation.InsertPagesIntent;

// bbb-apps-akka asks for a blank page of width x height for an insert of pages, under uploadPresentationId.
public class InsertBlankPage implements IMessage {
    public final String meetingId;
    public final String podId;
    public final InsertPagesIntent intent;
    public final String userId;
    public final String uploadPresentationId;
    public final String filename;
    public final int width;
    public final int height;

    public InsertBlankPage(String meetingId, String podId, InsertPagesIntent intent, String userId,
                           String uploadPresentationId, String filename, int width, int height) {
        this.meetingId = meetingId;
        this.podId = podId;
        this.intent = intent;
        this.userId = userId;
        this.uploadPresentationId = uploadPresentationId;
        this.filename = filename;
        this.width = width;
        this.height = height;
    }
}
