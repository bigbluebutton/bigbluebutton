package org.bigbluebutton.api.model.validator;

import org.bigbluebutton.api.MeetingService;
import org.bigbluebutton.api.domain.Meeting;
import org.bigbluebutton.api.domain.UserSession;
import org.bigbluebutton.api.model.constraint.MaxParticipantsConstraint;
import org.bigbluebutton.api.service.ServiceUtils;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class MaxParticipantsValidator implements ConstraintValidator<MaxParticipantsConstraint, String> {

    @Override
    public void initialize(MaxParticipantsConstraint constraintAnnotation) {}

    @Override
    public boolean isValid(String sessionToken, ConstraintValidatorContext constraintValidatorContext) {

        if(sessionToken == null) {
            return false;
        }

        MeetingService meetingService = ServiceUtils.getMeetingService();
        UserSession userSession = meetingService.getUserSessionWithAuthToken(sessionToken);

        if(userSession == null) {
            return false;
        }

        Meeting meeting = meetingService.getMeeting(userSession.meetingID);

        if(meeting == null) {
            return false;
        }

        int maxParticipants = meeting.getMaxUsers();
        boolean enabled = maxParticipants > 0;
        boolean rejoin = meeting.getUserById(userSession.internalUserId) != null;
        boolean reenter = meeting.getEnteredUserById(userSession.internalUserId) != null;
        int joinedUsers = meeting.getUsers().size();

        boolean reachedMax = joinedUsers >= maxParticipants;
        if(enabled && !rejoin && !reenter && reachedMax) {
            return false;
        }

        return true;
    }
}
