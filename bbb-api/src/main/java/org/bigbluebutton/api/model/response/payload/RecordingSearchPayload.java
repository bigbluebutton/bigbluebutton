package org.bigbluebutton.api.model.response.payload;

import lombok.Data;
import org.bigbluebutton.api.model.entity.Recording;
import org.bigbluebutton.api.model.response.Payload;
import org.springframework.data.domain.Page;
import org.springframework.validation.annotation.Validated;

@Validated
@Data
public class RecordingSearchPayload implements Payload {

    private Page<Recording> recordings;
}
