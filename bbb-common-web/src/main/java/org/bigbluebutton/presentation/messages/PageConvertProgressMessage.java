package org.bigbluebutton.presentation.messages;

import java.util.List;

public class PageConvertProgressMessage implements IPresentationCompletionMessage {

    public final String presId;
    public final int page;
    public final List<String> errors;
    public final String meetingId;

    public PageConvertProgressMessage(int page, String presId, String meetingId, List<String> errors) {
        this.presId = presId;
        this.meetingId = meetingId;
        this.page = page;
        this.errors = errors;
    }
}
