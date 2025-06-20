package org.bigbluebutton.api.model.shared;

import org.bigbluebutton.api.model.constraint.NotEmpty;
import org.bigbluebutton.api.util.ParamsUtil;
import org.sitemesh.webapp.contentfilter.HttpServletRequestFilterable;

public abstract class Checksum {

    @NotEmpty(message = "You must provide the API call", groups = ChecksumValidationGroup.class)
    protected String apiCall;

    @NotEmpty(key = "checksumError", message = "You must provide the checksum", groups = ChecksumValidationGroup.class)
    protected String checksum;

    protected String queryStringWithoutChecksum;

    protected HttpServletRequestFilterable request;

    public Checksum(String apiCall, String checksum, HttpServletRequestFilterable request) {
        this.apiCall = ParamsUtil.sanitizeString(apiCall);
        this.checksum = ParamsUtil.sanitizeString(checksum);
        this.request = request;
    }

    public String getApiCall() {
        return apiCall;
    }

    public void setApiCall(String apiCall) {
        this.apiCall = apiCall;
    }

    public String getChecksum() {
        return checksum;
    }

    public void setChecksum(String checksum) {
        this.checksum = checksum;
    }

    public String getQueryStringWithoutChecksum() {
        return queryStringWithoutChecksum;
    }

    public void setQueryStringWithoutChecksum(String queryStringWithoutChecksum) {
        this.queryStringWithoutChecksum = queryStringWithoutChecksum;
    }

    public void setRequest(HttpServletRequestFilterable request) {
        this.request = request;
    }

    public HttpServletRequestFilterable getRequest() {
        return request;
    }
}
