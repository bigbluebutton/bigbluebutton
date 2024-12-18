package org.bigbluebutton.api.model.constraint;

import org.bigbluebutton.api.model.validator.ContentTypeValidator;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.TYPE;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Constraint(validatedBy = ContentTypeValidator.class)
@Target(TYPE)
@Retention(RUNTIME)
public @interface ContentTypeConstraint {

    String key() default "unsupportedContentType";
    String message() default "POST request Content-Type is missing or unsupported";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
