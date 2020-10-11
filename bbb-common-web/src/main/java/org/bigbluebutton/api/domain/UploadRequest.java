package org.bigbluebutton.api.domain;

public class UploadRequest {
    public final String source;
    public final String filename;
    public final String userId;
    private Boolean valid;

    public UploadRequest(String source, String filename, String userId) {
        this.source = source;
        this.filename = filename;
        this.userId = userId;
        this.valid = true;
    }

    public Boolean isValid(String source, String filename, String userId) {
       if (this.valid) {
            // Invalidate this upload request after the first check
            this.valid = false;
            Boolean validSource = source != null && source.equals(this.source);
            Boolean validFilename = filename != null && filename.equals(this.filename);
            Boolean validUserId = userId != null && userId.equals(this.userId);
            return validSource && validFilename && validUserId;
        } else {
            return false;
        }
    }
}
