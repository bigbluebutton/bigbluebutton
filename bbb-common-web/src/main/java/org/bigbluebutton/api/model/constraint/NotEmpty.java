package org.bigbluebutton.api.model.constraint;

import org.bigbluebutton.api.model.constraint.list.NotEmptyList;
import org.bigbluebutton.api.model.validator.NotEmptyValidator;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.*;

@Constraint(validatedBy = NotEmptyValidator.class)
@Target({ElementType.METHOD, ElementType.FIELD, ElementType.ANNOTATION_TYPE, ElementType.CONSTRUCTOR, ElementType.PARAMETER, ElementType.TYPE_USE})
@Retention(RetentionPolicy.RUNTIME)
@Repeatable(NotEmptyList.class)
public @interface NotEmpty {

    String key() default "emptyError";
    String message() default "Field must contain a value";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
