package org.bigbluebutton.api.model.request;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.Set;

public interface Request<P extends Enum<P> & RequestParameters> {

    void populateFromParamsMap(Map<String, String[]> params);
    void convertParamsFromString();
    Set<String> getSupportedContentTypes();
    HttpServletRequest getServletRequest();
}
