package org.bigbluebutton.api.model.constraint;

import org.bigbluebutton.api.model.constraint.list.SizeList;
import org.bigbluebutton.api.model.validator.SizeValidator;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.*;

@Target({ElementType.METHOD, ElementType.FIELD, ElementType.ANNOTATION_TYPE, ElementType.CONSTRUCTOR, ElementType.PARAMETER, ElementType.TYPE_USE})
@Retention(RetentionPolicy.RUNTIME)
@Repeatable(SizeList.class)
@Constraint(validatedBy = SizeValidator.class)
public @interface Size {

    String key() default "sizeError";
    String message() default "Value does not conform to size restrictions";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
    int min() default 0;
    int max() default 2147483647;
}
