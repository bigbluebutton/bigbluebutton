package org.bigbluebutton.response.error;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class Errors {

    @JsonInclude(Include.NON_EMPTY)
    private List<Error> errors;

    public void addError(Error error) {
        if (errors == null) {
            errors = new ArrayList<>();
        }

        errors.add(error);
    }
}
