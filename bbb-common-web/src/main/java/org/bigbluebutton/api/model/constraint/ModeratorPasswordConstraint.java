package org.bigbluebutton.api.model.constraint;

import org.bigbluebutton.api.model.validator.ModeratorPasswordValidator;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.TYPE;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Constraint(validatedBy = ModeratorPasswordValidator.class)
@Target(TYPE)
@Retention(RUNTIME)
public @interface ModeratorPasswordConstraint {

    String key() default "invalidPassword";
    String message() default "The supplied moderator password is incorrect";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
