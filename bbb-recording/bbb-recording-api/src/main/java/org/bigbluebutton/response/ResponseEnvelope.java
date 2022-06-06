package org.bigbluebutton.response;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.Data;
import org.bigbluebutton.response.error.Errors;
import org.bigbluebutton.response.payload.Payload;

@Data
public class ResponseEnvelope implements Response {

    private Payload payload;

    private Errors errors;

    public ResponseEnvelope() {
        payload = new EmptyPayload();
        errors = new Errors();
    }

    @JsonSerialize
    private static class EmptyPayload implements Payload {
    }
}
