package org.bytedeco.javacpp.annotation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.bytedeco.javacpp.PointerPointer;
import org.bytedeco.javacpp.tools.Generator;

/**
 * Indicates that an argument gets passed or returned by a pointer to a pointer.
 * This is usually used as a shortcut for the more versatile {@link PointerPointer}
 * peer class, but where the latter is not needed because the argument is not an array.
 *
 * @see Generator
 *
 * @author Samuel Audet
 */
@Documented @Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.PARAMETER})
public @interface ByPtrPtr { }