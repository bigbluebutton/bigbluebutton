package org.bigbluebutton.presentation.messages;

public class DocInvalidMimeType implements IDocConversionMsg{

    public final String podId;
    public final String meetingId;
    public final String presId;
    public final String temporaryPresentationId;
    public final String filename;
    public final String authzToken;
    public final String messageKey;
    public final String fileMime;
    public final String fileExtension;

    public DocInvalidMimeType(  String podId,
                                String meetingId,
                                String presId,
                                String temporaryPresentationId,
                                String filename,
                                String authzToken,
                                String messageKey,
                                String fileMime,
                                String fileExtension) {
        this.podId = podId;
        this.meetingId = meetingId;
        this.presId = presId;
        this.temporaryPresentationId = temporaryPresentationId;
        this.filename = filename;
        this.authzToken = authzToken;
        this.messageKey = messageKey;
        this.fileMime = fileMime;
        this.fileExtension = fileExtension;
    }
}
