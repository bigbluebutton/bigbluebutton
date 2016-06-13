package org.bytedeco.javacpp.annotation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.bytedeco.javacpp.Loader;
import org.bytedeco.javacpp.tools.Builder;
import org.bytedeco.javacpp.tools.Generator;

/**
 * Defines native properties for a top-level enclosing class as well as indicates
 * classes and methods that should be generated or not, for specified platforms.
 * <p>
 * A class or method annotated with only {@link #value()} or {@link #not()}
 * lets {@link Generator} know for which platforms it should generate code
 * (or not). The strings are matched with {@link String#startsWith(String)}.
 * In particular, {@code @Platform(value="")} matches all platforms, while
 * {@code @Platform(not="")} matches no platforms, providing a way to specify
 * methods to skip or classes to ignore, as if they did not exist.
 * <p>
 * Classes annotated with at least one of the other values define a top-enclosing
 * class as returned by {@link Loader#getEnclosingClass(Class)}. By default, one
 * native library gets created for each such class, but {@link Builder} recognizes
 * more than one class with the same {@link #library()} name and produces only one
 * library in that case.
 * <p>
 * Further, with the {@link Properties} annotation, properties can be inherited
 * from other classes, and different properties can be defined for each platform.
 *
 * @see Builder
 * @see Generator
 * @see Loader
 *
 * @author Samuel Audet
 */
@Documented @Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.METHOD})
public @interface Platform {
    /** The properties, class, or method apply only to the named platforms.
     *  The strings are matched with {@link String#startsWith(String)}  */
    String[] value()       default {};
    /** The properties, class, or method do NOT apply to the named platforms.
     *  The strings are matched with {@link String#startsWith(String)} */
    String[] not()         default {};
    /** A list of {@code pragma} directives to list at the top of the generated
     *  code, before {@link #define()} macros and any included header files. */
    String[] pragma()      default {};
    /** A list of macros to {@code #define} at the top of the generated code,
     *  before {@link #include()} and {@link #cinclude()} header files. */
    String[] define()      default {};
    /** A list of C++ header files to include at the top of the generated code. */
    String[] include()     default {};
    /** A list of C header files to include at the top of the generated code. The
     *  {@code #include} directives will be generated in a {@code extern "C" { } } block.*/
    String[] cinclude()    default {};
    /** A list of include paths passed to the native compiler. */
    String[] includepath() default {};
    /** A list of options applied for the native compiler. The options here refer to
     *  property names. The actual command line options of the native compiler are the
     *  values of these properties, which need to be defined elsewhere. On an empty
     *  array, the {@link Builder} uses the "platform.compiler.default" property. */
    String[] compiler()    default {};
    /** A list of library paths passed to the native compiler for use at link time. */
    String[] linkpath()    default {};
    /** A list of libraries the native compiler should link with. */
    String[] link()        default {};
    /** A list of framework paths passed to the native compiler for use at link time. */
    String[] frameworkpath() default {};
    /** A list of frameworks the native compiler should build against. */
    String[] framework()   default {};
    /** A list of paths from which to attempt preloading libraries from the
     *  {@link #link()} and {@link #preload()} lists. */
    String[] preloadpath() default {};
    /** A list of libraries, in addition to {@link #link()}, that should be
     *  extracted and preloaded, if possible. */
    String[] preload()     default {};
    /** The native JNI library associated with this class that {@link Builder} should
     *  try to build and {@link Loader} should try to load. If left empty, this value
     *  defaults to "jni" + the name that {@link Class#getSimpleName()} returns. */
    String   library()     default "";
}
