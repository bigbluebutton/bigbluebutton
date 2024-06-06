package org.bigbluebutton.api.model.validator;

import org.apache.commons.codec.digest.DigestUtils;
import org.bigbluebutton.api.model.constraint.PostChecksumConstraint;
import org.bigbluebutton.api.model.shared.PostChecksum;
import org.bigbluebutton.api.service.ServiceUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class PostChecksumValidator implements ConstraintValidator<PostChecksumConstraint, PostChecksum> {

    private static Logger log = LoggerFactory.getLogger(PostChecksumValidator.class);

    @Override
    public void initialize(PostChecksumConstraint constraintAnnotation) {}

    @Override
    public boolean isValid(PostChecksum checksum, ConstraintValidatorContext context) {
        String securitySalt = ServiceUtils.getValidationService().getSecuritySalt();

        if (securitySalt.isEmpty()) {
            log.warn("Security is disabled in this service. Make sure this is intentional.");
            return true;
        }

        String queryStringWithoutChecksum = checksum.getQueryStringWithoutChecksum();
        log.info("query string after checksum removed: [{}]", queryStringWithoutChecksum);

        if(queryStringWithoutChecksum == null) {
            return false;
        }

        String providedChecksum = checksum.getChecksum();
        log.info("CHECKSUM={} length={}", providedChecksum, providedChecksum.length());

        if(providedChecksum == null) {
            return false;
        }

        String data = checksum.getApiCall() + queryStringWithoutChecksum + securitySalt;
        String createdCheckSum = DigestUtils.sha1Hex(data);

        if (createdCheckSum == null || !createdCheckSum.equalsIgnoreCase(providedChecksum)) {
            log.info("checksumError: failed checksum. our checksum: [{}], client: [{}]", createdCheckSum, providedChecksum);
            return false;
        }

        return true;
    }
}
