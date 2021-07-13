package org.bigbluebutton.api.model.shared;

import org.apache.http.NameValuePair;
import org.apache.http.client.utils.URLEncodedUtils;
import org.bigbluebutton.api.model.constraint.GetChecksumConstraint;
import org.bigbluebutton.api.util.ParamsUtil;

import javax.validation.constraints.NotEmpty;
import java.nio.charset.StandardCharsets;
import java.util.Iterator;
import java.util.List;

@GetChecksumConstraint(message = "Checksums do not match")
public class GetChecksum extends Checksum {

    @NotEmpty(message = "You must provide the query string")
    private String queryString;

    public GetChecksum(String apiCall, String checksum, String queryString) {
        super(apiCall, checksum);
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

    public String getQueryString() {
        return queryString;
    }

    public void setQueryString(String queryString) {
        this.queryString = queryString;
    }
}
