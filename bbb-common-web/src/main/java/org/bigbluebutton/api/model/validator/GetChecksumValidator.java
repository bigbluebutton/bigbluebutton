package org.bigbluebutton.api.model.validator;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

import org.apache.commons.codec.digest.DigestUtils;
import org.bigbluebutton.api.model.constraint.GetChecksumConstraint;
import org.bigbluebutton.api.model.shared.GetChecksum;
import org.bigbluebutton.api.service.ServiceUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class GetChecksumValidator implements ConstraintValidator<GetChecksumConstraint, GetChecksum> {

    private static Logger log = LoggerFactory.getLogger(GetChecksumValidator.class);

    @Override
    public void initialize(GetChecksumConstraint checksumConstraint) {}

    @Override
    public boolean isValid(GetChecksum checksum, ConstraintValidatorContext context) {
        String securitySalt = ServiceUtils.getValidationService().getSecuritySalt();
        String supportedChecksumAlgorithms = ServiceUtils.getValidationService().getSupportedChecksumAlgorithms();

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

        int checksumLength = providedChecksum.length();
        String createdCheckSum = null;

        switch(checksumLength) {
            case 40:
                if(supportedChecksumAlgorithms.contains("sha1")) {
                    createdCheckSum = DigestUtils.sha1Hex(data);
                    log.info("SHA1 {}", createdCheckSum);
                }
                break;
            case 64:
                if(supportedChecksumAlgorithms.contains("sha256")) {
                    createdCheckSum = DigestUtils.sha256Hex(data);
                    log.info("SHA256 {}", createdCheckSum);
                }
                break;
            case 96:
                if(supportedChecksumAlgorithms.contains("sha384")) {
                    createdCheckSum = DigestUtils.sha384Hex(data);
                    log.info("SHA384 {}", createdCheckSum);
                }
                break;
            case 128:
                if(supportedChecksumAlgorithms.contains("sha512")) {
                    createdCheckSum = DigestUtils.sha512Hex(data);
                    log.info("SHA512 {}", createdCheckSum);
                }
                break;
            default:
                log.info("No algorithm could be found that matches the provided checksum length");
        }

        if (createdCheckSum == null || !createdCheckSum.equalsIgnoreCase(providedChecksum)) {
            log.info("checksumError: query string checksum failed. our: [{}], client: [{}]", createdCheckSum, providedChecksum);
            return false;
        }

        return true;
    }
}
