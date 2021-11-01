package org.bigbluebutton.api.model.constraint;

import org.bigbluebutton.api.model.validator.MeetingExistsValidator;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Constraint(validatedBy = MeetingExistsValidator.class)
@Target(FIELD)
@Retention(RUNTIME)
public @interface MeetingExistsConstraint {

    String key() default "notFound";
    String message() default "A meeting with that ID does not exist";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
