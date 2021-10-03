package org.bigbluebutton.api.model.shared;

import org.bigbluebutton.api.model.constraint.PostChecksumConstraint;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.SortedSet;
import java.util.TreeSet;

@PostChecksumConstraint(message = "Checksums do not match")
public class PostChecksum extends Checksum {

    Map<String, String[]> params;

    public PostChecksum(String apiCall, String checksum, Map<String, String[]> params) {
        super(apiCall, checksum);
        this.params = params;
        buildQueryStringFromParamsMap();
    }

    private void buildQueryStringFromParamsMap() {
        StringBuilder queryString = new StringBuilder();
        SortedSet<String> keys = new TreeSet<>(params.keySet());

        boolean firstParam = true;
        for(String key: keys) {

            if(key.equals("checksum")) {
                continue;
            }

            for(String value: params.get(key)) {
                if(firstParam) {
                    firstParam = false;
                } else {
                    queryString.append("&");
                }

                queryString.append(key);
                queryString.append("=");

                String encodedValue = encodeString(value);
                queryString.append(encodedValue);
            }
        }

        queryStringWithoutChecksum = queryString.toString();
    }

    private String encodeString(String stringToEncode) {
        String encodedResult;

        try {
            encodedResult = URLEncoder.encode(stringToEncode, StandardCharsets.UTF_8.name());
        } catch(UnsupportedEncodingException ex) {
            encodedResult = stringToEncode;
        }

        return encodedResult;
    }

    public Map<String, String[]> getParams() { return params; }

    public void setParams(Map<String, String[]> params) { this.params = params; }
}
