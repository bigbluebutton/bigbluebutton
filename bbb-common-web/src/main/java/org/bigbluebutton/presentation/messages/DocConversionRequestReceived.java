package org.bigbluebutton.presentation.messages;

public class DocConversionRequestReceived implements IDocConversionMsg {
    public final String podId;
    public final String meetingId;
    public final String presId;
    public final String temporaryPresentationId;
    public final String filename;
    public final String filenameConverted;
    public final String authzToken;
    public final Boolean downloadable;
    public final Boolean removable;
    public final Boolean current;
    public final Boolean defaultPresentation;

    public DocConversionRequestReceived(String podId,
                                        String meetingId,
                                        String presId,
                                        String temporaryPresentationId,
                                        String filename,
                                        String filenameConverted,
                                        String authzToken,
                                        Boolean downloadable,
                                        Boolean removable,
                                        Boolean current,
                                        Boolean defaultPresentation
                                        ) {
        this.podId = podId;
        this.meetingId = meetingId;
        this.presId = presId;
        this.temporaryPresentationId = temporaryPresentationId;
        this.filename = filename;
        this.filenameConverted = filenameConverted;
        this.authzToken = authzToken;
        this.downloadable = downloadable;
        this.removable = removable;
        this.current = current;
        this.defaultPresentation = defaultPresentation;
    }
}
