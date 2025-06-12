package org.bigbluebutton.api.model.request;

import jakarta.ws.rs.core.MediaType;
import org.sitemesh.webapp.contentfilter.HttpServletRequestFilterable;

import javax.servlet.http.HttpServletRequest;
import java.util.Set;

public abstract class RequestWithSession<P extends Enum<P> & RequestParameters> implements Request<P> {

    protected HttpServletRequestFilterable servletRequest;

    protected RequestWithSession(HttpServletRequestFilterable servletRequest) {
        this.servletRequest = servletRequest;
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
