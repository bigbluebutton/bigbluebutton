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
    TOKEN_NOT_FOUND(6001, "No records could be found that match the provided presentation auth token"),
    UPLOAD_FAILED(6003, "Presentation upload failed"),
    AUTHENTICATION_FAILED(7001, "Authentication failed: Either the API key was not provided or it is incorrect"),
    TOKEN_NOT_PROVIDED(7002, "You must provide a presentation auth token"),
    TOKEN_FORMAT_ERROR(7003, "Provided token does not conform to the necessary format");

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
