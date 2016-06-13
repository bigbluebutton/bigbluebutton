package org.bytedeco.javacpp.annotation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.bytedeco.javacpp.tools.Generator;

/**
 * By default, all allocators attach a deallocator to the peer object on creation.
 * This way, the deallocator automatically gets called during garbage collection.
 * Since an allocator uses the {@code new} (or for arrays the {@code new[]})
 * operator, the deallocator produced uses the {@code delete} (or {@code delete[]})
 * operator. However, if that operator is not accessible, or the native library
 * does not use that operator for object deallocation, we may apply this annotation
 * to an allocator method to prevent it from using these operators.
 *
 * @see Allocator
 * @see ArrayAllocator
 * @see Generator
 *
 * @author Samuel Audet
 */
@Documented @Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.METHOD})
public @interface NoDeallocator { }