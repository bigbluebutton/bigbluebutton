package org.bigbluebutton.response.payload;

import lombok.Data;
import org.bigbluebutton.response.model.RecordingModel;

@Data
public class RecordingPayload implements Payload {

    private RecordingModel recordingDto;
}
