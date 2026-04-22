package org.bigbluebutton.api.model.constraint;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import org.bigbluebutton.api.model.validator.UrlValidator;

import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Constraint(validatedBy = UrlValidator.class)
@Target(FIELD)
@Retention(RUNTIME)
public @interface UrlConstraint {
    String key() default "validationError";
    String message() default "Param 'presentationUploadExternalUrl' is not a valid URL";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
