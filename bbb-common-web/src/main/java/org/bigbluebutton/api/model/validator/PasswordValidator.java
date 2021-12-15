package org.bigbluebutton.api.model.validator;

import org.bigbluebutton.api.model.constraint.PasswordConstraint;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class PasswordValidator implements ConstraintValidator<PasswordConstraint, String> {

    @Override
    public void initialize(PasswordConstraint constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
    }

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if(password == null || password.equals("")) return true;
        if(password.length() < 2 || password.length() > 64) return false;
        return true;
    }
}
