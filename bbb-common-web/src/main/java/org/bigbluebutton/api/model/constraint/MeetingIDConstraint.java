package org.bigbluebutton.api.model.constraint;

import javax.validation.Constraint;
import javax.validation.Payload;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@NotEmpty(message = "You must provide a meeting ID")
@Size(min = 2, max = 256, message = "Meeting ID must be between 2 and 256 characters")
@Pattern(regexp = "^[a-zA-Z0-9\\s!@#$%^&*()_\\-+=\\[\\]{};:.'\"<>?\\\\|\\/]+$", message = "Meeting ID cannot contain ','")
@Constraint(validatedBy = {})
@Target(FIELD)
@Retention(RUNTIME)
public @interface MeetingIDConstraint {

    String message() default "Invalid meeting ID";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
