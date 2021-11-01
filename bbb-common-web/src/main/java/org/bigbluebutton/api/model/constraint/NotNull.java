package org.bigbluebutton.api.model.constraint;

import org.bigbluebutton.api.model.constraint.list.NotNullList;
import org.bigbluebutton.api.model.validator.NotNullValidator;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.*;

@Target({ElementType.METHOD, ElementType.FIELD, ElementType.ANNOTATION_TYPE, ElementType.CONSTRUCTOR, ElementType.PARAMETER, ElementType.TYPE_USE})
@Retention(RetentionPolicy.RUNTIME)
@Repeatable(NotNullList.class)
@Constraint(validatedBy = NotNullValidator.class)
public @interface NotNull {

    String key() default "nullError";
    String message() default "Value cannot be null";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
