package org.bigbluebutton.api.model.constraint;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Size(min = 2, max = 64, message = "Password must be between 8 and 20 characters")
@Constraint(validatedBy = {})
@Target(FIELD)
@Retention(RUNTIME)
public @interface PasswordConstraint {

    String key() default "invalidPassword";
    String message() default "Invalid password";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
