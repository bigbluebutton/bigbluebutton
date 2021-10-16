package org.bigbluebutton.api.domain;

public class UploadedFile {
    public final String source;
    public final String filename;
    public final String contentType;
    public final String extension;

    public UploadedFile(String source, String filename, String contentType, String extension) {
        this.source = source;
        this.filename = filename;
        this.contentType = contentType;
        this.extension = extension;
    }
}
