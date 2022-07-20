package org.bigbluebutton.response.content;

import lombok.Data;
import org.bigbluebutton.response.model.TrackModel;
import org.springframework.data.domain.Page;

@Data
public class TrackContent implements Content {

    private Page<TrackModel> tracks;
}
