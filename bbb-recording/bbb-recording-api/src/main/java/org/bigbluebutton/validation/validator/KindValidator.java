package org.bigbluebutton.validation.validator;

import org.bigbluebutton.validation.constraint.KindConstraint;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class KindValidator implements ConstraintValidator<KindConstraint, String> {

    @Override
    public void initialize(KindConstraint constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
    }

    @Override
    public boolean isValid(String kind, ConstraintValidatorContext constraintValidatorContext) {
        return kind.equals("subtitles") || kind.equals("captions");
    }
}
