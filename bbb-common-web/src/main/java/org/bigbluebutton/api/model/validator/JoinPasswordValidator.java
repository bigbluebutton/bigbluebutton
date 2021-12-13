package org.bigbluebutton.api.model.validator;

import org.bigbluebutton.api.domain.Meeting;
import org.bigbluebutton.api.model.constraint.JoinPasswordConstraint;
import org.bigbluebutton.api.model.shared.JoinPassword;
import org.bigbluebutton.api.service.ServiceUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class JoinPasswordValidator implements ConstraintValidator<JoinPasswordConstraint, JoinPassword> {

    private static Logger log = LoggerFactory.getLogger(JoinPasswordValidator.class);

    @Override
    public void initialize(JoinPasswordConstraint constraintAnnotation) {}

    @Override
    public boolean isValid(JoinPassword joinPassword, ConstraintValidatorContext constraintValidatorContext) {
        log.info("Validating password {} for meeting with ID {}",
                joinPassword.getPassword(), joinPassword.getMeetingID());

        if(joinPassword.getMeetingID() == null) {
            return false;
        }

        Meeting meeting = ServiceUtils.findMeetingFromMeetingID(joinPassword.getMeetingID());

        if(meeting == null) {
            return false;
        }

        String moderatorPassword = meeting.getModeratorPassword();
        String attendeePassword = meeting.getViewerPassword();
        String providedPassword = joinPassword.getPassword();

        if(providedPassword == null) {
            return false;
        }

        log.info("Moderator password: {}", moderatorPassword);
        log.info("Attendee password: {}", attendeePassword);
        log.info("Provided password: {}", providedPassword);

        if(!providedPassword.equals(moderatorPassword) && !providedPassword.equals(attendeePassword)) {
            return false;
        }

        return true;
    }
}
