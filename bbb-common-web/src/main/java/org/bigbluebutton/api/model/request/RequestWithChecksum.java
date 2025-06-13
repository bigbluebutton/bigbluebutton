package org.bigbluebutton.api.model.request;

import jakarta.ws.rs.core.MediaType;
import org.bigbluebutton.api.model.shared.Checksum;

import jakarta.validation.Valid;
import org.sitemesh.webapp.contentfilter.HttpServletRequestFilterable;

import java.util.Map;
import java.util.Set;

public abstract class RequestWithChecksum<P extends Enum<P> & RequestParameters> implements Request<P> {

    @Valid
    protected Checksum checksum;

    protected HttpServletRequestFilterable servletRequest;

    protected RequestWithChecksum(Checksum checksum, HttpServletRequestFilterable servletRequest) {
        this.checksum = checksum;
        this.servletRequest = servletRequest;
    }

    public Checksum getChecksum() {
        return checksum;
    }

    public void setChecksum(Checksum checksum) {
        this.checksum = checksum;
    }

    public abstract void populateFromParamsMap(Map<String, String[]> params);

    public void convertParamsFromString() {

    }

    @Override
    public Set<String> getSupportedContentTypes() {
        return Set.of(MediaType.APPLICATION_FORM_URLENCODED, MediaType.MULTIPART_FORM_DATA);
    }

    @Override
    public HttpServletRequestFilterable getServletRequest() {
        return servletRequest;
    }
}
