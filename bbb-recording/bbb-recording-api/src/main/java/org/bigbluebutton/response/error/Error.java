package org.bigbluebutton.response.error;

import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum Error {

    UNKNOWN(5000, "An unknown error occurred"),
    ID_NOT_FOUND(6001, "No records could be found that match the provided ID"),
    NO_RESULTS(6002, "No records could be found that match your query"),
    ID_NOT_PROVIDED(7002, "You must provide an ID"),
    ID_FORMAT_ERROR(7003, "Provided ID does not conform to the necessary format"),
    METADATA_NOT_PROVIDED(7004, "You must supply metadata parameteres to be updated"),
    QUERY_NOT_PROVIDED(7004, "You must provide a search query");

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
