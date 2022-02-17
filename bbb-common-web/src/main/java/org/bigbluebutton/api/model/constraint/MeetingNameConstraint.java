package org.bigbluebutton.api.model.constraint;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@NotNull(message = "You must provide a meeting name")
@NotEmpty(message = "You must provide a meeting name")
@Size(min = 2, max = 256, message = "Meeting name must be between 2 and 256 characters")
@Constraint(validatedBy = {})
@Target(FIELD)
@Retention(RUNTIME)
public @interface MeetingNameConstraint {

    String key() default "validationError";
    String message() default "Invalid meeting name";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
