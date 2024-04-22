package org.bigbluebutton.api.model.request;

import org.bigbluebutton.api.model.constraint.ContentTypeConstraint;
import org.bigbluebutton.api.model.shared.Checksum;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

@ContentTypeConstraint
public class SimpleRequest extends RequestWithChecksum<SimpleRequest.Params> {

    public enum Params implements RequestParameters {
        NONE("none");

        private final String value;

        Params(String value) { this.value = value; }

        public String getValue() { return value; }
    }

    public SimpleRequest(Checksum checksum, HttpServletRequest servletRequest) {
        super(checksum, servletRequest);
    }

    @Override
    public void populateFromParamsMap(Map<String, String[]> params) {}
}
