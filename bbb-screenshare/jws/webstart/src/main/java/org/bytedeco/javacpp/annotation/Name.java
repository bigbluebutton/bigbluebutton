package org.bytedeco.javacpp.annotation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.bytedeco.javacpp.tools.Generator;

/**
 * Names the identifier of a native C++ struct, class, union, function, variable,
 * operator, macro, etc. Without this annotation, {@link Generator} guesses the
 * native name based on the name of the Java peer. However, it may sometimes be
 * impossible to use the same name in Java, for example, in the case of overloaded
 * operators or to specify template arguments, while other times we may need to
 * access by name, for example, a callback pointer or function object, from C++.
 * For all those cases, we require this annotation.
 *
 * @see Generator
 *
 * @author Samuel Audet
 */
@Documented @Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.METHOD})
public @interface Name {
    /** The second element gets used as a suffix to work around arrays of anonymous struct or union. */
    String[] value();
}
