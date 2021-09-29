package org.bigbluebutton.api.service;

import org.bigbluebutton.api.MeetingService;
import org.bigbluebutton.api.ParamsProcessorUtil;
import org.bigbluebutton.api.domain.Meeting;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ServiceUtils {

    private static Logger log = LoggerFactory.getLogger(ServiceUtils.class);

    private static MeetingService meetingService;
    private static ValidationService validationService;

    public void setMeetingService(MeetingService meetingService) { this.meetingService = meetingService; }
    public static MeetingService getMeetingService() { return meetingService; }

    public void setValidationService(ValidationService validationService) { this.validationService = validationService; }
    public static ValidationService getValidationService() { return validationService; }

    public static Meeting findMeetingFromMeetingID(String meetingID) {
        log.info("Attempting to find meeting with ID {}", meetingID);
        Meeting meeting = meetingService.getMeeting(meetingID);

        if(meeting == null) {
            log.info("Meeting with ID {} could not be found", meetingID);
            log.info("Provided ID {} may be an external ID converting to an internal ID", meetingID);

            ParamsProcessorUtil paramsProcessorUtil = new ParamsProcessorUtil();
            String internalMeetingID = paramsProcessorUtil.convertToInternalMeetingId(meetingID);
            log.info("Provided ID {} converted to internal ID {}", meetingID, internalMeetingID);

            meeting = meetingService.getMeeting(internalMeetingID);
        }

        return meeting;
    }
}
