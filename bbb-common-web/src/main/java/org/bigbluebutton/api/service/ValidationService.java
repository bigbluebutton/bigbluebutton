package org.bigbluebutton.api.service;

import org.bigbluebutton.api.model.request.*;
import org.bigbluebutton.api.model.shared.Checksum;
import org.bigbluebutton.api.model.shared.ChecksumValidationGroup;
import org.bigbluebutton.api.model.shared.GetChecksum;
import org.bigbluebutton.api.util.ParamsUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletRequest;
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
        INSERT_DOCUMENT("insertDocument", RequestType.GET);

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

    public Map<String, String> validate(ApiCall apiCall, HttpServletRequest servletRequest) {
        String queryString = servletRequest.getQueryString();
        Map<String, String[]> params = servletRequest.getParameterMap();
        log.info("Validating {} request with query string {}", apiCall.getName(), queryString);
        params = sanitizeParams(params);

        Request request = initializeRequest(apiCall, params, queryString, servletRequest);
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

    private Request initializeRequest(ApiCall apiCall, Map<String, String[]> params, String queryString, HttpServletRequest servletRequest) {
        Request request = null;
        Checksum checksum;

        String checksumValue = "";
        if(params.containsKey("checksum")) {
            checksumValue = params.get("checksum")[0];
        }

        if (Objects.requireNonNull(apiCall.requestType) == RequestType.GET) {
            checksum = new GetChecksum(apiCall.getName(), checksumValue, queryString, servletRequest);
            request = switch (apiCall) {
                case CREATE -> new CreateMeeting(checksum, servletRequest);
                case JOIN -> new JoinMeeting(checksum, servletRequest);
                case MEETING_RUNNING -> new MeetingRunning(checksum, servletRequest);
                case END -> new EndMeeting(checksum, servletRequest);
                case GET_MEETING_INFO -> new MeetingInfo(checksum, servletRequest);
                case GET_MEETINGS, GET_SESSIONS -> new SimpleRequest(checksum, servletRequest);
                case INSERT_DOCUMENT -> new InsertDocument(checksum, servletRequest);
                case GUEST_WAIT -> new GuestWait(servletRequest);
                case ENTER -> new Enter(servletRequest);
                case STUNS -> new Stuns(servletRequest);
                case SIGN_OUT -> new SignOut(servletRequest);
                case LEARNING_DASHBOARD -> new LearningDashboard(servletRequest);
                case GET_JOIN_URL -> new GetJoinUrl(servletRequest);
            };
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
