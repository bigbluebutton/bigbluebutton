package org.bigbluebutton.request;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Data
public class MetadataParams {

    @NotBlank
    private Map<String, String> meta;

    public static boolean isMetaValid(String meta) {
        Pattern metaPattern = Pattern.compile("meta_[a-zA-Z][a-zA-Z0-9-]*$");
        Matcher matcher = metaPattern.matcher(meta);
        return matcher.matches();
    }

    public static Map<String, String> processMetaParams(Map<String, String> params) {
        Map<String, String> meta = new HashMap<>();

        for (Map.Entry<String, String> entry : params.entrySet()) {
            String key = entry.getKey().substring(0, 5);
            meta.put(key, entry.getValue());
        }

        return meta;
    }
}
