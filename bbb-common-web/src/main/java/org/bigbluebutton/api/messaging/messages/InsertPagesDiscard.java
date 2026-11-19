package org.bigbluebutton.api.messaging.messages;

import java.util.List;

// bbb-apps-akka did not apply these delivered pages: their files go away from the presentation directory.
public class InsertPagesDiscard implements IMessage {
    public final String meetingId;
    public final String presentationId;
    public final List<String> pageIds;

    public InsertPagesDiscard(String meetingId, String presentationId, List<String> pageIds) {
        this.meetingId = meetingId;
        this.presentationId = presentationId;
        this.pageIds = pageIds;
    }
}
