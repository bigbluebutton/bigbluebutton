package org.bigbluebutton.response.model.assembler;

import org.bigbluebutton.dao.entity.Track;
import org.bigbluebutton.response.model.TrackModel;
import org.bigbluebutton.rest.v2.RecordingApiControllerV2;
import org.springframework.hateoas.server.mvc.RepresentationModelAssemblerSupport;
import org.springframework.stereotype.Component;

@Component
public class TrackModelAssembler extends RepresentationModelAssemblerSupport<Track, TrackModel> {

    public TrackModelAssembler() {
        super(RecordingApiControllerV2.class, TrackModel.class);
    }

    @Override
    public TrackModel toModel(Track entity) {
        return TrackModel.toModel(entity);
    }
}
