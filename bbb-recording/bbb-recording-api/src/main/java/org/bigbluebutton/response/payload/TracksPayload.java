package org.bigbluebutton.response.payload;

import lombok.Data;
import org.bigbluebutton.response.model.TrackModel;
import org.springframework.hateoas.PagedModel;

@Data
public class TracksPayload implements Payload {

    private PagedModel<TrackModel> tracks;
}
