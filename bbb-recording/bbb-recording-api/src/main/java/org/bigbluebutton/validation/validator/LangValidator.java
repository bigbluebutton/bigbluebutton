package org.bigbluebutton.validation.validator;

import org.apache.commons.lang3.LocaleUtils;
import org.bigbluebutton.validation.constraint.LangConstraint;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class LangValidator implements ConstraintValidator<LangConstraint, String> {

    private static final Logger logger = LoggerFactory.getLogger(LangValidator.class);

    @Override
    public void initialize(LangConstraint constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
    }

    @Override
    public boolean isValid(String lang, ConstraintValidatorContext constraintValidatorContext) {
        logger.info("Validating provided lang parameter: {}", lang);
        try {
            LocaleUtils.toLocale(lang);
        } catch (IllegalArgumentException e) {
            return false;
        }

        return true;
    }
}
