package org.bigbluebutton.validation.constraint;

import org.bigbluebutton.validation.validator.KindValidator;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Constraint(validatedBy = KindValidator.class)
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface KindConstraint {

    String message() default "7007";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
