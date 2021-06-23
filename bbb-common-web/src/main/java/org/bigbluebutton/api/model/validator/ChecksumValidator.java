package org.bigbluebutton.api.model.validator;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

import org.apache.commons.codec.digest.DigestUtils;
import org.bigbluebutton.api.model.shared.Checksum;
import org.bigbluebutton.api.model.constraint.ChecksumConstraint;
import org.bigbluebutton.api.service.ValidatorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ChecksumValidator implements ConstraintValidator<ChecksumConstraint, Checksum> {

    private static Logger log = LoggerFactory.getLogger(ChecksumValidator.class);

    @Override
    public void initialize(ChecksumConstraint checksumConstraint) {}

    @Override
    public boolean isValid(Checksum checksum, ConstraintValidatorContext context) {
        String securitySalt = ValidatorService.getSecuritySalt();

        log.info("Security salt: {}", securitySalt);

        String queryStringWithoutChecksum = checksum.getQueryStringWithoutChecksum();
        log.info("query string after checksum removed: [{}]", queryStringWithoutChecksum);

        String providedChecksum = checksum.getChecksum();
        log.info("CHECKSUM={} length={}", providedChecksum, providedChecksum.length());

        String data = checksum.getApiCall() + queryStringWithoutChecksum + securitySalt;
        String createdCheckSum = DigestUtils.sha1Hex(data);

        if (providedChecksum.length() == 64) {
            createdCheckSum = DigestUtils.sha256Hex(data);
            log.info("SHA256 {}", createdCheckSum);
        }

        if (createdCheckSum == null || !createdCheckSum.equals(providedChecksum)) {
            log.info("checksumError: query string checksum failed. our: [{}], client: [{}]", createdCheckSum, providedChecksum);
            return false;
        }

        return true;
    }
}
