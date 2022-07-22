package org.bigbluebutton.response.error;

import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum Error {

    UNKNOWN(5000, "An unknown error occurred"),
    ID_NOT_FOUND(6001, "No records could be found that match the provided ID"),
    NO_RESULTS(6002, "No records could be found that match your query"),
    UPLOAD_FAILED(6003, "Text track upload failed"),
    ID_NOT_PROVIDED(7002, "You must provide an ID"),
    ID_FORMAT_ERROR(7003, "Provided ID does not conform to the necessary format"),
    METADATA_NOT_PROVIDED(7004, "You must supply metadata parameters to be updated"),
    INVALID_LANG(7005, "Malformed lang parameter"),
    EMPTY_TEXT_TRACK(7006, "Uploaded text track is empty");

    private final int code;
    private final String description;

    Error(int code, String description) {
        this.code = code;
        this.description = description;
    }

    public int getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }
}
