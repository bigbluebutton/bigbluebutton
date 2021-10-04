package org.bigbluebutton.api.model.constraint;

import org.bigbluebutton.api.model.validator.GuestPolicyValidator;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Constraint(validatedBy = { GuestPolicyValidator.class })
@Target(FIELD)
@Retention(RUNTIME)
public @interface GuestPolicyConstraint {

    String key() default "guestDeny";
    String message() default "User denied access for this session";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
