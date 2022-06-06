package org.bigbluebutton.request;

import lombok.Data;

import java.util.Map;

@Data
public class MetadataParams {

    private Map<String, String> meta;
}
