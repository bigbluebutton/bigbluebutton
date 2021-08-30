package org.bigbluebutton.api.model.response;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.Data;
import org.springframework.validation.annotation.Validated;

@Validated
@Data
public class StandardResponse {

    private Payload payload;

    private Errors errors;

    public StandardResponse() {
        payload = new EmptyPayload();
        errors = new Errors();
    }

    @JsonSerialize
    private class EmptyPayload implements Payload {}
}
