package org.bigbluebutton.presentation.messages;

public class DocConversionStarted implements IDocConversionMsg {

    public final String podId;
    public final String presId;
    public final String filename;
    public final String temporaryPresentationId;
    public final Long maxConversionTime;
    public final String meetingId;
    public final String authzToken;

    public DocConversionStarted(
            String podId,
            String presId,
            String fileName,
            String temporaryPresentationId,
            Long maxConversionTime,
            String meetingId,
            String authzToken
    ) {
        this.podId = podId;
        this.presId = presId;
        this.filename = fileName;
        this.temporaryPresentationId = temporaryPresentationId;
        this.maxConversionTime = maxConversionTime;
        this.meetingId = meetingId;
        this.authzToken = authzToken;
    }
}
