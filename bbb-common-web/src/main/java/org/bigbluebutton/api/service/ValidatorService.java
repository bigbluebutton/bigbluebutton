package org.bigbluebutton.api.service;

import org.apache.http.NameValuePair;
import org.apache.http.client.utils.URLEncodedUtils;
import org.bigbluebutton.api.model.request.CreateMeeting;
import org.bigbluebutton.api.model.request.JoinMeeting;
import org.bigbluebutton.api.model.request.Request;
import org.bigbluebutton.api.model.shared.Checksum;
import org.bigbluebutton.api.util.ParamsUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.validation.ConstraintViolation;
import javax.validation.Validation;
import javax.validation.Validator;
import javax.validation.ValidatorFactory;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class ValidatorService {

    private static Logger log = LoggerFactory.getLogger(ValidatorService.class);

    public static enum ApiCall {
        CREATE("create"),
        JOIN("join");

        private final String name;

        private ApiCall(String name) {
            this.name = name;
        }

        public String getName() { return this.name; }
    }

    private static String securitySalt;

    private ValidatorFactory validatorFactory;
    private Validator validator;

    public ValidatorService() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    public Set<String> validate(ApiCall apiCall, Map<String, String[]> params, String queryString) {
        log.info("Validating {} request with parameters {}", apiCall.getName(), queryString);

        params = sanitizeParams(params);

        Checksum checksum = new Checksum(apiCall.getName(), params.get("checksum")[0], queryString);

        Request request = null;
        Set<String> violations = new HashSet<>();

        switch(apiCall) {
            case CREATE:
                request = new CreateMeeting(checksum);
                break;
            case JOIN:
                request = new JoinMeeting(checksum);
                break;
            default:
                violations.add("validationError: Request not recognized");
                break;
        }

        if(request != null) {
            request.populateFromParamsMap(params);
            violations = performValidation(request);
        }

        return violations;
    }

    private <R extends Request> Set<String> performValidation(R classToValidate) {
        Set<ConstraintViolation<R>> violations = validator.validate(classToValidate);
        Set<String> violationSet = new HashSet<>();

        for(ConstraintViolation<R> violation: violations) {
            violationSet.add(violation.getMessage());
        }

        return violationSet;
    }

    private Map<String, String[]> sanitizeParams(Map<String, String[]> params) {
        Map<String, String[]> sanitizedParams = new LinkedHashMap<>();

        for(Map.Entry<String, String[]> param: params.entrySet()) {
            String paramName = ParamsUtil.sanitizeString(param.getKey());
            String[] sanitizedValues = new String[param.getValue().length];

            for(int i = 0; i < sanitizedValues.length; i++) {
                String sanitziedValue = ParamsUtil.sanitizeString(param.getValue()[i]);
                sanitizedValues[i] = sanitziedValue;
            }

            sanitizedParams.put(paramName, sanitizedValues);
        }

        return sanitizedParams;
    }

    public void setSecuritySalt(String securitySalt) { this.securitySalt = securitySalt; }
    public static String getSecuritySalt() { return securitySalt; }
}
