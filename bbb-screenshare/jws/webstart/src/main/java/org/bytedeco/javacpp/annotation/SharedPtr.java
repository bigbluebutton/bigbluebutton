package org.bytedeco.javacpp.annotation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.bytedeco.javacpp.Pointer;
import org.bytedeco.javacpp.tools.Generator;

/**
 * A shorthand for {@code @Adapter("SharedPtrAdapter<type>")}.
 * We also need to define the {@code SHARED_PTR_NAMESPACE} macro
 * to something like {@code boost} or {@code std}.
 *
 * @see Adapter
 * @see Generator
 *
 * @author Samuel Audet
 */
@Documented @Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.PARAMETER})
@Adapter("SharedPtrAdapter")
public @interface SharedPtr {
    /** The template type of {@code SharedPtrAdapter}. If not specified, it is
     *  inferred from the value type of the {@link Pointer} or Java array. */
    String value() default "";
}