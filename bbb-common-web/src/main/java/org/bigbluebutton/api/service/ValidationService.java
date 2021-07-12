package org.bigbluebutton.api.service;

import org.bigbluebutton.api.model.request.*;
import org.bigbluebutton.api.model.shared.Checksum;
import org.bigbluebutton.api.model.shared.GetChecksum;
import org.bigbluebutton.api.model.shared.PostChecksum;
import org.bigbluebutton.api.util.ParamsUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.validation.ConstraintViolation;
import javax.validation.Validation;
import javax.validation.Validator;
import javax.validation.ValidatorFactory;
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
        SET_POLL_XML("setPollXML", RequestType.POST),
        GUEST_WAIT("guestWait", RequestType.GET),
        ENTER("enter", RequestType.GET),
        STUNS("stuns", RequestType.GET),
        SIGN_OUT("signOut", RequestType.GET);

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
    private Boolean allowRequestsWithoutSession;

    private ValidatorFactory validatorFactory;
    private Validator validator;

    public ValidationService() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    public Set<String> validate(ApiCall apiCall, Map<String, String[]> params, String queryString) {
        log.info("Validating {} request with query string {}", apiCall.getName(), queryString);

        params = sanitizeParams(params);

        Request request = initializeRequest(apiCall, params, queryString);
        Set<String> violations = new HashSet<>();

        if(request == null) {
            violations.add("validationError: Request not recognized");
        } else {
            request.populateFromParamsMap(params);
            violations = performValidation(request);
        }

        return violations;
    }

    private Request initializeRequest(ApiCall apiCall, Map<String, String[]> params, String queryString) {
        Request request = null;
        Checksum checksum;

        String checksumValue = "";
        if(params.containsKey("checksum")) {
            checksumValue = params.get("checksum")[0];
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
                    case SET_POLL_XML:
                        request = new SetPollXML(checksum);
                        break;
                    case GET_MEETINGS:
                    case GET_SESSIONS:
                        request = new SimpleRequest(checksum);
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
                }
            case POST:
                checksum = new PostChecksum(apiCall.getName(), checksumValue, params);
                switch(apiCall) {
                    case SET_POLL_XML:
                        request = new SetPollXML(checksum);
                }
        }

        return request;
    }

    private <R extends Request> Set<String> performValidation(R classToValidate) {
        Set<ConstraintViolation<R>> violations = validator.validate(classToValidate);
        Set<String> violationSet = new HashSet<>();

        for(ConstraintViolation<R> violation: violations) {
            violationSet.add(violation.getMessage());
        }

        if(violationSet.isEmpty()) {
            classToValidate.convertParamsFromString();
        }

        return violationSet;
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

    public void setSecuritySalt(String securitySalt) { this.securitySalt = securitySalt; }
    public String getSecuritySalt() { return securitySalt; }

    public void setAllowRequestsWithoutSession(Boolean allowRequestsWithoutSession) {
        this.allowRequestsWithoutSession = allowRequestsWithoutSession;
    }
    public Boolean getAllowRequestsWithoutSession() { return allowRequestsWithoutSession; }
}
