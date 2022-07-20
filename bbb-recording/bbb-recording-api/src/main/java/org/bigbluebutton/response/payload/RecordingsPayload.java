package org.bigbluebutton.response.payload;

import lombok.Data;
import org.bigbluebutton.response.model.RecordingModel;
import org.springframework.hateoas.PagedModel;

@Data
public class RecordingsPayload implements Payload {

    private PagedModel<RecordingModel> recordings;
}
