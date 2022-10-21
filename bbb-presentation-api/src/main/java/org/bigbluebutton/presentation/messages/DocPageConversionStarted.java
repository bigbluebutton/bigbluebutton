package org.bigbluebutton.presentation.messages;

public class DocPageConversionStarted implements IDocConversionMsg {
    public final String podId;
    public final String meetingId;
    public final String presId;
    public final String filename;
    public final String authzToken;
    public final Boolean downloadable;
    public final Boolean removable;
    public final Boolean current;
    public final Integer numPages;

    public DocPageConversionStarted(String podId,
                                    String meetingId,
                                    String presId,
                                    String filename,
                                    String authzToken,
                                    Boolean downloadable,
                                    Boolean removable,
                                    Boolean current,
                                    Integer numPages) {
        this.podId = podId;
        this.meetingId = meetingId;
        this.presId = presId;
        this.filename = filename;
        this.authzToken = authzToken;
        this.downloadable = downloadable;
        this.removable = removable;
        this.current = current;
        this.numPages = numPages;
    }
}
