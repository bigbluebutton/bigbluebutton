package org.bytedeco.javacpp.annotation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.bytedeco.javacpp.tools.Generator;

/**
 * An annotation indicating that a method should behave like a value setter.
 * However, a pair of methods named {@code get()} and {@code put()}, where the
 * number of parameters are either equal, in the case of arrays, or differs by one
 * where the type of the extra parameter is the same as the return value of the other,
 * and the remaining return value types are {@code void} or of the enclosing class,
 * are recognized as a value getter/setter pair even without annotation. This behavior
 * can be changed by annotating the methods with the {@link Function} annotation.
 * <p>
 * A value setter must return no value, or an object of its own {@link Class}, while
 * its number of parameters must be greater than 0. The assigned value is assumed
 * to come from pointer dereference, but anything that follows the same syntax as the
 * assignment of a dereferenced pointer could potentially work with this annotation.
 * All but the last argument are considered as indices to access a value array.
 *
 * @see Generator
 *
 * @author Samuel Audet
 */
@Documented @Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD})
public @interface ValueSetter { }