package org.bigbluebutton.api.model.validator;

import org.bigbluebutton.api.domain.UserSession;
import org.bigbluebutton.api.model.constraint.UserSessionConstraint;
import org.bigbluebutton.api.service.ServiceUtils;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class UserSessionValidator implements ConstraintValidator<UserSessionConstraint, String> {

    @Override
    public void initialize(UserSessionConstraint constraintAnnotation) {}

    @Override
    public boolean isValid(String sessionToken, ConstraintValidatorContext constraintValidatorContext) {

        if(sessionToken == null) {
            return false;
        }

        UserSession userSession = ServiceUtils.getMeetingService().getUserSessionWithAuthToken(sessionToken);

        if(userSession == null) {
            return false;
        }

        return true;
    }
}
