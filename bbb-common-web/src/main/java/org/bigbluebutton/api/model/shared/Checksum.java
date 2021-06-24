package org.bigbluebutton.api.model.shared;

import org.apache.http.NameValuePair;
import org.apache.http.client.utils.URLEncodedUtils;
import org.bigbluebutton.api.model.constraint.ChecksumConstraint;
import org.bigbluebutton.api.util.ParamsUtil;

import javax.validation.constraints.NotEmpty;
import java.nio.charset.StandardCharsets;
import java.util.Iterator;
import java.util.List;

@ChecksumConstraint(message = "Checksums do not match")
public class Checksum {

    @NotEmpty(message = "You must provide the API call")
    private String apiCall;

    @NotEmpty(message = "You must provide the checksum")
    private String checksum;

    @NotEmpty(message = "You must provide the query string")
    private String queryString;

    private String queryStringWithoutChecksum;

    public Checksum(String apiCall, String checksum, String queryString) {
        this.apiCall = ParamsUtil.sanitizeString(apiCall);
        this.checksum = ParamsUtil.sanitizeString(checksum);
        this.queryString = ParamsUtil.sanitizeString(queryString);
        removeChecksumFromQueryString();
    }

    private void removeChecksumFromQueryString() {
        List<NameValuePair> params = URLEncodedUtils.parse(queryString, StandardCharsets.UTF_8);

        Iterator<NameValuePair> itr = params.iterator();
        while(itr.hasNext()) {
            NameValuePair pair = itr.next();
            if(pair.getName().equals("checksum")) {
                itr.remove();
            }
        }

       queryStringWithoutChecksum = URLEncodedUtils.format(params, '&', StandardCharsets.UTF_8);
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

    public String getQueryString() {
        return queryString;
    }

    public void setQueryString(String queryString) {
        this.queryString = queryString;
    }

    public String getQueryStringWithoutChecksum() {
        return queryStringWithoutChecksum;
    }

    public void setQueryStringWithoutChecksum(String queryStringWithoutChecksum) {
        this.queryStringWithoutChecksum = queryStringWithoutChecksum;
    }
}
