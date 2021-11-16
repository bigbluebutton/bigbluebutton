package org.bigbluebutton.api.model.constraint;

import org.bigbluebutton.api.model.validator.MaxParticipantsValidator;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Constraint(validatedBy = { MaxParticipantsValidator.class })
@Target(FIELD)
@Retention(RUNTIME)
public @interface MaxParticipantsConstraint {

    String key() default "maxParticipantsReached";
    String message() default "The maximum number of participants for the meeting has been reached";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
