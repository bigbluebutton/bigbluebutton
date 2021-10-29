package org.bigbluebutton.api.model.constraint;

import org.bigbluebutton.api.model.validator.PostChecksumValidator;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.TYPE;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Constraint(validatedBy = PostChecksumValidator.class)
@Target(TYPE)
@Retention(RUNTIME)
public @interface PostChecksumConstraint {

    String key() default "checksumError";
    String message() default "Checksums do not match";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
