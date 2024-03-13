package org.bigbluebutton.api.model.validator;

import jakarta.ws.rs.core.MediaType;
import org.apache.commons.compress.utils.Sets;
import org.bigbluebutton.api.model.constraint.ContentTypeConstraint;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletRequest;
import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import java.util.Set;

public class ContentTypeValidator implements ConstraintValidator<ContentTypeConstraint, HttpServletRequest> {

    private static final Logger log = LoggerFactory.getLogger(ContentTypeValidator.class);

    private static final Set<String> SUPPORTED_CONTENT_TYPES = Sets.newHashSet(
            MediaType.APPLICATION_XML,
            MediaType.APPLICATION_FORM_URLENCODED,
            MediaType.MULTIPART_FORM_DATA
    );

    @Override
    public void initialize(ContentTypeConstraint constraintAnnotation) {}

    @Override
    public boolean isValid(HttpServletRequest request, ConstraintValidatorContext context) {
        String requestMethod = request.getMethod();
        String contentType = request.getContentType();
        log.info("Validating {} request with content type {}", requestMethod, contentType);

        boolean requestBodyPresent = request.getContentLength() > 0;
        if (requestBodyPresent) {
            if (contentType == null) return false;
            else {
                return SUPPORTED_CONTENT_TYPES.contains(contentType);
            }
        }

        return true;
    }
}
