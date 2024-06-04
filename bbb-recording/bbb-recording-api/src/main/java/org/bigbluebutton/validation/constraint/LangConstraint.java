package org.bigbluebutton.validation.constraint;

import org.bigbluebutton.validation.validator.LangValidator;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Constraint(validatedBy = LangValidator.class)
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface LangConstraint {

    String message() default "7008";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
