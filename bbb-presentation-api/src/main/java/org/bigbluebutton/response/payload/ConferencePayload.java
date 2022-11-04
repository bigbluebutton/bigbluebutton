package org.bigbluebutton.response.payload;

import lombok.Data;
import org.bigbluebutton.dto.ConferenceDto;

@Data
public class ConferencePayload implements Payload {

    private ConferenceDto conference;
}
