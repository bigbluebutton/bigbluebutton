package org.bigbluebutton.api.model.constraint;

import org.bigbluebutton.api.model.validator.UserSessionValidator;

import javax.validation.Constraint;
import javax.validation.Payload;
import javax.validation.constraints.NotNull;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@NotNull(message = "missingToken-You must provide a session token")
@Constraint(validatedBy = { UserSessionValidator.class })
@Target(FIELD)
@Retention(RUNTIME)
public @interface UserSessionConstraint {

    String message() default "missingSession-Invalid session token";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
