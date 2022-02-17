package org.bigbluebutton.api.model.constraint;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@NotEmpty(key = "missingParamMeetingID", message = "You must provide a meeting ID")
@Size(min = 2, max = 256, message = "Meeting ID must be between 2 and 256 characters")
@Pattern(regexp = "^[^,]+$", message = "Meeting ID cannot contain ','")
@Constraint(validatedBy = {})
@Target(FIELD)
@Retention(RUNTIME)
public @interface MeetingIDConstraint {

    String key() default "validationError";
    String message() default "Invalid meeting ID";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
