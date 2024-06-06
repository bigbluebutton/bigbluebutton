package org.bigbluebutton.api.model.constraint;

import org.bigbluebutton.api.model.constraint.list.PatternList;
import org.bigbluebutton.api.model.validator.PatternValidator;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.*;

@Target({ElementType.METHOD, ElementType.FIELD, ElementType.ANNOTATION_TYPE, ElementType.CONSTRUCTOR, ElementType.PARAMETER, ElementType.TYPE_USE})
@Retention(RetentionPolicy.RUNTIME)
@Repeatable(PatternList.class)
@Constraint(validatedBy = PatternValidator.class)
public @interface Pattern {

    String regexp();
    Flag[] flags() default {};
    String key() default "validationError";
    String message() default "Value contains invalid characters";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};

    enum Flag {
        UNIX_LINES(1),
        CASE_INSENSITIVE(2),
        COMMENTS(4),
        MULTILINE(8),
        DOTALL(32),
        UNICODE_CASE(64),
        CANON_EQ(128);

        private final int value;

        private Flag(int value) {
            this.value = value;
        }

        public int getValue() {
            return this.value;
        }
    }
}
