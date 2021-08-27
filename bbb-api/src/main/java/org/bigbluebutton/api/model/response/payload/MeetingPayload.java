package org.bigbluebutton.api.model.response.payload;

import lombok.Data;
import org.bigbluebutton.api.model.response.MeetingResponse;
import org.bigbluebutton.api.model.response.Payload;
import org.springframework.validation.annotation.Validated;

import java.util.List;

@Validated
@Data
public class MeetingPayload implements Payload {

    private MeetingResponse meeting;
}
