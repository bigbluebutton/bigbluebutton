package org.bigbluebutton.api.model.mapper;

import org.bigbluebutton.api.model.dto.RecordingDTO;
import org.bigbluebutton.api.model.entity.Recording;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface RecordingMapper {

    RecordingDTO toRecordingDTO(Recording recording);

    Recording toRecording(RecordingDTO recordingDTO);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    Recording toRecording(RecordingDTO recordingDTO, @MappingTarget  Recording recording);
}
