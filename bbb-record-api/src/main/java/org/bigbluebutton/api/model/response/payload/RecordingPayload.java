package org.bigbluebutton.api.model.response.payload;

import lombok.Data;
import org.bigbluebutton.api.model.entity.Recording;
import org.bigbluebutton.api.model.response.Payload;
import org.springframework.validation.annotation.Validated;

@Validated
@Data
public class RecordingPayload implements Payload {

    private Recording recording;
}
