package org.bigbluebutton.api.model.validator;

import org.bigbluebutton.api.model.constraint.PasswordConstraint;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PasswordValidator implements ConstraintValidator<PasswordConstraint, String> {

    private static Logger log = LoggerFactory.getLogger(PasswordValidator.class);

    @Override
    public void initialize(PasswordConstraint constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
    }

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        log.info("Validating password [{}]", password);
        if (password != null && !password.isEmpty()){
            if (password.length() < 2 || password.length() > 64) {
                log.info("Passwords must be between 2 and 64 characters in length");
                return false;
            }
        }

        return true;
    }
}
