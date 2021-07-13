package org.bigbluebutton.api.model.validator;

import org.bigbluebutton.api.model.constraint.IsBooleanConstraint;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class IsBooleanValidator implements ConstraintValidator<IsBooleanConstraint, String> {

    @Override
    public void initialize(IsBooleanConstraint constraintAnnotation) {}

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {

        if(value == null) {
            return true;
        }

        Boolean isValid = false;

        switch(value) {
            case "True":
            case "true":
            case "False":
            case "false":
                isValid = true;
                break;
            default:
                break;
        }

        return isValid;
    }
}
