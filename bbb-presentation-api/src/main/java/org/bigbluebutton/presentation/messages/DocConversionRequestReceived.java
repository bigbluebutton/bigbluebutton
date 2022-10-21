package org.bigbluebutton.presentation.messages;

public class DocConversionRequestReceived implements IDocConversionMsg {
    public final String podId;
    public final String meetingId;
    public final String presId;
    public final String temporaryPresentationId;
    public final String filename;
    public final String authzToken;
    public final Boolean downloadable;
    public final Boolean removable;
    public final Boolean current;

    public DocConversionRequestReceived(String podId,
                                        String meetingId,
                                        String presId,
                                        String temporaryPresentationId,
                                        String filename,
                                        String authzToken,
                                        Boolean downloadable,
                                        Boolean removable,
                                        Boolean current) {
        this.podId = podId;
        this.meetingId = meetingId;
        this.presId = presId;
        this.temporaryPresentationId = temporaryPresentationId;
        this.filename = filename;
        this.authzToken = authzToken;
        this.downloadable = downloadable;
        this.removable = removable;
        this.current = current;
    }
}
