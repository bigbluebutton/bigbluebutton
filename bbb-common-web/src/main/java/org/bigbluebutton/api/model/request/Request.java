package org.bigbluebutton.api.model.request;

import java.util.Map;

public interface Request<P extends Enum<P> & RequestParameters> {

    void populateFromParamsMap(Map<String, String[]> params);
    void convertParamsFromString();
}
