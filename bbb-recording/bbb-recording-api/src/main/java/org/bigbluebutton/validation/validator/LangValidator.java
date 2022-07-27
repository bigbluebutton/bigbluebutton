package org.bigbluebutton.validation.validator;

import org.apache.commons.lang3.LocaleUtils;
import org.bigbluebutton.response.error.Error;
import org.bigbluebutton.response.error.Errors;
import org.bigbluebutton.validation.constraint.LangConstraint;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import java.util.Locale;

public class LangValidator implements ConstraintValidator<LangConstraint, String> {

    @Override
    public void initialize(LangConstraint constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
    }

    @Override
    public boolean isValid(String lang, ConstraintValidatorContext constraintValidatorContext) {
        try {
            Locale locale = LocaleUtils.toLocale(lang);
        } catch (IllegalArgumentException e) {
            return false;
        }

        return true;
    }
}
