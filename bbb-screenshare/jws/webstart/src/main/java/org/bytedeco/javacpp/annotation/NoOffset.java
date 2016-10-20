package org.bytedeco.javacpp.annotation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.bytedeco.javacpp.Loader;
import org.bytedeco.javacpp.tools.Generator;

/**
 * By default, {@link Generator} applies {@code offsetof()} to all member variables.
 * For each value returned {@link Loader#putMemberOffset(String, String, int)}
 * gets called, allowing to query efficiently those values from Java at a later
 * point by calling {@link Loader#offsetof(Class, String)}. However, this is
 * only guaranteed to work on plain old data (POD) {@code struct}. To prevent
 * the C++ compiler from complaining in other cases, we can add this annotation
 * to the peer class declaration.
 *
 * @see Generator
 *
 * @author Samuel Audet
 */
@Documented @Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.METHOD})
public @interface NoOffset { }
