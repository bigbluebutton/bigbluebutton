package org.bytedeco.javacpp.annotation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.bytedeco.javacpp.FunctionPointer;
import org.bytedeco.javacpp.tools.Generator;

/**
 * A shortcut annotation to {@link Cast} that simply adds {@code const} to the parameter type.
 * Can also be declared on a {@link FunctionPointer} in the case of {@code const} functions.
 *
 * @see Generator
 *
 * @author Samuel Audet
 */
@Documented @Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.METHOD, ElementType.PARAMETER})
public @interface Const {
    /** If {@code true}, applies {@code const} to the value and to the pointer, respectively. */
    boolean[] value() default {true, false};
}
