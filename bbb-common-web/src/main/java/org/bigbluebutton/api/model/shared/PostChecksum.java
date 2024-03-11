package org.bigbluebutton.api.model.shared;

import org.bigbluebutton.api.model.constraint.PostChecksumConstraint;
import org.bigbluebutton.api.service.ValidationService;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

@PostChecksumConstraint(groups = ChecksumValidationGroup.class)
public class PostChecksum extends Checksum {

    Map<String, String[]> params;

    public PostChecksum(String apiCall, String checksum, Map<String, String[]> params, HttpServletRequest request) {
        super(apiCall, checksum, request);
        this.params = params;
        queryStringWithoutChecksum = ValidationService.buildQueryStringFromParamsMap(params);
    }

    public Map<String, String[]> getParams() { return params; }

    public void setParams(Map<String, String[]> params) { this.params = params; }
}
