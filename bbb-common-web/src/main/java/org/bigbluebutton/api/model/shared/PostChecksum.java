package org.bigbluebutton.api.model.shared;

import org.bigbluebutton.api.model.constraint.PostChecksumConstraint;
import org.bigbluebutton.api.service.ValidationService;

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
        queryStringWithoutChecksum = ValidationService.buildQueryStringFromParamsMap(params);
    }

    public Map<String, String[]> getParams() { return params; }

    public void setParams(Map<String, String[]> params) { this.params = params; }
}
