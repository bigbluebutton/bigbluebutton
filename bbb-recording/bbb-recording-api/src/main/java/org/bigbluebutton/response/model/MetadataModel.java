package org.bigbluebutton.response.model;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import org.bigbluebutton.dao.entity.Metadata;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class MetadataModel {

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

    public static MetadataModel toModel(Set<Metadata> metadata) {
        if (metadata == null)
            return null;

        MetadataModel metadataModel = new MetadataModel();
        for (Metadata meta : metadata)
            metadataModel.addMeta(meta.getKey(), meta.getValue());
        return metadataModel;
    }
}
