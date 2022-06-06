package org.bigbluebutton.response.payload;

import lombok.Data;
import org.bigbluebutton.response.dto.RecordingDto;

@Data
public class RecordingPayload implements Payload {

    private RecordingDto recordingDto;
}
