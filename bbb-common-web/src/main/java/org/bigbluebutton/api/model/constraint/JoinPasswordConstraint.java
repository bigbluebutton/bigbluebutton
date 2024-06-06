package org.bigbluebutton.api.model.constraint;

import org.bigbluebutton.api.model.validator.JoinPasswordValidator;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.TYPE;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Constraint(validatedBy = JoinPasswordValidator.class)
@Target(TYPE)
@Retention(RUNTIME)
public @interface JoinPasswordConstraint {

    String key() default "invalidPassword";
    String message() default "The provided password is neither a moderator or attendee password";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
