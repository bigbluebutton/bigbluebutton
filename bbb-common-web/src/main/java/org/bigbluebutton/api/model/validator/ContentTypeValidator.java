package org.bigbluebutton.api.model.validator;

import org.apache.http.entity.ContentType;
import org.bigbluebutton.api.model.constraint.ContentTypeConstraint;
import org.bigbluebutton.api.model.request.Request;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletRequest;
import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class ContentTypeValidator implements ConstraintValidator<ContentTypeConstraint, Request> {

    private static final Logger log = LoggerFactory.getLogger(ContentTypeValidator.class);

    @Override
    public void initialize(ContentTypeConstraint constraintAnnotation) {}

    @Override
    public boolean isValid(Request request, ConstraintValidatorContext context) {
        HttpServletRequest servletRequest = request.getServletRequest();
        String requestMethod = servletRequest.getMethod();
        String contentType = servletRequest.getContentType();
        String contentTypeHeader = servletRequest.getHeader("Content-Type");
        log.info("Validating {} request with content type {}", requestMethod, contentType);

        boolean requestBodyPresent = servletRequest.getContentLength() > 0;
        if (requestBodyPresent) {
            if (contentType == null || contentTypeHeader == null) return false;
            else {
                try {
                    ContentType c = ContentType.parse(contentType);
                    String mimeType = c.getMimeType();
                    for (Object o: request.getSupportedContentTypes()) {
                        String supportedContentType = (String) o;
                        if (mimeType.equalsIgnoreCase(supportedContentType)) return true;
                    }
                } catch (Exception e) {
                    return false;
                }
                return false;
            }
        }

        return true;
    }
}
