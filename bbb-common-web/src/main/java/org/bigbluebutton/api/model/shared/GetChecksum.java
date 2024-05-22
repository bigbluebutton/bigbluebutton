package org.bigbluebutton.api.model.shared;

import org.bigbluebutton.api.model.constraint.GetChecksumConstraint;
import org.bigbluebutton.api.util.ParamsUtil;

import javax.servlet.http.HttpServletRequest;
import javax.validation.constraints.NotEmpty;

@GetChecksumConstraint(groups = ChecksumValidationGroup.class)
public class GetChecksum extends Checksum {
    
    private String queryString;

    public GetChecksum(String apiCall, String checksum, String queryString, HttpServletRequest request) {
        super(apiCall, checksum, request);
        this.queryString = ParamsUtil.sanitizeString(queryString);
        removeChecksumFromQueryString();
    }

    private void removeChecksumFromQueryString() {
        queryStringWithoutChecksum = queryString;
        queryStringWithoutChecksum = queryStringWithoutChecksum.replace("&checksum=" + checksum, "");
        queryStringWithoutChecksum = queryStringWithoutChecksum.replace("checksum=" + checksum + "&", "");
        queryStringWithoutChecksum = queryStringWithoutChecksum.replace("checksum=" + checksum, "");
    }

    public String getQueryString() {
        return queryString;
    }

    public void setQueryString(String queryString) {
        this.queryString = queryString;
    }
}
