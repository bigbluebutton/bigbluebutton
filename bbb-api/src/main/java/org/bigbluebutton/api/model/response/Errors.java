package org.bigbluebutton.api.model.response;

import lombok.Data;
import org.springframework.validation.annotation.Validated;

import java.util.ArrayList;
import java.util.List;

@Validated
@Data
public class Errors {

    private List<Error> errors;

    public void addError(Error error) {
        if(errors == null) {
            errors = new ArrayList<>();
        }

        errors.add(error);
    }
}
