package org.bytedeco.javacpp.annotation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.nio.Buffer;
import org.bytedeco.javacpp.Pointer;
import org.bytedeco.javacpp.tools.Generator;

/**
 * Specifies a C++ class to act as an adapter to convert the types of arguments.
 * Three such C++ classes made available by {@link Generator} are {@code StringAdapter},
 * {@code VectorAdapter}, and {@code SharedPtrAdapter} to bridge a few differences between
 * {@code std::string} and {@link String}; between {@code std::vector}, Java arrays of
 * primitive types, {@link Buffer}, and {@link Pointer}; and between {@code xyz::shared_ptr}
 * and {@link Pointer}. Adapter classes must define the following public members:
 * <ul>
 * <li> A constructor accepting 3 arguments (or more if {@link #argc()} > 1): a pointer, a size, and the owner pointer
 * <li> Another constructor that accepts a reference to the object of the other class
 * <li> A {@code static void deallocate(owner)} function
 * <li> Overloaded cast operators to both types, for references and pointers
 * <li> A {@code void assign(pointer, size, owner)} function
 * <li> A {@code size} member variable for arrays accessed via pointer
 * </ul>
 * To reduce further the amount of coding, this annotation can also be used on
 * other annotations, such as with {@link StdString}, {@link StdVector}, and {@link SharedPtr}.
 *
 * @see Generator
 *
 * @author Samuel Audet
 */
@Documented @Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.PARAMETER, ElementType.ANNOTATION_TYPE})
public @interface Adapter {
    /** The name of the C++ adapter class. */
    String value();
    /** The number of arguments that {@link Generator} takes from the method as
     *  arguments to the adapter constructor. */
    int argc() default 1;
}
