package org.bigbluebutton.api.model.constraint;

import org.bigbluebutton.api.model.validator.MeetingEndedValidator;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Constraint(validatedBy = MeetingEndedValidator.class)
@Target(FIELD)
@Retention(RUNTIME)
public @interface MeetingEndedConstraint {

    String key() default "meetingForciblyEnded";
    String message() default "You can not join a meeting that has already been forcibly ended";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
