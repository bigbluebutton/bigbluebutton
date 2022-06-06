package org.bigbluebutton.response.dto;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import org.bigbluebutton.dao.entity.Metadata;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class MetadataDto {

    private Map<String, String> meta;

    @JsonAnyGetter
    public Map<String, String> getMeta() {
        return meta;
    }

    public void setMeta(Map<String, String> meta) {
        this.meta = meta;
    }

    public void addMeta(String key, String value) {
        if (meta == null)
            meta = new HashMap<>();
        meta.put(key, value);
    }

    public static MetadataDto metadataToDto(Set<Metadata> metadata) {
        MetadataDto metadataDto = new MetadataDto();
        for (Metadata meta : metadata)
            metadataDto.addMeta(meta.getKey(), meta.getValue());
        return metadataDto;
    }
}
