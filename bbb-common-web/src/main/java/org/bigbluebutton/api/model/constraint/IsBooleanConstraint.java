package org.bigbluebutton.api.model.constraint;

import org.bigbluebutton.api.model.validator.IsBooleanValidator;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Constraint(validatedBy = IsBooleanValidator.class)
@Target(FIELD)
@Retention(RUNTIME)
public @interface IsBooleanConstraint {

    String key() default "validationError";
    String message() default "Value must be a boolean";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
