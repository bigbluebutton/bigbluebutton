package org.bigbluebutton.api.model.validator;

import org.bigbluebutton.api.MeetingService;
import org.bigbluebutton.api.domain.GuestPolicy;
import org.bigbluebutton.api.domain.UserSession;
import org.bigbluebutton.api.model.constraint.GuestPolicyConstraint;
import org.bigbluebutton.api.service.ServiceUtils;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class GuestPolicyValidator implements ConstraintValidator<GuestPolicyConstraint, String> {

    @Override
    public void initialize(GuestPolicyConstraint constraintAnnotation) {}

    @Override
    public boolean isValid(String sessionToken, ConstraintValidatorContext constraintValidatorContext) {

        if(sessionToken == null) {
            return false;
        }

        MeetingService meetingService = ServiceUtils.getMeetingService();
        UserSession userSession = meetingService.getUserSessionWithAuthToken(sessionToken);

        if(userSession == null || !userSession.guestStatus.equals(GuestPolicy.ALLOW)) {
            return false;
        }

        return true;
    }
}
