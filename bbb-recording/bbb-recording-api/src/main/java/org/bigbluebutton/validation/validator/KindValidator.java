package org.bigbluebutton.validation.validator;

import org.bigbluebutton.validation.constraint.KindConstraint;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class KindValidator implements ConstraintValidator<KindConstraint, String> {

    private static final Logger logger = LoggerFactory.getLogger(KindValidator.class);

    @Override
    public void initialize(KindConstraint constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
    }

    @Override
    public boolean isValid(String kind, ConstraintValidatorContext constraintValidatorContext) {
        logger.info("Validating provided kind parameter: {}", kind);
        return kind.equals("subtitles") || kind.equals("captions");
    }
}
