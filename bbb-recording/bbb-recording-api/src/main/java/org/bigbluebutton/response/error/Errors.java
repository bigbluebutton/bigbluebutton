package org.bigbluebutton.response.error;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class Errors {

    private List<Error> errors;

    public void addError(Error error) {
        if (errors == null) {
            errors = new ArrayList<>();
        }

        errors.add(error);
    }
}
