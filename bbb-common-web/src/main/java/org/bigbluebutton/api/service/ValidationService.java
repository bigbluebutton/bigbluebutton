package org.bigbluebutton.api.service;

import org.bigbluebutton.api.model.request.*;
import org.bigbluebutton.api.model.shared.Checksum;
import org.bigbluebutton.api.model.shared.ChecksumValidationGroup;
import org.bigbluebutton.api.model.shared.GetChecksum;
import org.bigbluebutton.api.model.shared.PostChecksum;
import org.bigbluebutton.api.util.ParamsUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.validation.ConstraintViolation;
import javax.validation.Validation;
import javax.validation.Validator;
import javax.validation.ValidatorFactory;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class ValidationService {

    private static Logger log = LoggerFactory.getLogger(ValidationService.class);

    public enum RequestType {
        GET,
        POST
    }

    public enum ApiCall {
        CREATE("create", RequestType.GET),
        JOIN("join", RequestType.GET),
        MEETING_RUNNING("isMeetingRunning", RequestType.GET),
        END("end", RequestType.GET),
        GET_MEETING_INFO("getMeetingInfo", RequestType.GET),
        GET_MEETINGS("getMeetings", RequestType.GET),
        GET_SESSIONS("getSessions", RequestType.GET),
        GUEST_WAIT("guestWait", RequestType.GET),
        ENTER("enter", RequestType.GET),
        STUNS("stuns", RequestType.GET),
        SIGN_OUT("signOut", RequestType.GET),
        LEARNING_DASHBOARD("learningDashboard", RequestType.GET),
        GET_JOIN_URL("getJoinUrl", RequestType.GET),
        INSERT_DOCUMENT("insertDocument", RequestType.GET),
        END_PROMPT("endPrompt", RequestType.GET);

        private final String name;
        private final RequestType requestType;

        ApiCall(String name, RequestType requestType) {
            this.name = name;
            this.requestType = requestType;
        }

        public String getName() { return this.name; }
        public RequestType getRequestType() { return this.requestType; }
    }

    private String securitySalt;
    private String supportedChecksumAlgorithms;
    private Boolean allowRequestsWithoutSession;

    private ValidatorFactory validatorFactory;
    private Validator validator;

    public ValidationService() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    public Map<String, String> validate(ApiCall apiCall, Map<String, String[]> params, String queryString) {
        log.info("Validating {} request with query string {}", apiCall.getName(), queryString);
        params = sanitizeParams(params);

        Request request = initializeRequest(apiCall, params, queryString);
        Map<String,String> violations = new HashMap<>();

        if(request == null) {
            violations.put("validationError", "Request not recognized");
        } else if(params.containsKey("presentationUploadExternalUrl")) {
            String urlToValidate = params.get("presentationUploadExternalUrl")[0];
            if(!this.isValidURL(urlToValidate)) {
                violations.put("validationError", "Param 'presentationUploadExternalUrl' is not a valid URL");
            }
        } else {
            request.populateFromParamsMap(params);
            violations = performValidation(request);
        }

        return violations;
    }

    boolean isValidURL(String url) {
        try {
            new URL(url).toURI();
            return true;
        } catch (MalformedURLException | URISyntaxException e) {
            return false;
        }
    }

    private Request initializeRequest(ApiCall apiCall, Map<String, String[]> params, String queryString) {
        Request request = null;
        Checksum checksum;

        String checksumValue = "";
        if(params.containsKey("checksum")) {
            checksumValue = params.get("checksum")[0];
        }

        if(queryString == null || queryString.isEmpty()) {
            queryString = buildQueryStringFromParamsMap(params);
        }

        switch(apiCall.requestType) {
            case GET:
                checksum = new GetChecksum(apiCall.getName(), checksumValue, queryString);
                switch(apiCall) {
                    case CREATE:
                        request = new CreateMeeting(checksum);
                        break;
                    case JOIN:
                        request = new JoinMeeting(checksum);
                        break;
                    case MEETING_RUNNING:
                        request = new MeetingRunning(checksum);
                        break;
                    case END:
                        request = new EndMeeting(checksum);
                        break;
                    case GET_MEETING_INFO:
                        request = new MeetingInfo(checksum);
                        break;
                    case GET_MEETINGS:
                    case GET_SESSIONS:
                        request = new SimpleRequest(checksum);
                        break;
                    case INSERT_DOCUMENT:
                        request = new InsertDocument(checksum);
                        break;
                    case END_PROMPT:
                        request = new EndPrompt(checksum);
                        break;
                    case GUEST_WAIT:
                        request = new GuestWait();
                        break;
                    case ENTER:
                        request = new Enter();
                        break;
                    case STUNS:
                        request = new Stuns();
                        break;
                    case SIGN_OUT:
                        request = new SignOut();
                        break;
                    case LEARNING_DASHBOARD:
                        request = new LearningDashboard();
                        break;
                    case GET_JOIN_URL:
                        request = new GetJoinUrl();
                        break;
                }
        }

        return request;
    }

    private <R extends Request> Map<String, String> performValidation(R classToValidate) {
        Set<ConstraintViolation<R>> violations = validator.validate(classToValidate, ChecksumValidationGroup.class);

        if(violations.isEmpty()) {
            violations = validator.validate(classToValidate);
        }

        return buildViolationsMap(classToValidate, violations);
    }

    private <R extends Request> Map<String, String> buildViolationsMap(R classToValidate, Set<ConstraintViolation<R>> violations) {
        Map<String, String> violationMap = new HashMap<>();

        for(ConstraintViolation<R> violation: violations) {
            Map<String, Object> attributes = violation.getConstraintDescriptor().getAttributes();
            String key;
            String message;

            if(attributes.containsKey("key")) {
                key = (String) attributes.get("key");
            } else {
                key = "validationError";
            }

            if(attributes.containsKey("message")) {
                message = (String) attributes.get("message");
            } else {
                message = "An unknown validation error occurred";
            }

            violationMap.put(key, message);
        }

        if(violationMap.isEmpty()) {
            classToValidate.convertParamsFromString();
        }

        return violationMap;
    }

    private Map<String, String[]> sanitizeParams(Map<String, String[]> params) {
        Map<String, String[]> sanitizedParams = new LinkedHashMap<>();

        for(Map.Entry<String, String[]> param: params.entrySet()) {
            String paramName = ParamsUtil.sanitizeString(param.getKey());
            String[] sanitizedValues = new String[param.getValue().length];

            for(int i = 0; i < sanitizedValues.length; i++) {
                String sanitizedValue = ParamsUtil.sanitizeString(param.getValue()[i]);
                sanitizedValues[i] = sanitizedValue;
            }

            sanitizedParams.put(paramName, sanitizedValues);
        }

        return sanitizedParams;
    }

    private String mapToString(Map<String, String[]> map) {
        StringBuilder mapString = new StringBuilder();

        for(Map.Entry<String, String[]> entry: map.entrySet()) {
            StringBuilder entryString = new StringBuilder();
            entryString.append(entry.getKey() + ": [");

            for(int i = 0; i < entry.getValue().length; i++) {
                if(i == entry.getValue().length - 1) {
                    entryString.append(entry.getValue()[i]);
                } else {
                    entryString.append(entry.getValue()[i] + ", ");
                }
            }

            entryString.append("], ");
            mapString.append(entryString);
        }

        return mapString.toString();
    }

    public static String buildQueryStringFromParamsMap(Map<String, String[]> params) {
        StringBuilder queryString = new StringBuilder();
        SortedSet<String> keys = new TreeSet<>(params.keySet());

        boolean firstParam = true;
        for(String key: keys) {

            if(key.equals("checksum")) {
                continue;
            }

            for(String value: params.get(key)) {
                if(firstParam) {
                    firstParam = false;
                } else {
                    queryString.append("&");
                }

                queryString.append(key);
                queryString.append("=");

                String encodedValue = encodeString(value);
                queryString.append(encodedValue);
            }
        }

        return queryString.toString();
    }

    private static String encodeString(String stringToEncode) {
        String encodedResult;

        try {
            encodedResult = URLEncoder.encode(stringToEncode, StandardCharsets.UTF_8.name());
        } catch(UnsupportedEncodingException ex) {
            encodedResult = stringToEncode;
        }

        return encodedResult;
    }

    public void setSecuritySalt(String securitySalt) { this.securitySalt = securitySalt; }
    public String getSecuritySalt() { return securitySalt; }

    public void setSupportedChecksumAlgorithms(String supportedChecksumAlgorithms) { this.supportedChecksumAlgorithms = supportedChecksumAlgorithms; }
    public String getSupportedChecksumAlgorithms() { return supportedChecksumAlgorithms; }

    public void setAllowRequestsWithoutSession(Boolean allowRequestsWithoutSession) {
        this.allowRequestsWithoutSession = allowRequestsWithoutSession;
    }
    public Boolean getAllowRequestsWithoutSession() { return allowRequestsWithoutSession; }
}
