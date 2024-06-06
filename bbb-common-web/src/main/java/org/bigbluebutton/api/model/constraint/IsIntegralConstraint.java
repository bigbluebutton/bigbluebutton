package org.bigbluebutton.api.model.constraint;

import org.bigbluebutton.api.model.validator.IsIntegralValidator;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Constraint(validatedBy = IsIntegralValidator.class)
@Target(FIELD)
@Retention(RUNTIME)
public @interface IsIntegralConstraint {

    String key() default "validationError";
    String message() default "Value must be an integral number";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
