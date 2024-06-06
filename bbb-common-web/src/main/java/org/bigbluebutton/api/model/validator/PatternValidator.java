package org.bigbluebutton.api.model.validator;

import org.bigbluebutton.api.model.constraint.Pattern;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class PatternValidator implements ConstraintValidator<Pattern, String> {

    String regexp;

    @Override
    public void initialize(Pattern constraintAnnotation) {
        regexp = constraintAnnotation.regexp();
    }

    @Override
    public boolean isValid(String s, ConstraintValidatorContext constraintValidatorContext) {
        if(s == null) return true;
        return java.util.regex.Pattern.matches(regexp, s);
    }
}
