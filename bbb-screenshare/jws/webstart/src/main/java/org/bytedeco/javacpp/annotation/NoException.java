package org.bytedeco.javacpp.annotation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.bytedeco.javacpp.tools.Generator;

/**
 * By default, {@link Generator} assumes all native functions may throw exceptions.
 * This way, any C++ exception thrown from a function gets caught and translated
 * into a {@link RuntimeException}. However, this adds some overhead and requires
 * additional support from the compiler. Annotating a class or a method with this
 * annotation indicates that none of the enclosed functions can throw exceptions,
 * and need not be included in a {@code try{ ... }} block.
 *
 * @see Generator
 *
 * @author Samuel Audet
 */
@Documented @Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.METHOD})
public @interface NoException { }
