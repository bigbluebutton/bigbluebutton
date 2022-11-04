package org.bigbluebutton.request;

import lombok.Data;

@Data
public class PresentationUploadInfo {

    private String token;
    private String meetingId;
    private Boolean isDownloadable;
    private String podId;
    private Boolean current;
    private String tempPresentationId;
}
