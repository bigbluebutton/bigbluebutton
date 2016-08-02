package org.bytedeco.javacpp.annotation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.bytedeco.javacpp.FunctionPointer;
import org.bytedeco.javacpp.tools.Generator;

/**
 * Indicates that an argument gets passed or returned by value. When used
 * alongside {@link FunctionPointer}, the {@link Generator} passes the underlying
 * C++ function object (aka functor) instead of a function pointer.
 *
 * @see Generator
 *
 * @author Samuel Audet
 */
@Documented @Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.PARAMETER})
public @interface ByVal {
    /** A C++ expression to use when null is passed. By default {@link NullPointerException} is thrown. */
    String nullValue() default "";
}
