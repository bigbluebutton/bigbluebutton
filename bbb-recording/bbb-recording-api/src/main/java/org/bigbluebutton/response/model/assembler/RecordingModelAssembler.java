package org.bigbluebutton.response.model.assembler;

import org.bigbluebutton.dao.entity.Recording;
import org.bigbluebutton.response.model.RecordingModel;
import org.bigbluebutton.rest.v2.RecordingApiControllerV2;
import org.springframework.hateoas.server.mvc.RepresentationModelAssemblerSupport;
import org.springframework.stereotype.Component;

@Component
public class RecordingModelAssembler extends RepresentationModelAssemblerSupport<Recording, RecordingModel> {

    public RecordingModelAssembler() {
        super(RecordingApiControllerV2.class, RecordingModel.class);
    }

    @Override
    public RecordingModel toModel(Recording entity) {
        return RecordingModel.toModel(entity);
    }
}
