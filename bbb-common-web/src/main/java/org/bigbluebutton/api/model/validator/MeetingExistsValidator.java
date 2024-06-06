package org.bigbluebutton.api.model.validator;

import org.bigbluebutton.api.domain.Meeting;
import org.bigbluebutton.api.model.constraint.MeetingExistsConstraint;
import org.bigbluebutton.api.service.ServiceUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class MeetingExistsValidator implements ConstraintValidator<MeetingExistsConstraint, String> {

    private static Logger log = LoggerFactory.getLogger(MeetingExistsValidator.class);

    @Override
    public void initialize(MeetingExistsConstraint constraintAnnotation) {}

    @Override
    public boolean isValid(String meetingID, ConstraintValidatorContext context) {
        log.info("Validating existence of meeting with ID {}", meetingID);

        if(meetingID == null) {
            return false;
        }

        Meeting meeting = ServiceUtils.findMeetingFromMeetingID(meetingID);

        if(meeting == null) {
            log.info("meetingExistsError: No meeting with the given ID {} could be found", meetingID);
            return false;
        }

        return true;
    }
}
