package org.bigbluebutton.response.error;

import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * API Specific Errors
 *
 * 5000 series errors are generic/unspecified errors
 * 6000 series errors are server side errors
 * 7000 series errors are client side errors
 **/

@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum Error {

    UNKNOWN(5000, "An unknown error occurred"),
    INVALID_TOKEN(6004, "Provided presentation auth token is invalid"),
    FILE_READ_FAILED(6005, "Failed to read the specified file"),
    TOKEN_NOT_FOUND(7009, "No records could be found that match the provided presentation auth token"),
    UPLOAD_FAILED(7010, "Presentation upload failed"),
    FILE_NOT_FOUND(7011, "The specified file count not be found"),
    AUTHENTICATION_FAILED(7012, "Authentication failed: Either the API key was not provided or it is incorrect"),
    TOKEN_NOT_PROVIDED(7013, "You must provide a presentation auth token"),
    TOKEN_FORMAT_ERROR(7014, "Provided token does not conform to the necessary format"),
    EMPTY_FILE_ERROR(7015, "The provided file is empty"),
    FILE_TOO_LARGE(7016, "The provided file is too large");

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
