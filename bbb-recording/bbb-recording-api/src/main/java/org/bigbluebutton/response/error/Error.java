package org.bigbluebutton.response.error;

import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * API Specific Errors
 *
 * 5000 series errors are generic/unspecified errors 6000 series errors are server side errors 7000 series errors are
 * client side errors
 **/

@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum Error {

    UNKNOWN(5000, "An unknown error occurred"),
    ID_NOT_FOUND(6001, "No records could be found that match the provided ID"),
    NO_RESULTS(6002, "No records could be found that match your query"),
    UPLOAD_FAILED(6003, "Text track upload failed"),
    AUTHENTICATION_FAILED(7001, "Authentication failed: Either the API key was not provided or it is incorrect"),
    ID_NOT_PROVIDED(7002, "You must provide an ID"),
    ID_FORMAT_ERROR(7003, "Provided ID does not conform to the necessary format"),
    METADATA_NOT_PROVIDED(7004, "You must supply metadata parameters to be updated"),
    MISSING_KIND(7005, "You must provide the kind of text track (subtitles|captions)"),
    MISSING_LANG(7006, "You must provide a lang parameter"),
    INVALID_KIND(7007, "Invalid kind parameter, expected='subtitles|captions'"),
    INVALID_LANG(7008, "Malformed lang parameter"), EMPTY_TEXT_TRACK(7009, "Uploaded text track is empty");

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
