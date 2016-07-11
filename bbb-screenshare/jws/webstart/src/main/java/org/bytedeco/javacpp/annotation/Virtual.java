package org.bytedeco.javacpp.annotation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.bytedeco.javacpp.tools.Generator;

/**
 * Indicates that a method maps to a virtual function in C++. 
 * This allows a user to override that function in Java.
 *
 * @see Generator
 *
 * @author Samuel Audet
 */
@Documented @Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD})
public @interface Virtual {
    /** Pure (abstract) or not. */
    boolean value() default false;
}