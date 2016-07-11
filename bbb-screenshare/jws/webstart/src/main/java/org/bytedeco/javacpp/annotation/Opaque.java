package org.bytedeco.javacpp.annotation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.bytedeco.javacpp.Pointer;
import org.bytedeco.javacpp.tools.Generator;

/**
 * This annotation must be used for native types that get declared but not defined.
 * Such types do not work with the {@code sizeof()} operator and their pointers
 * do not support arithmetic, so for peer classes thus annotated, {@link Generator}
 * then also ignores the {@link Pointer#position} value.
 *
 * @see Generator
 *
 * @author Samuel Audet
 */
@Documented @Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE})
public @interface Opaque { }
