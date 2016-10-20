/*
 * Copyright (C) 2011-2016 Samuel Audet
 *
 * Licensed either under the Apache License, Version 2.0, or (at your option)
 * under the terms of the GNU General Public License as published by
 * the Free Software Foundation (subject to the "Classpath" exception),
 * either version 2, or any later version (collectively, the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *     http://www.gnu.org/licenses/
 *     http://www.gnu.org/software/classpath/license.html
 *
 * or as provided in the LICENSE.txt file that accompanied this code.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.bytedeco.javacpp.tools;

import java.io.Closeable;
import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.io.Writer;
import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.nio.Buffer;
import java.nio.ByteBuffer;
import java.nio.CharBuffer;
import java.nio.DoubleBuffer;
import java.nio.FloatBuffer;
import java.nio.IntBuffer;
import java.nio.LongBuffer;
import java.nio.ShortBuffer;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Deque;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.bytedeco.javacpp.BoolPointer;
import org.bytedeco.javacpp.BytePointer;
import org.bytedeco.javacpp.CLongPointer;
import org.bytedeco.javacpp.CharPointer;
import org.bytedeco.javacpp.ClassProperties;
import org.bytedeco.javacpp.DoublePointer;
import org.bytedeco.javacpp.FloatPointer;
import org.bytedeco.javacpp.FunctionPointer;
import org.bytedeco.javacpp.IntPointer;
import org.bytedeco.javacpp.Loader;
import org.bytedeco.javacpp.LongPointer;
import org.bytedeco.javacpp.Pointer;
import org.bytedeco.javacpp.PointerPointer;
import org.bytedeco.javacpp.ShortPointer;
import org.bytedeco.javacpp.SizeTPointer;
import org.bytedeco.javacpp.annotation.Adapter;
import org.bytedeco.javacpp.annotation.Allocator;
import org.bytedeco.javacpp.annotation.ArrayAllocator;
import org.bytedeco.javacpp.annotation.ByPtr;
import org.bytedeco.javacpp.annotation.ByPtrPtr;
import org.bytedeco.javacpp.annotation.ByPtrRef;
import org.bytedeco.javacpp.annotation.ByRef;
import org.bytedeco.javacpp.annotation.ByVal;
import org.bytedeco.javacpp.annotation.Cast;
import org.bytedeco.javacpp.annotation.Const;
import org.bytedeco.javacpp.annotation.Convention;
import org.bytedeco.javacpp.annotation.Function;
import org.bytedeco.javacpp.annotation.Index;
import org.bytedeco.javacpp.annotation.MemberGetter;
import org.bytedeco.javacpp.annotation.MemberSetter;
import org.bytedeco.javacpp.annotation.Name;
import org.bytedeco.javacpp.annotation.Namespace;
import org.bytedeco.javacpp.annotation.NoDeallocator;
import org.bytedeco.javacpp.annotation.NoException;
import org.bytedeco.javacpp.annotation.NoOffset;
import org.bytedeco.javacpp.annotation.Opaque;
import org.bytedeco.javacpp.annotation.Platform;
import org.bytedeco.javacpp.annotation.Raw;
import org.bytedeco.javacpp.annotation.ValueGetter;
import org.bytedeco.javacpp.annotation.ValueSetter;
import org.bytedeco.javacpp.annotation.Virtual;

/**
 * The Generator is where all the C++ source code that we need gets generated.
 * It has not been designed in any meaningful way since the requirements were
 * not well understood. It is basically a prototype and is really quite a mess.
 * Now that we understand better what we need, it could use some refactoring.
 * <p>
 * When attempting to understand what the Generator does, try to run experiments
 * and inspect the generated code: It is quite readable.
 * <p>
 * Moreover, although Generator is the one ultimately doing something with the
 * various annotations it relies on, it was easier to describe the behavior its
 * meant to have with them as part of the documentation of the annotations, so
 * we can refer to them to understand more about how Generator should work:
 *
 * @see Adapter
 * @see Allocator
 * @see ArrayAllocator
 * @see ByPtr
 * @see ByPtrPtr
 * @see ByPtrRef
 * @see ByRef
 * @see ByVal
 * @see Cast
 * @see Const
 * @see Convention
 * @see Function
 * @see Index
 * @see MemberGetter
 * @see MemberSetter
 * @see Name
 * @see Namespace
 * @see NoDeallocator
 * @see NoException
 * @see NoOffset
 * @see Opaque
 * @see Platform
 * @see Raw
 * @see ValueGetter
 * @see ValueSetter
 *
 * @author Samuel Audet
 */
public class Generator implements Closeable {

    public Generator(Logger logger, ClassProperties properties) {
        this.logger = logger;
        this.properties = properties;
    }

    static final String JNI_VERSION = "JNI_VERSION_1_4";
    static final List<Class> baseClasses = Arrays.asList(new Class[] {
            Pointer.class,
            //FunctionPointer.class,
            BytePointer.class,
            ShortPointer.class,
            IntPointer.class,
            LongPointer.class,
            FloatPointer.class,
            DoublePointer.class,
            CharPointer.class,
            PointerPointer.class,
            BoolPointer.class,
            CLongPointer.class,
            SizeTPointer.class });

    final Logger logger;
    final ClassProperties properties;
    PrintWriter out, out2;
    IndexedSet<String> callbacks;
    IndexedSet<Class> functions, deallocators, arrayDeallocators, jclasses;
    Map<Class,Set<String>> members, virtualFunctions, virtualMembers;
    Map<Method,MethodInformation> annotationCache;
    boolean mayThrowExceptions, usesAdapters, passesStrings;

    public boolean generate(String sourceFilename, String headerFilename,
            String classPath, Class<?> ... classes) throws FileNotFoundException {
        // first pass using a null writer to fill up the IndexedSet objects
        out = new PrintWriter(new Writer() {
            @Override public void write(char[] cbuf, int off, int len) { }
            @Override public void flush() { }
            @Override public void close() { }
        });
        out2 = null;
        callbacks           = new IndexedSet<String>();
        functions           = new IndexedSet<Class>();
        deallocators        = new IndexedSet<Class>();
        arrayDeallocators   = new IndexedSet<Class>();
        jclasses            = new IndexedSet<Class>();
        members             = new HashMap<Class,Set<String>>();
        virtualFunctions    = new HashMap<Class,Set<String>>();
        virtualMembers      = new HashMap<Class,Set<String>>();
        annotationCache     = new HashMap<Method,MethodInformation>();
        mayThrowExceptions  = false;
        usesAdapters        = false;
        passesStrings       = false;
        for (Class<?> cls : baseClasses) {
            jclasses.index(cls);
        }
        if (classes(true, true, true, classPath, classes)) {
            // second pass with a real writer
            out = new PrintWriter(sourceFilename);
            if (headerFilename != null) {
                out2 = new PrintWriter(headerFilename);
            }
            return classes(mayThrowExceptions, usesAdapters, passesStrings, classPath, classes);
        } else {
            return false;
        }
    }

    public void close() {
        if (out != null) {
            out.close();
        }
        if (out2 != null) {
            out2.close();
        }
    }

    boolean classes(boolean handleExceptions, boolean defineAdapters, boolean convertStrings, String classPath, Class<?> ... classes) {
        String version = Generator.class.getPackage().getImplementationVersion();
        if (version == null) {
            version = "unknown";
        }
        String warning = "// Generated by JavaCPP version " + version + ": DO NOT EDIT THIS FILE";
        out.println(warning);
        out.println();
        if (out2 != null) {
            out2.println(warning);
            out2.println();
        }
        for (String s : properties.get("platform.pragma")) {
            out.println("#pragma " + s);
        }
        for (String s : properties.get("platform.define")) {
            out.println("#define " + s);
        }
        out.println();
        out.println("#ifdef _WIN32");
        out.println("    #define _JAVASOFT_JNI_MD_H_");
        out.println();
        out.println("    #define JNIEXPORT __declspec(dllexport)");
        out.println("    #define JNIIMPORT __declspec(dllimport)");
        out.println("    #define JNICALL __stdcall");
        out.println();
        out.println("    typedef int jint;");
        out.println("    typedef long long jlong;");
        out.println("    typedef signed char jbyte;");
        out.println("#elif defined(__GNUC__)");
        out.println("    #define _JAVASOFT_JNI_MD_H_");
        out.println();
        out.println("    #define JNIEXPORT __attribute__((visibility(\"default\")))");
        out.println("    #define JNIIMPORT");
        out.println("    #define JNICALL");
        out.println();
        out.println("    typedef int jint;");
        out.println("    typedef long long jlong;");
        out.println("    typedef signed char jbyte;");
        out.println("#endif");
        out.println();
        out.println("#include <jni.h>");
        if (out2 != null) {
            out2.println("#include <jni.h>");
        }
        out.println();
        out.println("#ifdef ANDROID");
        out.println("    #include <android/log.h>");
        out.println("#elif defined(__APPLE__) && defined(__OBJC__)");
        out.println("    #include <TargetConditionals.h>");
        out.println("    #include <Foundation/Foundation.h>");
        out.println("#endif");
        out.println("#if defined(ANDROID) || TARGET_OS_IPHONE");
        out.println("    #define NewWeakGlobalRef(obj) NewGlobalRef(obj)");
        out.println("    #define DeleteWeakGlobalRef(obj) DeleteGlobalRef(obj)");
        out.println("#endif");
        out.println();
        out.println("#include <limits.h>");
        out.println("#include <stddef.h>");
        out.println("#ifndef _WIN32");
        out.println("    #include <stdint.h>");
        out.println("#endif");
        out.println("#include <stdio.h>");
        out.println("#include <stdlib.h>");
        out.println("#include <string.h>");
        out.println("#include <exception>");
        out.println("#include <memory>");
        out.println("#include <new>");
        out.println();
        out.println("#if defined(NATIVE_ALLOCATOR) && defined(NATIVE_DEALLOCATOR)");
        out.println("    void* operator new(std::size_t size, const std::nothrow_t&) throw() {");
        out.println("        return NATIVE_ALLOCATOR(size);");
        out.println("    }");
        out.println("    void* operator new[](std::size_t size, const std::nothrow_t&) throw() {");
        out.println("        return NATIVE_ALLOCATOR(size);");
        out.println("    }");
        out.println("    void* operator new(std::size_t size) throw(std::bad_alloc) {");
        out.println("        return NATIVE_ALLOCATOR(size);");
        out.println("    }");
        out.println("    void* operator new[](std::size_t size) throw(std::bad_alloc) {");
        out.println("        return NATIVE_ALLOCATOR(size);");
        out.println("    }");
        out.println("    void operator delete(void* ptr) throw() {");
        out.println("        NATIVE_DEALLOCATOR(ptr);");
        out.println("    }");
        out.println("    void operator delete[](void* ptr) throw() {");
        out.println("        NATIVE_DEALLOCATOR(ptr);");
        out.println("    }");
        out.println("#endif");
        out.println();
        out.println("#define jlong_to_ptr(a) ((void*)(uintptr_t)(a))");
        out.println("#define ptr_to_jlong(a) ((jlong)(uintptr_t)(a))");
        out.println();
        out.println("#if defined(_MSC_VER)");
        out.println("    #define JavaCPP_noinline __declspec(noinline)");
        out.println("    #define JavaCPP_hidden /* hidden by default */");
        out.println("#elif defined(__GNUC__)");
        out.println("    #define JavaCPP_noinline __attribute__((noinline))");
        out.println("    #define JavaCPP_hidden   __attribute__((visibility(\"hidden\")))");
        out.println("#else");
        out.println("    #define JavaCPP_noinline");
        out.println("    #define JavaCPP_hidden");
        out.println("#endif");
        out.println();
        List[] include = { properties.get("platform.include"),
                           properties.get("platform.cinclude") };
        for (int i = 0; i < include.length; i++) {
            if (include[i] != null && include[i].size() > 0) {
                if (i == 1) {
                    out.println("extern \"C\" {");
                    if (out2 != null) {
                        out2.println("#ifdef __cplusplus");
                        out2.println("extern \"C\" {");
                        out2.println("#endif");
                    }
                }
                for (String s : (List<String>)include[i]) {
                    String line = "#include ";
                    if (!s.startsWith("<") && !s.startsWith("\"")) {
                        line += '"';
                    }
                    line += s;
                    if (!s.endsWith(">") && !s.endsWith("\"")) {
                        line += '"';
                    }
                    out.println(line);
                    if (out2 != null) {
                        out2.println(line);
                    }
                }
                if (i == 1) {
                    out.println("}");
                    if (out2 != null) {
                        out2.println("#ifdef __cplusplus");
                        out2.println("}");
                        out2.println("#endif");
                    }
                }
                out.println();
            }
        }
        out.println("static JavaVM* JavaCPP_vm = NULL;");
        out.println("static bool JavaCPP_haveAllocObject = false;");
        out.println("static bool JavaCPP_haveNonvirtual = false;");
        out.println("static const char* JavaCPP_classNames[" + jclasses.size() + "] = {");
        Iterator<Class> classIterator = jclasses.iterator();
        int maxMemberSize = 0;
        while (classIterator.hasNext()) {
            Class c = classIterator.next();
            out.print("        \"" + c.getName().replace('.','/') + "\"");
            if (classIterator.hasNext()) {
                out.println(",");
            }
            Set<String> m = members.get(c);
            if (m != null && m.size() > maxMemberSize) {
                maxMemberSize = m.size();
            }
        }
        out.println(" };");
        out.println("static jclass JavaCPP_classes[" + jclasses.size() + "] = { NULL };");
        out.println("static jfieldID JavaCPP_addressFID = NULL;");
        out.println("static jfieldID JavaCPP_positionFID = NULL;");
        out.println("static jfieldID JavaCPP_limitFID = NULL;");
        out.println("static jfieldID JavaCPP_capacityFID = NULL;");
        out.println("static jfieldID JavaCPP_deallocatorFID = NULL;");
        out.println("static jfieldID JavaCPP_ownerAddressFID = NULL;");
        out.println("static jmethodID JavaCPP_initMID = NULL;");
        out.println("static jmethodID JavaCPP_arrayMID = NULL;");
        out.println("static jmethodID JavaCPP_stringMID = NULL;");
        out.println("static jmethodID JavaCPP_getBytesMID = NULL;");
        out.println("static jmethodID JavaCPP_toStringMID = NULL;");
        out.println();
        out.println("static inline void JavaCPP_log(const char* fmt, ...) {");
        out.println("    va_list ap;");
        out.println("    va_start(ap, fmt);");
        out.println("#ifdef ANDROID");
        out.println("    __android_log_vprint(ANDROID_LOG_ERROR, \"javacpp\", fmt, ap);");
        out.println("#elif defined(__APPLE__) && defined(__OBJC__)");
        out.println("    NSLogv([NSString stringWithUTF8String:fmt], ap);");
        out.println("#else");
        out.println("    vfprintf(stderr, fmt, ap);");
        out.println("    fprintf(stderr, \"\\n\");");
        out.println("#endif");
        out.println("    va_end(ap);");
        out.println("}");
        out.println();
        out.println("static JavaCPP_noinline jclass JavaCPP_getClass(JNIEnv* env, int i) {");
        out.println("    if (JavaCPP_classes[i] == NULL && env->PushLocalFrame(1) == 0) {");
        out.println("        jclass cls = env->FindClass(JavaCPP_classNames[i]);");
        out.println("        if (cls == NULL || env->ExceptionCheck()) {");
        out.println("            JavaCPP_log(\"Error loading class %s.\", JavaCPP_classNames[i]);");
        out.println("            return NULL;");
        out.println("        }");
        out.println("        JavaCPP_classes[i] = (jclass)env->NewWeakGlobalRef(cls);");
        out.println("        if (JavaCPP_classes[i] == NULL || env->ExceptionCheck()) {");
        out.println("            JavaCPP_log(\"Error creating global reference of class %s.\", JavaCPP_classNames[i]);");
        out.println("            return NULL;");
        out.println("        }");
        out.println("        env->PopLocalFrame(NULL);");
        out.println("    }");
        out.println("    return JavaCPP_classes[i];");
        out.println("}");
        out.println();
        out.println("static JavaCPP_noinline jfieldID JavaCPP_getFieldID(JNIEnv* env, int i, const char* name, const char* sig) {");
        out.println("    jclass cls = JavaCPP_getClass(env, i);");
        out.println("    if (cls == NULL) {");
        out.println("        return NULL;");
        out.println("    }");
        out.println("    jfieldID fid = env->GetFieldID(cls, name, sig);");
        out.println("    if (fid == NULL || env->ExceptionCheck()) {");
        out.println("        JavaCPP_log(\"Error getting field ID of %s/%s\", JavaCPP_classNames[i], name);");
        out.println("        return NULL;");
        out.println("    }");
        out.println("    return fid;");
        out.println("}");
        out.println();
        out.println("static JavaCPP_noinline jmethodID JavaCPP_getMethodID(JNIEnv* env, int i, const char* name, const char* sig) {");
        out.println("    jclass cls = JavaCPP_getClass(env, i);");
        out.println("    if (cls == NULL) {");
        out.println("        return NULL;");
        out.println("    }");
        out.println("    jmethodID mid = env->GetMethodID(cls, name, sig);");
        out.println("    if (mid == NULL || env->ExceptionCheck()) {");
        out.println("        JavaCPP_log(\"Error getting method ID of %s/%s\", JavaCPP_classNames[i], name);");
        out.println("        return NULL;");
        out.println("    }");
        out.println("    return mid;");
        out.println("}");
        out.println();
        out.println("static JavaCPP_noinline jmethodID JavaCPP_getStaticMethodID(JNIEnv* env, int i, const char* name, const char* sig) {");
        out.println("    jclass cls = JavaCPP_getClass(env, i);");
        out.println("    if (cls == NULL) {");
        out.println("        return NULL;");
        out.println("    }");
        out.println("    jmethodID mid = env->GetStaticMethodID(cls, name, sig);");
        out.println("    if (mid == NULL || env->ExceptionCheck()) {");
        out.println("        JavaCPP_log(\"Error getting static method ID of %s/%s\", JavaCPP_classNames[i], name);");
        out.println("        return NULL;");
        out.println("    }");
        out.println("    return mid;");
        out.println("}");
        out.println();
        out.println("static JavaCPP_noinline jobject JavaCPP_createPointer(JNIEnv* env, int i, jclass cls = NULL) {");
        out.println("    if (cls == NULL && (cls = JavaCPP_getClass(env, i)) == NULL) {");
        out.println("        return NULL;");
        out.println("    }");
        out.println("    if (JavaCPP_haveAllocObject) {");
        out.println("        return env->AllocObject(cls);");
        out.println("    } else {");
        out.println("        jmethodID mid = env->GetMethodID(cls, \"<init>\", \"(Lorg/bytedeco/javacpp/Pointer;)V\");");
        out.println("        if (mid == NULL || env->ExceptionCheck()) {");
        out.println("            JavaCPP_log(\"Error getting Pointer constructor of %s, while VM does not support AllocObject()\", JavaCPP_classNames[i]);");
        out.println("            return NULL;");
        out.println("        }");
        out.println("        return env->NewObject(cls, mid, NULL);");
        out.println("    }");
        out.println("}");
        out.println();
        out.println("static JavaCPP_noinline void JavaCPP_initPointer(JNIEnv* env, jobject obj, const void* ptr, long long size, void* owner, void (*deallocator)(void*)) {");
        out.println("    if (deallocator != NULL) {");
        out.println("        jvalue args[4];");
        out.println("        args[0].j = ptr_to_jlong(ptr);");
        out.println("        args[1].j = (jlong)size;");
        out.println("        args[2].j = ptr_to_jlong(owner);");
        out.println("        args[3].j = ptr_to_jlong(deallocator);");
        out.println("        if (JavaCPP_haveNonvirtual) {");
        out.println("            env->CallNonvirtualVoidMethodA(obj, JavaCPP_getClass(env, "
                                     + jclasses.index(Pointer.class) + "), JavaCPP_initMID, args);");
        out.println("        } else {");
        out.println("            env->CallVoidMethodA(obj, JavaCPP_initMID, args);");
        out.println("        }");
        out.println("    } else {");
        out.println("        env->SetLongField(obj, JavaCPP_addressFID, ptr_to_jlong(ptr));");
        out.println("        env->SetLongField(obj, JavaCPP_limitFID, (jlong)size);");
        out.println("        env->SetLongField(obj, JavaCPP_capacityFID, (jlong)size);");
        out.println("    }");
        out.println("}");
        out.println();
        if (handleExceptions || convertStrings) {
            out.println("static JavaCPP_noinline jstring JavaCPP_createString(JNIEnv* env, const char* ptr) {");
            out.println("    if (ptr == NULL) {");
            out.println("        return NULL;");
            out.println("    }");
            out.println("#ifdef MODIFIED_UTF8_STRING");
            out.println("    return env->NewStringUTF(ptr);");
            out.println("#else");
            out.println("    size_t length = strlen(ptr);");
            out.println("    jbyteArray bytes = env->NewByteArray(length < INT_MAX ? length : INT_MAX);");
            out.println("    env->SetByteArrayRegion(bytes, 0, length < INT_MAX ? length : INT_MAX, (signed char*)ptr);");
            out.println("    return (jstring)env->NewObject(JavaCPP_getClass(env, " + jclasses.index(String.class) + "), JavaCPP_stringMID, bytes);");
            out.println("#endif");
            out.println("}");
            out.println();
        }
        if (convertStrings) {
            out.println("static JavaCPP_noinline const char* JavaCPP_getStringBytes(JNIEnv* env, jstring str) {");
            out.println("    if (str == NULL) {");
            out.println("        return NULL;");
            out.println("    }");
            out.println("#ifdef MODIFIED_UTF8_STRING");
            out.println("    return env->GetStringUTFChars(str, NULL);");
            out.println("#else");
            out.println("    jbyteArray bytes = (jbyteArray)env->CallObjectMethod(str, JavaCPP_getBytesMID);");
            out.println("    if (bytes == NULL || env->ExceptionCheck()) {");
            out.println("        JavaCPP_log(\"Error getting bytes from string.\");");
            out.println("        return NULL;");
            out.println("    }");
            out.println("    jsize length = env->GetArrayLength(bytes);");
            out.println("    signed char* ptr = new (std::nothrow) signed char[length + 1];");
            out.println("    if (ptr != NULL) {");
            out.println("        env->GetByteArrayRegion(bytes, 0, length, ptr);");
            out.println("        ptr[length] = 0;");
            out.println("    }");
            out.println("    return (const char*)ptr;");
            out.println("#endif");
            out.println("}");
            out.println();
            out.println("static JavaCPP_noinline void JavaCPP_releaseStringBytes(JNIEnv* env, jstring str, const char* ptr) {");
            out.println("#ifdef MODIFIED_UTF8_STRING");
            out.println("    if (str != NULL) {");
            out.println("        env->ReleaseStringUTFChars(str, ptr);");
            out.println("    }");
            out.println("#else");
            out.println("    delete[] ptr;");
            out.println("#endif");
            out.println("}");
            out.println();
        }
        out.println("class JavaCPP_hidden JavaCPP_exception : public std::exception {");
        out.println("public:");
        out.println("    JavaCPP_exception(const char* str) throw() {");
        out.println("        if (str == NULL) {");
        out.println("            strcpy(msg, \"Unknown exception.\");");
        out.println("        } else {");
        out.println("            strncpy(msg, str, sizeof(msg));");
        out.println("            msg[sizeof(msg) - 1] = 0;");
        out.println("        }");
        out.println("    }");
        out.println("    virtual const char* what() const throw() { return msg; }");
        out.println("    char msg[1024];");
        out.println("};");
        out.println();
        if (handleExceptions) {
            out.println("#ifndef GENERIC_EXCEPTION_CLASS");
            out.println("#define GENERIC_EXCEPTION_CLASS std::exception");
            out.println("#endif");
            out.println("static JavaCPP_noinline jthrowable JavaCPP_handleException(JNIEnv* env, int i) {");
            out.println("    jstring str = NULL;");
            out.println("    try {");
            out.println("        throw;");
            out.println("    } catch (GENERIC_EXCEPTION_CLASS& e) {");
            out.println("        str = JavaCPP_createString(env, e.what());");
            out.println("    } catch (...) {");
            out.println("        str = JavaCPP_createString(env, \"Unknown exception.\");");
            out.println("    }");
            out.println("    jmethodID mid = JavaCPP_getMethodID(env, i, \"<init>\", \"(Ljava/lang/String;)V\");");
            out.println("    if (mid == NULL) {");
            out.println("        return NULL;");
            out.println("    }");
            out.println("    return (jthrowable)env->NewObject(JavaCPP_getClass(env, i), mid, str);");
            out.println("}");
            out.println();
        }
        Class deallocator, nativeDeallocator;
        try {
            deallocator = Class.forName(Pointer.class.getName() + "$Deallocator", false, Pointer.class.getClassLoader());
            nativeDeallocator = Class.forName(Pointer.class.getName() + "$NativeDeallocator", false, Pointer.class.getClassLoader());
        } catch (ClassNotFoundException ex) {
            throw new RuntimeException(ex);
        }
        if (defineAdapters) {
            out.println("static JavaCPP_noinline void* JavaCPP_getPointerOwner(JNIEnv* env, jobject obj) {");
            out.println("    if (obj != NULL) {");
            out.println("        jobject deallocator = env->GetObjectField(obj, JavaCPP_deallocatorFID);");
            out.println("        if (deallocator != NULL && env->IsInstanceOf(deallocator, JavaCPP_getClass(env, "
                                                                + jclasses.index(nativeDeallocator) + "))) {");
            out.println("            return jlong_to_ptr(env->GetLongField(deallocator, JavaCPP_ownerAddressFID));");
            out.println("        }");
            out.println("    }");
            out.println("    return NULL;");
            out.println("}");
            out.println();
            out.println("#include <vector>");
            out.println("template<typename P, typename T = P> class JavaCPP_hidden VectorAdapter {");
            out.println("public:");
            out.println("    VectorAdapter(const P* ptr, typename std::vector<T>::size_type size, void* owner) : ptr((P*)ptr), size(size), owner(owner),");
            out.println("        vec2(ptr ? std::vector<T>((P*)ptr, (P*)ptr + size) : std::vector<T>()), vec(vec2) { }");
            out.println("    VectorAdapter(const std::vector<T>& vec) : ptr(0), size(0), owner(0), vec2(vec), vec(vec2) { }");
            out.println("    VectorAdapter(      std::vector<T>& vec) : ptr(0), size(0), owner(0), vec(vec) { }");
            out.println("    VectorAdapter(const std::vector<T>* vec) : ptr(0), size(0), owner(0), vec(*(std::vector<T>*)vec) { }");
            out.println("    void assign(P* ptr, typename std::vector<T>::size_type size, void* owner) {");
            out.println("        this->ptr = ptr;");
            out.println("        this->size = size;");
            out.println("        this->owner = owner;");
            out.println("        vec.assign(ptr, ptr + size);");
            out.println("    }");
            out.println("    static void deallocate(void* owner) { operator delete(owner); }");
            out.println("    operator P*() {");
            out.println("        if (vec.size() > size) {");
            out.println("            ptr = (P*)(operator new(sizeof(P) * vec.size(), std::nothrow_t()));");
            out.println("        }");
            out.println("        if (ptr) {");
            out.println("            std::copy(vec.begin(), vec.end(), ptr);");
            out.println("        }");
            out.println("        size = vec.size();");
            out.println("        owner = ptr;");
            out.println("        return ptr;");
            out.println("    }");
            out.println("    operator const P*()        { return &vec[0]; }");
            out.println("    operator std::vector<T>&() { return vec; }");
            out.println("    operator std::vector<T>*() { return ptr ? &vec : 0; }");
            out.println("    P* ptr;");
            out.println("    typename std::vector<T>::size_type size;");
            out.println("    void* owner;");
            out.println("    std::vector<T> vec2;");
            out.println("    std::vector<T>& vec;");
            out.println("};");
            out.println();
            out.println("#include <string>");
            out.println("class JavaCPP_hidden StringAdapter {");
            out.println("public:");
            out.println("    StringAdapter(const          char* ptr, size_t size, void* owner) : ptr((char*)ptr), size(size), owner(owner),");
            out.println("        str2(ptr ? (char*)ptr : \"\", ptr ? (size > 0 ? size : strlen((char*)ptr)) : 0), str(str2) { }");
            out.println("    StringAdapter(const signed   char* ptr, size_t size, void* owner) : ptr((char*)ptr), size(size), owner(owner),");
            out.println("        str2(ptr ? (char*)ptr : \"\", ptr ? (size > 0 ? size : strlen((char*)ptr)) : 0), str(str2) { }");
            out.println("    StringAdapter(const unsigned char* ptr, size_t size, void* owner) : ptr((char*)ptr), size(size), owner(owner),");
            out.println("        str2(ptr ? (char*)ptr : \"\", ptr ? (size > 0 ? size : strlen((char*)ptr)) : 0), str(str2) { }");
            out.println("    StringAdapter(const std::string& str) : ptr(0), size(0), owner(0), str2(str), str(str2) { }");
            out.println("    StringAdapter(      std::string& str) : ptr(0), size(0), owner(0), str(str) { }");
            out.println("    StringAdapter(const std::string* str) : ptr(0), size(0), owner(0), str(*(std::string*)str) { }");
            out.println("    void assign(char* ptr, size_t size, void* owner) {");
            out.println("        this->ptr = ptr;");
            out.println("        this->size = size;");
            out.println("        this->owner = owner;");
            out.println("        str.assign(ptr ? ptr : \"\", ptr ? (size > 0 ? size : strlen((char*)ptr)) : 0);");
            out.println("    }");
            out.println("    void assign(const          char* ptr, size_t size, void* owner) { assign((char*)ptr, size, owner); }");
            out.println("    void assign(const signed   char* ptr, size_t size, void* owner) { assign((char*)ptr, size, owner); }");
            out.println("    void assign(const unsigned char* ptr, size_t size, void* owner) { assign((char*)ptr, size, owner); }");
            out.println("    static void deallocate(void* owner) { delete[] (char*)owner; }");
            out.println("    operator char*() {");
            out.println("        const char* data = str.data();");
            out.println("        if (str.size() > size) {");
            out.println("            ptr = new (std::nothrow) char[str.size()+1];");
            out.println("            if (ptr) memset(ptr, 0, str.size()+1);");
            out.println("        }");
            out.println("        if (ptr && memcmp(ptr, data, str.size()) != 0) {");
            out.println("            memcpy(ptr, data, str.size());");
            out.println("            if (size > str.size()) ptr[str.size()] = 0;");
            out.println("        }");
            out.println("        size = str.size();");
            out.println("        owner = ptr;");
            out.println("        return ptr;");
            out.println("    }");
            out.println("    operator       signed   char*() { return (signed   char*)(operator char*)(); }");
            out.println("    operator       unsigned char*() { return (unsigned char*)(operator char*)(); }");
            out.println("    operator const          char*() { return                 str.c_str(); }");
            out.println("    operator const signed   char*() { return (signed   char*)str.c_str(); }");
            out.println("    operator const unsigned char*() { return (unsigned char*)str.c_str(); }");
            out.println("    operator         std::string&() { return str; }");
            out.println("    operator         std::string*() { return ptr ? &str : 0; }");
            out.println("    char* ptr;");
            out.println("    size_t size;");
            out.println("    void* owner;");
            out.println("    std::string str2;");
            out.println("    std::string& str;");
            out.println("};");
            out.println();
            out.println("#ifdef SHARED_PTR_NAMESPACE");
            out.println("template<class T> class SharedPtrAdapter {");
            out.println("public:");
            out.println("    typedef SHARED_PTR_NAMESPACE::shared_ptr<T> S;");
            out.println("    SharedPtrAdapter(const T* ptr, size_t size, void* owner) : ptr((T*)ptr), size(size), owner(owner),");
            out.println("            sharedPtr2(owner != NULL && owner != ptr ? *(S*)owner : S((T*)ptr)), sharedPtr(sharedPtr2) { }");
            out.println("    SharedPtrAdapter(const S& sharedPtr) : ptr(0), size(0), owner(0), sharedPtr2(sharedPtr), sharedPtr(sharedPtr2) { }");
            out.println("    SharedPtrAdapter(      S& sharedPtr) : ptr(0), size(0), owner(0), sharedPtr(sharedPtr) { }");
            out.println("    void assign(T* ptr, size_t size, S* owner) {");
            out.println("        this->ptr = ptr;");
            out.println("        this->size = size;");
            out.println("        this->owner = owner;");
            out.println("        this->sharedPtr = owner != NULL && owner != ptr ? *(S*)owner : S((T*)ptr);");
            out.println("    }");
            out.println("    static void deallocate(void* owner) { delete (S*)owner; }");
            out.println("    operator T*() {");
            out.println("        ptr = sharedPtr.get();");
            out.println("        if (owner == NULL || owner == ptr) {");
            out.println("            owner = new S(sharedPtr);");
            out.println("        }");
            out.println("        return ptr;");
            out.println("    }");
            out.println("    operator const T*() { return sharedPtr.get(); }");
            out.println("    operator       S&() { return sharedPtr; }");
            out.println("    operator       S*() { return ptr ? &sharedPtr : 0; }");
            out.println("    T* ptr;");
            out.println("    size_t size;");
            out.println("    void* owner;");
            out.println("    S sharedPtr2;");
            out.println("    S& sharedPtr;");
            out.println("};");
            out.println("#endif");
            out.println();
        }
        if (!functions.isEmpty() || !virtualFunctions.isEmpty()) {
            out.println("static JavaCPP_noinline void JavaCPP_detach(bool detach) {");
            out.println("    if (detach && JavaCPP_vm->DetachCurrentThread() != JNI_OK) {");
            out.println("        JavaCPP_log(\"Could not detach the JavaVM from the current thread.\");");
            out.println("    }");
            out.println("}");
            out.println();
            out.println("static JavaCPP_noinline bool JavaCPP_getEnv(JNIEnv** env) {");
            out.println("    bool attached = false;");
            out.println("    JavaVM *vm = JavaCPP_vm;");
            out.println("    if (vm == NULL) {");
            if (out2 != null) {
                out.println("#if !defined(ANDROID) && !TARGET_OS_IPHONE");
                out.println("        int size = 1;");
                out.println("        if (JNI_GetCreatedJavaVMs(&vm, 1, &size) != JNI_OK || size == 0) {");
                out.println("#endif");
            }
            out.println("            JavaCPP_log(\"Could not get any created JavaVM.\");");
            out.println("            *env = NULL;");
            out.println("            return false;");
            if (out2 != null) {
                out.println("#if !defined(ANDROID) && !TARGET_OS_IPHONE");
                out.println("        }");
                out.println("#endif");
            }
            out.println("    }");
            out.println("    if (vm->GetEnv((void**)env, " + JNI_VERSION + ") != JNI_OK) {");
            out.println("        struct {");
            out.println("            JNIEnv **env;");
            out.println("            operator JNIEnv**() { return env; } // Android JNI");
            out.println("            operator void**() { return (void**)env; } // standard JNI");
            out.println("        } env2 = { env };");
            out.println("        if (vm->AttachCurrentThread(env2, NULL) != JNI_OK) {");
            out.println("            JavaCPP_log(\"Could not attach the JavaVM to the current thread.\");");
            out.println("            *env = NULL;");
            out.println("            return false;");
            out.println("        }");
            out.println("        attached = true;");
            out.println("    }");
            out.println("    if (JavaCPP_vm == NULL) {");
            out.println("        if (JNI_OnLoad(vm, NULL) < 0) {");
            out.println("            JavaCPP_detach(attached);");
            out.println("            *env = NULL;");
            out.println("            return false;");
            out.println("        }");
            out.println("    }");
            out.println("    return attached;");
            out.println("}");
            out.println();
        }
        for (Class c : functions) {
            String[] typeName = cppTypeName(c);
            String[] returnConvention = typeName[0].split("\\(");
            returnConvention[1] = constValueTypeName(returnConvention[1]);
            String parameterDeclaration = typeName[1].substring(1);
            String instanceTypeName = functionClassName(c);
            out.println("struct JavaCPP_hidden " + instanceTypeName + " {");
            out.println("    " + instanceTypeName + "() : ptr(NULL), obj(NULL) { }");
            out.println("    " + returnConvention[0] + "operator()" + parameterDeclaration + ";");
            out.println("    " + typeName[0] + "ptr" + typeName[1] + ";");
            out.println("    jobject obj; static jmethodID mid;");
            out.println("};");
            out.println("jmethodID " + instanceTypeName + "::mid = NULL;");
        }
        out.println();
        for (Class c : jclasses) {
            Set<String> functionList = virtualFunctions.get(c);
            if (functionList == null) {
                continue;
            }
            Set<String> memberList = virtualMembers.get(c);
            String[] typeName = cppTypeName(c);
            String valueTypeName = valueTypeName(typeName);
            String subType = "JavaCPP_" + mangle(valueTypeName);
            out.println("class JavaCPP_hidden " + subType + " : public " + valueTypeName + " {");
            out.println("public:");
            out.println("    jobject obj;");
            for (String s : functionList) {
                out.println("    static jmethodID " + s + ";");
            }
            out.println();
            for (String s : memberList) {
                out.println(s);
            }
            out.println("};");
            for (String s : functionList) {
                out.println("jmethodID " + subType + "::" + s + " = NULL;");
            }
        }
        out.println();
        for (String s : callbacks) {
            out.println(s);
        }
        out.println();
        for (Class c : deallocators) {
            String name = "JavaCPP_" + mangle(c.getName());
            out.print("static void " + name + "_deallocate(void *p) { ");
            if (FunctionPointer.class.isAssignableFrom(c)) {
                String typeName = functionClassName(c) + "*";
                out.println("JNIEnv *e; bool a = JavaCPP_getEnv(&e); if (e != NULL) e->DeleteWeakGlobalRef((jweak)(("
                        + typeName + ")p)->obj); delete (" + typeName + ")p; JavaCPP_detach(a); }");
            } else if (virtualFunctions.containsKey(c)) {
                String[] typeName = cppTypeName(c);
                String valueTypeName = valueTypeName(typeName);
                String subType = "JavaCPP_" + mangle(valueTypeName);
                out.println("JNIEnv *e; bool a = JavaCPP_getEnv(&e); if (e != NULL) e->DeleteWeakGlobalRef((jweak)(("
                        + subType + "*)p)->obj); delete (" + subType + "*)p; JavaCPP_detach(a); }");
            } else {
                String[] typeName = cppTypeName(c);
                out.println("delete (" + typeName[0] + typeName[1] + ")p; }");
            }
        }
        for (Class c : arrayDeallocators) {
            String name = "JavaCPP_" + mangle(c.getName());
            String[] typeName = cppTypeName(c);
            out.println("static void " + name + "_deallocateArray(void* p) { delete[] (" + typeName[0] + typeName[1] + ")p; }");
        }
        out.println();
        out.println("extern \"C\" {");
        if (out2 != null) {
            out2.println();
            out2.println("#ifdef __cplusplus");
            out2.println("extern \"C\" {");
            out2.println("#endif");
            out2.println("JNIIMPORT int JavaCPP_init(int argc, const char *argv[]);");
            out.println();
            out.println("JNIEXPORT int JavaCPP_init(int argc, const char *argv[]) {");
            out.println("#if defined(ANDROID) || TARGET_OS_IPHONE");
            out.println("    return JNI_OK;");
            out.println("#else");
            out.println("    if (JavaCPP_vm != NULL) {");
            out.println("        return JNI_OK;");
            out.println("    }");
            out.println("    int err;");
            out.println("    JavaVM *vm;");
            out.println("    JNIEnv *env;");
            out.println("    int nOptions = 1 + (argc > 255 ? 255 : argc);");
            out.println("    JavaVMOption options[256] = { { NULL } };");
            out.println("    options[0].optionString = (char*)\"-Djava.class.path=" + classPath.replace('\\', '/') + "\";");
            out.println("    for (int i = 1; i < nOptions && argv != NULL; i++) {");
            out.println("        options[i].optionString = (char*)argv[i - 1];");
            out.println("    }");
            out.println("    JavaVMInitArgs vm_args = { " + JNI_VERSION + ", nOptions, options };");
            out.println("    return (err = JNI_CreateJavaVM(&vm, (void**)&env, &vm_args)) == JNI_OK && vm != NULL && (err = JNI_OnLoad(vm, NULL)) >= 0 ? JNI_OK : err;");
            out.println("#endif");
            out.println("}");
        }
        out.println(); // XXX: JNI_OnLoad() should ideally be protected by some mutex
        out.println("JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void* reserved) {");
        out.println("    JNIEnv* env;");
        out.println("    if (vm->GetEnv((void**)&env, " + JNI_VERSION + ") != JNI_OK) {");
        out.println("        JavaCPP_log(\"Could not get JNIEnv for " + JNI_VERSION + " inside JNI_OnLoad().\");");
        out.println("        return JNI_ERR;");
        out.println("    }");
        out.println("    if (JavaCPP_vm == vm) {");
        out.println("        return env->GetVersion();");
        out.println("    }");
        out.println("    JavaCPP_vm = vm;");
        out.println("    JavaCPP_haveAllocObject = env->functions->AllocObject != NULL;");
        out.println("    JavaCPP_haveNonvirtual = env->functions->CallNonvirtualVoidMethodA != NULL;");
        out.println("    const char* members[" + jclasses.size() + "][" + maxMemberSize + "] = {");
        classIterator = jclasses.iterator();
        while (classIterator.hasNext()) {
            out.print("            { ");
            Set<String> m = members.get(classIterator.next());
            Iterator<String> memberIterator = m == null ? null : m.iterator();
            if (memberIterator == null) {
                out.print("NULL");
            } else while (memberIterator.hasNext()) {
                out.print("\"" + memberIterator.next() + "\"");
                if (memberIterator.hasNext()) {
                    out.print(", ");
                }
            }
            out.print(" }");
            if (classIterator.hasNext()) {
                out.println(",");
            }
        }
        out.println(" };");
        out.println("    int offsets[" + jclasses.size() + "][" + maxMemberSize + "] = {");
        classIterator = jclasses.iterator();
        while (classIterator.hasNext()) {
            out.print("            { ");
            Class c = classIterator.next();
            Set<String> m = members.get(c);
            Iterator<String> memberIterator = m == null ? null : m.iterator();
            if (memberIterator == null) {
                out.print("-1");
            } else while (memberIterator.hasNext()) {
                String[] typeName = cppTypeName(c);
                String valueTypeName = valueTypeName(typeName);
                String memberName = memberIterator.next();
                if ("sizeof".equals(memberName)) {
                    if ("void".equals(valueTypeName)) {
                        valueTypeName = "void*";
                    }
                    out.print("sizeof(" + valueTypeName + ")");
                } else {
                    out.print("offsetof(" + valueTypeName  + ", " + memberName + ")");
                }
                if (memberIterator.hasNext()) {
                    out.print(", ");
                }
            }
            out.print(" }");
            if (classIterator.hasNext()) {
                out.println(",");
            }
        }
        out.println(" };");
        out.print("    int memberOffsetSizes[" + jclasses.size() + "] = { ");
        classIterator = jclasses.iterator();
        while (classIterator.hasNext()) {
            Set<String> m = members.get(classIterator.next());
            out.print(m == null ? 1 : m.size());
            if (classIterator.hasNext()) {
                out.print(", ");
            }
        }
        out.println(" };");
        out.println("    jmethodID putMemberOffsetMID = JavaCPP_getStaticMethodID(env, " +
                jclasses.index(Loader.class) + ", \"putMemberOffset\", \"(Ljava/lang/String;Ljava/lang/String;I)Ljava/lang/Class;\");");
        out.println("    if (putMemberOffsetMID == NULL) {");
        out.println("        return JNI_ERR;");
        out.println("    }");
        out.println("    for (int i = 0; i < " + jclasses.size() + " && !env->ExceptionCheck(); i++) {");
        out.println("        for (int j = 0; j < memberOffsetSizes[i] && !env->ExceptionCheck(); j++) {");
        out.println("            if (env->PushLocalFrame(3) == 0) {");
        out.println("                jvalue args[3];");
        out.println("                args[0].l = env->NewStringUTF(JavaCPP_classNames[i]);");
        out.println("                args[1].l = members[i][j] == NULL ? NULL : env->NewStringUTF(members[i][j]);");
        out.println("                args[2].i = offsets[i][j];");
        out.println("                jclass cls = (jclass)env->CallStaticObjectMethodA(JavaCPP_getClass(env, " +
                jclasses.index(Loader.class) + "), putMemberOffsetMID, args);");
        out.println("                if (cls == NULL || env->ExceptionCheck()) {");
        out.println("                    JavaCPP_log(\"Error putting member offsets for class %s.\", JavaCPP_classNames[i]);");
        out.println("                    return JNI_ERR;");
        out.println("                }");
        out.println("                JavaCPP_classes[i] = (jclass)env->NewWeakGlobalRef(cls);"); // cache here for custom class loaders
        out.println("                if (JavaCPP_classes[i] == NULL || env->ExceptionCheck()) {");
        out.println("                    JavaCPP_log(\"Error creating global reference of class %s.\", JavaCPP_classNames[i]);");
        out.println("                    return JNI_ERR;");
        out.println("                }");
        out.println("                env->PopLocalFrame(NULL);");
        out.println("            }");
        out.println("        }");
        out.println("    }");
        out.println("    JavaCPP_addressFID = JavaCPP_getFieldID(env, " +
                jclasses.index(Pointer.class) + ", \"address\", \"J\");");
        out.println("    if (JavaCPP_addressFID == NULL) {");
        out.println("        return JNI_ERR;");
        out.println("    }");
        out.println("    JavaCPP_positionFID = JavaCPP_getFieldID(env, " +
                jclasses.index(Pointer.class) + ", \"position\", \"J\");");
        out.println("    if (JavaCPP_positionFID == NULL) {");
        out.println("        return JNI_ERR;");
        out.println("    }");
        out.println("    JavaCPP_limitFID = JavaCPP_getFieldID(env, " +
                jclasses.index(Pointer.class) + ", \"limit\", \"J\");");
        out.println("    if (JavaCPP_limitFID == NULL) {");
        out.println("        return JNI_ERR;");
        out.println("    }");
        out.println("    JavaCPP_capacityFID = JavaCPP_getFieldID(env, " +
                jclasses.index(Pointer.class) + ", \"capacity\", \"J\");");
        out.println("    if (JavaCPP_capacityFID == NULL) {");
        out.println("        return JNI_ERR;");
        out.println("    }");
        out.println("    JavaCPP_deallocatorFID = JavaCPP_getFieldID(env, " +
                jclasses.index(Pointer.class) + ", \"deallocator\", \"" + signature(deallocator) + "\");");
        out.println("    if (JavaCPP_deallocatorFID == NULL) {");
        out.println("        return JNI_ERR;");
        out.println("    }");
        out.println("    JavaCPP_ownerAddressFID = JavaCPP_getFieldID(env, " +
                jclasses.index(nativeDeallocator) + ", \"ownerAddress\", \"J\");");
        out.println("    if (JavaCPP_ownerAddressFID == NULL) {");
        out.println("        return JNI_ERR;");
        out.println("    }");
        out.println("    JavaCPP_initMID = JavaCPP_getMethodID(env, " +
                jclasses.index(Pointer.class) + ", \"init\", \"(JJJJ)V\");");
        out.println("    if (JavaCPP_initMID == NULL) {");
        out.println("        return JNI_ERR;");
        out.println("    }");
        out.println("    JavaCPP_arrayMID = JavaCPP_getMethodID(env, " +
                jclasses.index(Buffer.class) + ", \"array\", \"()Ljava/lang/Object;\");");
        out.println("    if (JavaCPP_arrayMID == NULL) {");
        out.println("        return JNI_ERR;");
        out.println("    }");
        out.println("    JavaCPP_stringMID = JavaCPP_getMethodID(env, " +
                jclasses.index(String.class) + ", \"<init>\", \"([B)V\");");
        out.println("    if (JavaCPP_stringMID == NULL) {");
        out.println("        return JNI_ERR;");
        out.println("    }");
        out.println("    JavaCPP_getBytesMID = JavaCPP_getMethodID(env, " +
                jclasses.index(String.class) + ", \"getBytes\", \"()[B\");");
        out.println("    if (JavaCPP_getBytesMID == NULL) {");
        out.println("        return JNI_ERR;");
        out.println("    }");
        out.println("    JavaCPP_toStringMID = JavaCPP_getMethodID(env, " +
                jclasses.index(Object.class) + ", \"toString\", \"()Ljava/lang/String;\");");
        out.println("    if (JavaCPP_toStringMID == NULL) {");
        out.println("        return JNI_ERR;");
        out.println("    }");
        out.println("    return env->GetVersion();");
        out.println("}");
        out.println();
        if (out2 != null) {
            out2.println("JNIIMPORT int JavaCPP_uninit();");
            out2.println();
            out.println("JNIEXPORT int JavaCPP_uninit() {");
            out.println("#if defined(ANDROID) || TARGET_OS_IPHONE");
            out.println("    return JNI_OK;");
            out.println("#else");
            out.println("    JavaVM *vm = JavaCPP_vm;");
            out.println("    JNI_OnUnload(JavaCPP_vm, NULL);");
            out.println("    return vm->DestroyJavaVM();");
            out.println("#endif");
            out.println("}");
        }
        out.println();
        out.println("JNIEXPORT void JNICALL JNI_OnUnload(JavaVM* vm, void* reserved) {");
        out.println("    JNIEnv* env;");
        out.println("    if (vm->GetEnv((void**)&env, " + JNI_VERSION + ") != JNI_OK) {");
        out.println("        JavaCPP_log(\"Could not get JNIEnv for " + JNI_VERSION + " inside JNI_OnUnLoad().\");");
        out.println("        return;");
        out.println("    }");
        out.println("    for (int i = 0; i < " + jclasses.size() + "; i++) {");
        out.println("        env->DeleteWeakGlobalRef((jweak)JavaCPP_classes[i]);");
        out.println("        JavaCPP_classes[i] = NULL;");
        out.println("    }");
        out.println("    JavaCPP_vm = NULL;");
        out.println("}");
        out.println();

        List<Class> allClasses = new ArrayList<Class>();
        allClasses.addAll(baseClasses);
        allClasses.addAll(Arrays.asList(classes));

        boolean supportedPlatform = false;
        for (Class<?> cls : classes) {
            supportedPlatform |= checkPlatform(cls);
        }

        boolean didSomethingUseful = false;
        for (Class<?> cls : allClasses) {
            try {
                didSomethingUseful |= methods(cls);
            } catch (NoClassDefFoundError e) {
                logger.warn("Could not generate code for class " + cls.getCanonicalName() + ": " + e);
            }
        }

        out.println("}");
        out.println();
        if (out2 != null) {
            out2.println("#ifdef __cplusplus");
            out2.println("}");
            out2.println("#endif");
        }

        return supportedPlatform && didSomethingUseful;
    }

    boolean methods(Class<?> cls) {
        if (!checkPlatform(cls)) {
            return false;
        }

        Set<String> memberList = members.get(cls);
        if (!cls.isAnnotationPresent(Opaque.class)
                && !FunctionPointer.class.isAssignableFrom(cls)
                && cls.getEnclosingClass() != Pointer.class) {
            if (memberList == null) {
                members.put(cls, memberList = new LinkedHashSet<String>());
            }
            if (!memberList.contains("sizeof")) {
                memberList.add("sizeof");
            }
        }

        boolean didSomething = false;
        for (Class<?> c : cls.getDeclaredClasses()) {
            if (Pointer.class.isAssignableFrom(c) ||
                    Pointer.class.isAssignableFrom(c.getEnclosingClass())) {
                didSomething |= methods(c);
            }
        }

        Method[] methods = cls.getDeclaredMethods();
        MethodInformation[] methodInfos = new MethodInformation[methods.length];
        for (int i = 0; i < methods.length; i++) {
            methodInfos[i] = methodInformation(methods[i]);
        }
        Class<?> c = cls.getSuperclass();
        while (c != null && c != Object.class) {
            // consider non-duplicate virtual functions from superclasses as well
            for (Method m : c.getDeclaredMethods()) {
                if (m.isAnnotationPresent(Virtual.class)) {
                    boolean found = false;
                    String name = m.getName();
                    Class<?>[] types = m.getParameterTypes();
                    for (Method m2 : methods) {
                        if (name.equals(m2.getName()) && Arrays.equals(types, m2.getParameterTypes())) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        methods = Arrays.copyOf(methods, methods.length + 1);
                        methods[methods.length - 1] = m;
                        methodInfos = Arrays.copyOf(methodInfos, methodInfos.length + 1);
                        methodInfos[methods.length - 1] = methodInformation(m);
                        methodInfos[methods.length - 1].cls = cls;
                    }
                }
            }
            c = c.getSuperclass();
        }
        boolean[] callbackAllocators = new boolean[methods.length];
        Method functionMethod = functionMethod(cls, callbackAllocators);
        boolean firstCallback = true;
        for (int i = 0; i < methods.length; i++) {
            if (!checkPlatform(methods[i].getAnnotation(Platform.class), null)) {
                continue;
            }
            MethodInformation methodInfo = methodInfos[i];
            String nativeName = mangle(cls.getName()) + "_" + mangle(methods[i].getName());
            String callbackName = callbackAllocators[i] && methodInfo.parameterTypes.length > 0
                    ? null : "JavaCPP_" + nativeName + "_callback";
            if (callbackAllocators[i] && functionMethod == null) {
                logger.warn("No callback method call() or apply() has been not declared in \"" +
                        cls.getCanonicalName() + "\". No code will be generated for callback allocator.");
                continue;
            } else if (callbackAllocators[i] || (methods[i].equals(functionMethod) && !Modifier.isNative(methods[i].getModifiers()))) {
                functions.index(cls);
                Name name = methods[i].getAnnotation(Name.class);
                if (name != null && name.value().length > 0 && name.value()[0].length() > 0) {
                    callbackName = name.value()[0];
                }
                callback(cls, functionMethod, callbackName, firstCallback, null);
                firstCallback = false;
                didSomething = true;
            }

            if ((Modifier.isNative(methods[i].getModifiers()) || Modifier.isAbstract(methods[i].getModifiers()))
                    && !methodInfo.valueGetter && !methodInfo.valueSetter && !methodInfo.memberGetter && !methodInfo.memberSetter
                    && !cls.isInterface() && (methods[i].isAnnotationPresent(Virtual.class) || methodInfo.allocator)) {
                callback(cls, methods[i], methodInfo.memberName[0], !methodInfo.allocator, methodInfo);
            }

            if (!Modifier.isNative(methods[i].getModifiers())) {
                continue;
            }

            if ((methodInfo.memberGetter || methodInfo.memberSetter) && !methodInfo.noOffset &&
                    memberList != null && !Modifier.isStatic(methodInfo.modifiers)) {
                if (!memberList.contains(methodInfo.memberName[0])) {
                    memberList.add(methodInfo.memberName[0]);
                }
            }

            didSomething = true;
            out.print("JNIEXPORT " + jniTypeName(methodInfo.returnType) + " JNICALL Java_" + nativeName);
            if (methodInfo.overloaded) {
                out.print("__" + mangle(signature(methodInfo.parameterTypes)));
            }
            if (Modifier.isStatic(methodInfo.modifiers)) {
                out.print("(JNIEnv* env, jclass cls");
            } else {
                out.print("(JNIEnv* env, jobject obj");
            }
            for (int j = 0; j < methodInfo.parameterTypes.length; j++) {
                out.print(", " + jniTypeName(methodInfo.parameterTypes[j]) + " arg" + j);
            }
            out.println(") {");

            if (callbackAllocators[i]) {
                callbackAllocator(cls, callbackName);
                continue;
            } else if (!Modifier.isStatic(methodInfo.modifiers) && !methodInfo.allocator &&
                    !methodInfo.arrayAllocator && !methodInfo.deallocator) {
                // get our "this" pointer
                String[] typeName = cppTypeName(cls);
                if ("void*".equals(typeName[0]) && !cls.isAnnotationPresent(Opaque.class)) {
                    typeName[0] = "char*";
                } else if (FunctionPointer.class.isAssignableFrom(cls)) {
                    functions.index(cls);
                    typeName[0] = functionClassName(cls) + "*";
                    typeName[1] = "";
                }
                out.println("    " + typeName[0] + " ptr" + typeName[1] + " = (" + typeName[0] +
                        typeName[1] + ")jlong_to_ptr(env->GetLongField(obj, JavaCPP_addressFID));");
                out.println("    if (ptr == NULL) {");
                out.println("        env->ThrowNew(JavaCPP_getClass(env, " +
                        jclasses.index(NullPointerException.class) + "), \"This pointer address is NULL.\");");
                out.println("        return" + (methodInfo.returnType == void.class ? ";" : " 0;"));
                out.println("    }");
                if (FunctionPointer.class.isAssignableFrom(cls)) {
                    out.println("    if (ptr->ptr == NULL) {");
                    out.println("        env->ThrowNew(JavaCPP_getClass(env, " +
                            jclasses.index(NullPointerException.class) + "), \"This function pointer address is NULL.\");");
                    out.println("        return" + (methodInfo.returnType == void.class ? ";" : " 0;"));
                    out.println("    }");
                }
                if (!cls.isAnnotationPresent(Opaque.class)) {
                    out.println("    jlong position = env->GetLongField(obj, JavaCPP_positionFID);");
                    out.println("    ptr += position;");
                    if (methodInfo.bufferGetter) {
                        out.println("    jlong size = env->GetLongField(obj, JavaCPP_limitFID);");
                        out.println("    size -= position;");
                    }
                }
            }

            parametersBefore(methodInfo);
            String returnPrefix = returnBefore(methodInfo);
            call(methodInfo, returnPrefix, false);
            returnAfter(methodInfo);
            parametersAfter(methodInfo);
            if (methodInfo.throwsException != null) {
                out.println("    if (exc != NULL) {");
                out.println("        env->Throw(exc);");
                out.println("    }");
            }
            if (methodInfo.returnType != void.class) {
                out.println("    return rarg;");
            }
            out.println("}");
        }
        out.println();
        return didSomething;
    }

    void parametersBefore(MethodInformation methodInfo) {
        String adapterLine  = "";
        AdapterInformation prevAdapterInfo = null;
        int skipParameters = methodInfo.parameterTypes.length > 0 && methodInfo.parameterTypes[0] == Class.class ? 1 : 0;
        for (int j = skipParameters; j < methodInfo.parameterTypes.length; j++) {
            if (!methodInfo.parameterTypes[j].isPrimitive()) {
                Annotation passBy = by(methodInfo, j);
                String cast = cast(methodInfo, j);
                String[] typeName = methodInfo.parameterRaw[j] ? new String[] { "" }
                        : cppTypeName(methodInfo.parameterTypes[j]);
                AdapterInformation adapterInfo = methodInfo.parameterRaw[j] ? null
                        : adapterInformation(false, methodInfo, j);

                if (FunctionPointer.class.isAssignableFrom(methodInfo.parameterTypes[j])) {
                    functions.index(methodInfo.parameterTypes[j]);
                    if (methodInfo.parameterTypes[j] == FunctionPointer.class) {
                        logger.warn("Method \"" + methodInfo.method + "\" has an abstract FunctionPointer parameter, " +
                                "but a concrete subclass is required. Compilation will most likely fail.");
                    }
                    typeName[0] = functionClassName(methodInfo.parameterTypes[j]) + "*";
                    typeName[1] = "";
                }

                if (typeName[0].length() == 0 || methodInfo.parameterRaw[j]) {
                    methodInfo.parameterRaw[j] = true;
                    typeName[0] = jniTypeName(methodInfo.parameterTypes[j]);
                    out.println("    " + typeName[0] + " ptr" + j + " = arg" + j + ";");
                    continue;
                }

                if ("void*".equals(typeName[0]) && !methodInfo.parameterTypes[j].isAnnotationPresent(Opaque.class)) {
                    typeName[0] = "char*";
                }
                out.print("    " + typeName[0] + " ptr" + j + typeName[1] + " = ");
                if (Pointer.class.isAssignableFrom(methodInfo.parameterTypes[j])) {
                    out.println("arg" + j + " == NULL ? NULL : (" + typeName[0] + typeName[1] +
                            ")jlong_to_ptr(env->GetLongField(arg" + j + ", JavaCPP_addressFID));");
                    if ((j == 0 && FunctionPointer.class.isAssignableFrom(methodInfo.cls)
                            && methodInfo.cls.isAnnotationPresent(Namespace.class))
                            || (passBy instanceof ByVal && ((ByVal)passBy).nullValue().length() == 0)
                            || (passBy instanceof ByRef && ((ByRef)passBy).nullValue().length() == 0)) {
                        // in the case of member ptr, ptr0 is our object pointer, which cannot be NULL
                        out.println("    if (ptr" + j + " == NULL) {");
                        out.println("        env->ThrowNew(JavaCPP_getClass(env, " +
                                jclasses.index(NullPointerException.class) + "), \"Pointer address of argument " + j + " is NULL.\");");
                        out.println("        return" + (methodInfo.returnType == void.class ? ";" : " 0;"));
                        out.println("    }");
                    }
                    if (adapterInfo != null || prevAdapterInfo != null) {
                        out.println("    jlong size" + j + " = arg" + j + " == NULL ? 0 : env->GetLongField(arg" + j +
                                ", JavaCPP_limitFID);");
                        out.println("    void* owner" + j + " = JavaCPP_getPointerOwner(env, arg" + j + ");");
                    }
                    if (!methodInfo.parameterTypes[j].isAnnotationPresent(Opaque.class)) {
                        out.println("    jlong position" + j + " = arg" + j + " == NULL ? 0 : env->GetLongField(arg" + j +
                                ", JavaCPP_positionFID);");
                        out.println("    ptr"  + j + " += position" + j + ";");
                        if (adapterInfo != null || prevAdapterInfo != null) {
                            out.println("    size" + j + " -= position" + j + ";");
                        }
                    }
                } else if (methodInfo.parameterTypes[j] == String.class) {
                    passesStrings = true;
                    out.println("JavaCPP_getStringBytes(env, arg" + j + ");");
                    if (adapterInfo != null || prevAdapterInfo != null) {
                        out.println("    jlong size" + j + " = 0;");
                        out.println("    void* owner" + j + " = (void*)ptr" + j + ";");
                    }
                } else if (methodInfo.parameterTypes[j].isArray() &&
                        methodInfo.parameterTypes[j].getComponentType().isPrimitive()) {
                    out.print("arg" + j + " == NULL ? NULL : ");
                    String s = methodInfo.parameterTypes[j].getComponentType().getName();
                    if (methodInfo.valueGetter || methodInfo.valueSetter ||
                            methodInfo.memberGetter || methodInfo.memberSetter) {
                        out.println("(j" + s + "*)env->GetPrimitiveArrayCritical(arg" + j + ", NULL);");
                    } else {
                        s = Character.toUpperCase(s.charAt(0)) + s.substring(1);
                        out.println("env->Get" + s + "ArrayElements(arg" + j + ", NULL);");
                    }
                    if (adapterInfo != null || prevAdapterInfo != null) {
                        out.println("    jlong size" + j +
                                " = arg" + j + " == NULL ? 0 : env->GetArrayLength(arg" + j + ");");
                        out.println("    void* owner" + j + " = (void*)ptr" + j + ";");
                    }
                } else if (Buffer.class.isAssignableFrom(methodInfo.parameterTypes[j])) {
                    out.println("arg" + j + " == NULL ? NULL : (" + typeName[0] + typeName[1] + ")env->GetDirectBufferAddress(arg" + j + ");");
                    if (adapterInfo != null || prevAdapterInfo != null) {
                        out.println("    jlong size" + j +
                                " = arg" + j + " == NULL ? 0 : env->GetDirectBufferCapacity(arg" + j + ");");
                        out.println("    void* owner" + j + " = (void*)ptr" + j + ";");
                    }
                    if (methodInfo.parameterTypes[j] != Buffer.class) {
                        // given the component type, we can also fetch the array of non-direct buffers
                        String paramName = methodInfo.parameterTypes[j].getSimpleName();
                        paramName = paramName.substring(0, paramName.length() - 6);
                        String paramNameLowerCase = Character.toLowerCase(paramName.charAt(0)) + paramName.substring(1);
                        out.println("    j" + paramNameLowerCase + "Array arr" + j + " = NULL;");
                        out.println("    if (arg" + j + " != NULL && ptr" + j + " == NULL) {");
                        out.println("        arr" + j + " = (j" + paramNameLowerCase + "Array)env->CallObjectMethod(arg" + j + ", JavaCPP_arrayMID);");
                        out.println("        if (env->ExceptionOccurred() != NULL) {");
                        out.println("            env->ExceptionClear();");
                        out.println("        } else {");
                        out.println("            ptr" + j + " = arr" + j + " == NULL ? NULL : env->Get" + paramName + "ArrayElements(arr" + j + ", NULL);");
                        if (adapterInfo != null || prevAdapterInfo != null) {
                            out.println("            size" + j + " = env->GetArrayLength(arr" + j + ");");
                        }
                        out.println("        }");
                        out.println("    }");
                    }
                } else {
                    out.println("arg" + j + ";");
                    logger.warn("Method \"" + methodInfo.method + "\" has an unsupported parameter of type \"" +
                            methodInfo.parameterTypes[j].getCanonicalName() + "\". Compilation will most likely fail.");
                }

                if (adapterInfo != null) {
                    usesAdapters = true;
                    adapterLine = "    " + adapterInfo.name + " adapter" + j + "(";
                    prevAdapterInfo = adapterInfo;
                }
                if (prevAdapterInfo != null) {
                    if (!FunctionPointer.class.isAssignableFrom(methodInfo.cls)) {
                        // sometimes we need to use the Cast annotation for declaring functions only
                        adapterLine += cast;
                    }
                    adapterLine += "ptr" + j + ", size" + j + ", owner" + j;
                    if (--prevAdapterInfo.argc > 0) {
                        adapterLine += ", ";
                    }
                }
                if (prevAdapterInfo != null && prevAdapterInfo.argc <= 0) {
                    out.println(adapterLine + ");");
                    prevAdapterInfo = null;
                }
            }
        }
    }

    String returnBefore(MethodInformation methodInfo) {
        String returnPrefix = "";
        if (methodInfo.returnType == void.class) {
            if (methodInfo.allocator || methodInfo.arrayAllocator) {
                jclasses.index(methodInfo.cls); // makes sure to index all POD structs
                String[] typeName = cppTypeName(methodInfo.cls);
                returnPrefix = typeName[0] + " rptr" + typeName[1] + " = ";
            }
        } else {
            String cast = cast(methodInfo.returnType, methodInfo.annotations);
            String[] typeName = methodInfo.returnRaw ? new String[] { "" }
                    : cppCastTypeName(methodInfo.returnType, methodInfo.annotations);
            if (methodInfo.valueSetter || methodInfo.memberSetter || methodInfo.noReturnGetter) {
                out.println("    jobject rarg = obj;");
            } else if (methodInfo.returnType.isPrimitive()) {
                out.println("    " + jniTypeName(methodInfo.returnType) + " rarg = 0;");
                returnPrefix = typeName[0] + " rvalue" + typeName[1] + " = " + cast;
            } else {
                Annotation returnBy = by(methodInfo.annotations);
                String valueTypeName = valueTypeName(typeName);

                returnPrefix = "rptr = " + cast;
                if (typeName[0].length() == 0 || methodInfo.returnRaw) {
                    methodInfo.returnRaw = true;
                    typeName[0] = jniTypeName(methodInfo.returnType);
                    out.println("    " + typeName[0] + " rarg = NULL;");
                    out.println("    " + typeName[0] + " rptr;");
                } else if (Pointer.class.isAssignableFrom(methodInfo.returnType) ||
                        Buffer.class.isAssignableFrom(methodInfo.returnType) ||
                        (methodInfo.returnType.isArray() &&
                         methodInfo.returnType.getComponentType().isPrimitive())) {
                    if (FunctionPointer.class.isAssignableFrom(methodInfo.returnType)) {
                        functions.index(methodInfo.returnType);
                        returnPrefix = "if (rptr != NULL) rptr->ptr = ";
                        if (methodInfo.method.isAnnotationPresent(Virtual.class)) {
                            // cast from member function pointers declared in Java
                            returnPrefix += "(" + typeName[0] + typeName[1] + ")&";
                        }
                        typeName[0] = functionClassName(methodInfo.returnType) + "*";
                        typeName[1] = "";
                        valueTypeName = valueTypeName(typeName);
                    }
                    if (returnBy instanceof ByVal) {
                        returnPrefix += (noException(methodInfo.returnType, methodInfo.method) ?
                            "new (std::nothrow) " : "new ") + valueTypeName + typeName[1] + "(";
                    } else if (returnBy instanceof ByRef) {
                        returnPrefix += "&";
                    } else if (returnBy instanceof ByPtrPtr) {
                        if (cast.length() > 0) {
                            typeName[0] = typeName[0].substring(0, typeName[0].length()-1);
                        }
                        returnPrefix = "rptr = NULL; " + typeName[0] + "* rptrptr" + typeName[1] + " = " + cast;
                    } // else ByPtr || ByPtrRef
                    if (methodInfo.bufferGetter) {
                        out.println("    jobject rarg = NULL;");
                        out.println("    char* rptr;");
                    } else {
                        out.println("    " + jniTypeName(methodInfo.returnType) + " rarg = NULL;");
                        out.println("    " + typeName[0] + " rptr" + typeName[1] + ";");
                    }
                    if (FunctionPointer.class.isAssignableFrom(methodInfo.returnType)) {
                        out.println("    rptr = new (std::nothrow) " + valueTypeName + ";");
                    }
                } else if (methodInfo.returnType == String.class) {
                    out.println("    jstring rarg = NULL;");
                    out.println("    const char* rptr;");
                    if (returnBy instanceof ByRef) {
                        returnPrefix = "std::string rstr(";
                    } else {
                        returnPrefix += "(const char*)";
                    }
                } else {
                    logger.warn("Method \"" + methodInfo.method + "\" has unsupported return type \"" +
                            methodInfo.returnType.getCanonicalName() + "\". Compilation will most likely fail.");
                }

                AdapterInformation adapterInfo = adapterInformation(false, valueTypeName, methodInfo.annotations);
                if (adapterInfo != null) {
                    usesAdapters = true;
                    returnPrefix = adapterInfo.name + " radapter(";
                }
            }
        }
        if (methodInfo.throwsException != null) {
            out.println("    jthrowable exc = NULL;");
            out.println("    try {");
        }
        return returnPrefix;
    }

    void call(MethodInformation methodInfo, String returnPrefix, boolean secondCall) {
        boolean needSecondCall = false;
        String indent = secondCall ? "" : methodInfo.throwsException != null ? "        " : "    ";
        String prefix = "(";
        String suffix = ")";
        int skipParameters = methodInfo.parameterTypes.length > 0 && methodInfo.parameterTypes[0] == Class.class ? 1 : 0;
        boolean index = methodInfo.method.isAnnotationPresent(Index.class) ||
                 (methodInfo.pairedMethod != null &&
                  methodInfo.pairedMethod.isAnnotationPresent(Index.class));
        if (methodInfo.deallocator) {
            out.println(indent + "void* allocatedAddress = jlong_to_ptr(arg0);");
            out.println(indent + "void (*deallocatorAddress)(void*) = (void(*)(void*))jlong_to_ptr(arg1);");
            out.println(indent + "if (deallocatorAddress != NULL && allocatedAddress != NULL) {");
            out.println(indent + "    (*deallocatorAddress)(allocatedAddress);");
            out.println(indent + "}");
            return; // nothing else should be appended here for deallocator
        } else if (methodInfo.valueGetter || methodInfo.valueSetter ||
                methodInfo.memberGetter || methodInfo.memberSetter) {
            boolean wantsPointer = false;
            int k = methodInfo.parameterTypes.length-1;
            if ((methodInfo.valueSetter || methodInfo.memberSetter) &&
                    !(by(methodInfo, k) instanceof ByRef) &&
                    adapterInformation(false, methodInfo, k) == null &&
                    methodInfo.parameterTypes[k] == String.class) {
                // special considerations for char arrays as strings
                out.print(indent + "strcpy((char*)");
                wantsPointer = true;
                prefix = ", ";
            } else if (k >= 1 && methodInfo.parameterTypes[0].isArray() &&
                    methodInfo.parameterTypes[0].getComponentType().isPrimitive() &&
                    (methodInfo.parameterTypes[1] == int.class ||
                     methodInfo.parameterTypes[1] == long.class)) {
                // special considerations for primitive arrays
                out.print(indent + "memcpy(");
                wantsPointer = true;
                prefix = ", ";
                if (methodInfo.memberGetter || methodInfo.valueGetter) {
                    out.print("ptr0 + arg1, ");
                } else { // methodInfo.memberSetter || methodInfo.valueSetter
                    prefix += "ptr0 + arg1, ";
                }
                skipParameters = 2;
                suffix = " * sizeof(*ptr0)" + suffix;
            } else {
                out.print(indent + returnPrefix);
                prefix = methodInfo.valueGetter || methodInfo.memberGetter ? "" : " = ";
                suffix = "";
            }
            if (Modifier.isStatic(methodInfo.modifiers)) {
                out.print(cppScopeName(methodInfo));
            } else if (methodInfo.memberGetter || methodInfo.memberSetter) {
                if (index) {
                    out.print("(*ptr)");
                    prefix = "." + methodInfo.memberName[0] + prefix;
                } else {
                    out.print("ptr->" + methodInfo.memberName[0]);
                }
            } else { // methodInfo.valueGetter || methodInfo.valueSetter
                out.print(index ? "(*ptr)" : methodInfo.dim > 0 || wantsPointer ? "ptr" : "*ptr");
            }
        } else if (methodInfo.bufferGetter) {
            out.print(indent + returnPrefix + "ptr");
            prefix = "";
            suffix = "";
        } else { // function call
            out.print(indent + returnPrefix);
            if (FunctionPointer.class.isAssignableFrom(methodInfo.cls)) {
                if (methodInfo.cls.isAnnotationPresent(Namespace.class)) {
                    out.print("(ptr0->*(ptr->ptr))");
                    skipParameters = 1;
                } else {
                    out.print("(*ptr->ptr)");
                }
            } else if (methodInfo.allocator) {
                String[] typeName = cppTypeName(methodInfo.cls);
                String valueTypeName = valueTypeName(typeName);
                if (virtualFunctions.containsKey(methodInfo.cls)) {
                    String subType = "JavaCPP_" + mangle(valueTypeName);
                    valueTypeName = subType;
                }
                if (methodInfo.cls == Pointer.class) {
                    // can't allocate a "void", so simply assign the argument instead
                    prefix = "";
                    suffix = "";
                } else {
                    out.print((noException(methodInfo.cls, methodInfo.method) ?
                        "new (std::nothrow) " : "new ") + valueTypeName + typeName[1]);
                    if (methodInfo.arrayAllocator) {
                        prefix = "[";
                        suffix = "]";
                    }
                }
            } else if (Modifier.isStatic(methodInfo.modifiers)) {
                out.print(cppScopeName(methodInfo));
            } else {
                String name = methodInfo.memberName[0];
                String[] typeName = cppTypeName(methodInfo.cls);
                String valueTypeName = valueTypeName(typeName);
                if (virtualFunctions.containsKey(methodInfo.cls) && !secondCall) {
                    String subType = "JavaCPP_" + mangle(valueTypeName);
                    if (Modifier.isPublic(methodInfo.method.getModifiers())) {
                        // non-protected method that could be from any subclass, so check for ours
                        out.print("(dynamic_cast<" + subType + "*>(ptr) != NULL ? ");
                        needSecondCall = true;
                    }
                    if (methodInfo.method.isAnnotationPresent(Virtual.class)) {
                        name = "super_" + name;
                    }
                    out.print("((" + subType + "*)ptr)->" + name);
                } else if (index) {
                    out.print("(*ptr)");
                    prefix = "." + name + prefix;
                } else {
                    String op = name.startsWith("operator") ? name.substring(8).trim() : "";
                    if (methodInfo.parameterTypes.length > 0
                            && (op.equals("=") || op.equals("+") || op.equals("-") || op.equals("*") || op.equals("/") || op.equals("%")
                            || op.equals("==") || op.equals("!=") || op.equals("<") || op.equals(">") || op.equals("<=") || op.equals(">="))) {
                        out.print("((*ptr)");
                        prefix = op + prefix;
                        suffix += ")";
                    } else {
                        out.print("ptr->" + name);
                    }
                }
            }
        }

        for (int j = skipParameters; j <= methodInfo.parameterTypes.length; j++) {
            if (j == skipParameters + methodInfo.dim) {
                if (methodInfo.memberName.length > 1) {
                    out.print(methodInfo.memberName[1]);
                }
                out.print(prefix);
                if (methodInfo.withEnv) {
                    out.print(Modifier.isStatic(methodInfo.modifiers) ? "env, cls" : "env, obj");
                    if (methodInfo.parameterTypes.length - skipParameters - methodInfo.dim > 0) {
                        out.print(", ");
                    }
                }
            }
            if (j == methodInfo.parameterTypes.length) {
                break;
            }
            if (j < skipParameters + methodInfo.dim) {
                // print array indices to access array members, or whatever
                // the C++ operator does with them when the Index annotation is present
                out.print("[");
            }
            Annotation passBy = by(methodInfo, j);
            String cast = cast(methodInfo, j);
            AdapterInformation adapterInfo = methodInfo.parameterRaw[j] ? null
                    : adapterInformation(false, methodInfo, j);

            if (("(void*)".equals(cast) || "(void *)".equals(cast)) &&
                    methodInfo.parameterTypes[j] == long.class) {
                out.print("jlong_to_ptr(arg" + j + ")");
            } else if (methodInfo.parameterTypes[j].isPrimitive()) {
                out.print(cast + "arg" + j);
            } else if (adapterInfo != null) {
                cast = adapterInfo.cast.trim();
                if (cast.length() > 0 && !cast.startsWith("(") && !cast.endsWith(")")) {
                    cast = "(" + cast + ")";
                }
                out.print(cast + "adapter" + j);
                j += adapterInfo.argc - 1;
            } else if (FunctionPointer.class.isAssignableFrom(methodInfo.parameterTypes[j])
                    && !(passBy instanceof ByVal || passBy instanceof ByRef)) {
                out.print(cast + "(ptr" + j + " == NULL ? NULL : " + (passBy instanceof ByPtrPtr ? "&ptr" : "ptr") + j + "->ptr)");
            } else if (passBy instanceof ByVal || (passBy instanceof ByRef &&
                    methodInfo.parameterTypes[j] != String.class)) {
                String nullValue = passBy instanceof ByVal ? ((ByVal)passBy).nullValue()
                                 : passBy instanceof ByRef ? ((ByRef)passBy).nullValue() : "";
                out.print((nullValue.length() > 0 ? "ptr" + j + " == NULL ? " + nullValue + " : " : "") + "*" + cast + "ptr" + j);
            } else if (passBy instanceof ByPtrPtr) {
                out.print(cast + "(arg" + j + " == NULL ? NULL : &ptr" + j + ")");
            } else { // ByPtr || ByPtrRef || (ByRef && std::string)
                out.print(cast + "ptr" + j);
            }

            if (j < skipParameters + methodInfo.dim) {
                out.print("]");
            } else if (j < methodInfo.parameterTypes.length - 1) {
                out.print(", ");
            }
        }
        out.print(suffix);
        if (methodInfo.memberName.length > 2) {
            out.print(methodInfo.memberName[2]);
        }
        if (by(methodInfo.annotations) instanceof ByRef &&
                methodInfo.returnType == String.class) {
            // special considerations for std::string
            out.print(");\n" + indent + "rptr = rstr.c_str()");
        }
        if (needSecondCall) {
            call(methodInfo, " : ", true);
            out.print(")");
        }
    }

    void returnAfter(MethodInformation methodInfo) {
        String indent = methodInfo.throwsException != null ? "        " : "    ";
        String[] typeName = methodInfo.returnRaw ? new String[] { "" }
                : cppCastTypeName(methodInfo.returnType, methodInfo.annotations);
        Annotation returnBy = by(methodInfo.annotations);
        String valueTypeName = valueTypeName(typeName);
        AdapterInformation adapterInfo = adapterInformation(false, valueTypeName, methodInfo.annotations);
        String suffix = methodInfo.deallocator ? "" : ";";
        if (!methodInfo.returnType.isPrimitive() && adapterInfo != null) {
            suffix = ")" + suffix;
        }
        if ((Pointer.class.isAssignableFrom(methodInfo.returnType) ||
                (methodInfo.returnType.isArray() &&
                 methodInfo.returnType.getComponentType().isPrimitive()) ||
                Buffer.class.isAssignableFrom(methodInfo.returnType))) {
            if (returnBy instanceof ByVal && adapterInfo == null) {
                suffix = ")" + suffix;
            } else if (returnBy instanceof ByPtrPtr) {
                out.println(suffix);
                suffix = "";
                out.println(indent + "if (rptrptr == NULL) {");
                out.println(indent + "    env->ThrowNew(JavaCPP_getClass(env, " +
                        jclasses.index(NullPointerException.class) + "), \"Return pointer address is NULL.\");");
                out.println(indent + "} else {");
                out.println(indent + "    rptr = *rptrptr;");
                out.println(indent + "}");
            }
        }
        out.println(suffix);

        if (methodInfo.returnType == void.class) {
            if (methodInfo.allocator || methodInfo.arrayAllocator) {
                out.println(indent + "jlong rcapacity = " + (methodInfo.arrayAllocator ? "arg0;" : "1;"));
                boolean noDeallocator = methodInfo.cls == Pointer.class ||
                        methodInfo.cls.isAnnotationPresent(NoDeallocator.class) ||
                        methodInfo.method.isAnnotationPresent(NoDeallocator.class);
                out.print(indent + "JavaCPP_initPointer(env, obj, rptr, rcapacity, rptr, ");
                if (noDeallocator) {
                    out.println("NULL);");
                } else if (methodInfo.arrayAllocator) {
                    out.println("&JavaCPP_" + mangle(methodInfo.cls.getName()) + "_deallocateArray);");
                    arrayDeallocators.index(methodInfo.cls);
                } else {
                    out.println("&JavaCPP_" + mangle(methodInfo.cls.getName()) + "_deallocate);");
                    deallocators.index(methodInfo.cls);
                }
                if (virtualFunctions.containsKey(methodInfo.cls)) {
                    typeName = cppTypeName(methodInfo.cls);
                    valueTypeName = valueTypeName(typeName);
                    String subType = "JavaCPP_" + mangle(valueTypeName);
                    out.println(indent + "((" + subType + "*)rptr)->obj = env->NewWeakGlobalRef(obj);");
                }
            }
        } else {
            if (methodInfo.valueSetter || methodInfo.memberSetter || methodInfo.noReturnGetter) {
                // nothing
            } else if (methodInfo.returnType.isPrimitive()) {
                out.println(indent + "rarg = (" + jniTypeName(methodInfo.returnType) + ")rvalue;");
            } else if (methodInfo.returnRaw) {
                out.println(indent + "rarg = rptr;");
            } else {
                boolean needInit = false;
                if (adapterInfo != null) {
                    out.println(indent + "rptr = radapter;");
                    if (methodInfo.returnType != String.class) {
                        out.println(indent + "jlong rcapacity = (jlong)radapter.size;");
                        if (Pointer.class.isAssignableFrom(methodInfo.returnType)) {
                            out.println(indent + "void* rowner = radapter.owner;");
                        }
                        out.println(indent + "void (*deallocator)(void*) = " +
                                (adapterInfo.constant ? "NULL;" : "&" + adapterInfo.name + "::deallocate;"));
                    }
                    needInit = true;
                } else if (returnBy instanceof ByVal ||
                        FunctionPointer.class.isAssignableFrom(methodInfo.returnType)) {
                    out.println(indent + "jlong rcapacity = 1;");
                    out.println(indent + "void* rowner = (void*)rptr;");
                    out.println(indent + "void (*deallocator)(void*) = &JavaCPP_" +
                            mangle(methodInfo.returnType.getName()) + "_deallocate;");
                    deallocators.index(methodInfo.returnType);
                    needInit = true;
                }

                if (Pointer.class.isAssignableFrom(methodInfo.returnType)) {
                    out.print(indent);
                    if (!(returnBy instanceof ByVal)) {
                        // check if we can reuse one of the Pointer objects from the arguments
                        if (Modifier.isStatic(methodInfo.modifiers) && methodInfo.parameterTypes.length > 0) {
                            for (int i = 0; i < methodInfo.parameterTypes.length; i++) {
                                String cast = cast(methodInfo, i);
                                if (Arrays.equals(methodInfo.parameterAnnotations[i], methodInfo.annotations)
                                        && methodInfo.parameterTypes[i] == methodInfo.returnType) {
                                    out.println(         "if (rptr == " + cast + "ptr" + i + ") {");
                                    out.println(indent + "    rarg = arg" + i + ";");
                                    out.print(indent + "} else ");
                                }
                            }
                        } else if (!Modifier.isStatic(methodInfo.modifiers) && methodInfo.cls == methodInfo.returnType) {
                            out.println(         "if (rptr == ptr) {");
                            out.println(indent + "    rarg = obj;");
                            out.print(indent + "} else ");
                        }
                    }
                    out.println(         "if (rptr != NULL) {");
                    out.println(indent + "    rarg = JavaCPP_createPointer(env, " + jclasses.index(methodInfo.returnType) +
                            (methodInfo.parameterTypes.length > 0 && methodInfo.parameterTypes[0] == Class.class ? ", arg0);" : ");"));
                    out.println(indent + "    if (rarg != NULL) {");
                    if (needInit) {
                        out.println(indent + "        JavaCPP_initPointer(env, rarg, rptr, rcapacity, rowner, deallocator);");
                    } else {
                        out.println(indent + "        env->SetLongField(rarg, JavaCPP_addressFID, ptr_to_jlong(rptr));");
                    }
                    out.println(indent + "    }");
                    out.println(indent + "}");
                } else if (methodInfo.returnType == String.class) {
                    passesStrings = true;
                    out.println(indent + "if (rptr != NULL) {");
                    out.println(indent + "    rarg = JavaCPP_createString(env, rptr);");
                    out.println(indent + "}");
                } else if (methodInfo.returnType.isArray() &&
                        methodInfo.returnType.getComponentType().isPrimitive()) {
                    if (adapterInfo == null && !(returnBy instanceof ByVal)) {
                        out.println(indent + "jlong rcapacity = rptr != NULL ? 1 : 0;");
                    }
                    String componentName = methodInfo.returnType.getComponentType().getName();
                    String componentNameUpperCase = Character.toUpperCase(componentName.charAt(0)) + componentName.substring(1);
                    out.println(indent + "if (rptr != NULL) {");
                    out.println(indent + "    rarg = env->New" + componentNameUpperCase + "Array(rcapacity < INT_MAX ? rcapacity : INT_MAX);");
                    out.println(indent + "    env->Set" + componentNameUpperCase + "ArrayRegion(rarg, 0, rcapacity < INT_MAX ? rcapacity : INT_MAX, (j" + componentName + "*)rptr);");
                    out.println(indent + "}");
                    if (adapterInfo != null) {
                        out.println(indent + "if (deallocator != 0 && rptr != NULL) {");
                        out.println(indent + "    (*(void(*)(void*))jlong_to_ptr(deallocator))((void*)rptr);");
                        out.println(indent + "}");
                    }
                } else if (Buffer.class.isAssignableFrom(methodInfo.returnType)) {
                    if (methodInfo.bufferGetter) {
                        out.println(indent + "jlong rcapacity = size;");
                    } else if (adapterInfo == null && !(returnBy instanceof ByVal)) {
                        out.println(indent + "jlong rcapacity = rptr != NULL ? 1 : 0;");
                    }
                    out.println(indent + "if (rptr != NULL) {");
                    out.println(indent + "    jlong rcapacityptr = rcapacity * sizeof(rptr[0]);");
                    out.println(indent + "    rarg = env->NewDirectByteBuffer((void*)rptr, rcapacityptr < INT_MAX ? rcapacityptr : INT_MAX);");
                    out.println(indent + "}");
                }
            }
        }
    }

    void parametersAfter(MethodInformation methodInfo) {
        if (methodInfo.throwsException != null) {
            mayThrowExceptions = true;
            out.println("    } catch (...) {");
            out.println("        exc = JavaCPP_handleException(env, " + jclasses.index(methodInfo.throwsException) + ");");
            out.println("    }");
            out.println();
        }
        int skipParameters = methodInfo.parameterTypes.length > 0 && methodInfo.parameterTypes[0] == Class.class ? 1 : 0;
        for (int j = skipParameters; j < methodInfo.parameterTypes.length; j++) {
            if (methodInfo.parameterRaw[j]) {
                continue;
            }
            Annotation passBy = by(methodInfo, j);
            String cast = cast(methodInfo, j);
            String[] typeName = cppCastTypeName(methodInfo.parameterTypes[j], methodInfo.parameterAnnotations[j]);
            AdapterInformation adapterInfo = adapterInformation(true, methodInfo, j);
            if ("void*".equals(typeName[0]) && !methodInfo.parameterTypes[j].isAnnotationPresent(Opaque.class)) {
                typeName[0] = "char*";
            }
            
            // If const array, then use JNI_ABORT to avoid copying unmodified data back to JVM
            final String releaseArrayFlag;
            if (cast.contains(" const *") || cast.startsWith("(const ")) {
                releaseArrayFlag = "JNI_ABORT";
            } else {
                releaseArrayFlag = "0";
            }

            if (Pointer.class.isAssignableFrom(methodInfo.parameterTypes[j])) {
                if (adapterInfo != null) {
                    for (int k = 0; k < adapterInfo.argc; k++) {
                        out.println("    " + typeName[0] + " rptr" + (j+k) + typeName[1] + " = " + cast + "adapter" + j + ";");
                        out.println("    jlong rsize" + (j+k) + " = (jlong)adapter" + j + ".size" + (k > 0 ? (k+1) + ";" : ";"));
                        out.println("    void* rowner" + (j+k) + " = adapter" + j + ".owner" + (k > 0 ? (k+1) + ";" : ";"));
                        out.println("    if (rptr" + (j+k) + " != " + cast + "ptr" + (j+k) + ") {");
                        out.println("        JavaCPP_initPointer(env, arg" + j + ", rptr" + (j+k) + ", rsize" + (j+k) + ", rowner" + (j+k) + ", &" + adapterInfo.name + "::deallocate);");
                        out.println("    } else {");
                        out.println("        env->SetLongField(arg" + j + ", JavaCPP_limitFID, rsize" + (j+k) + " + position" + (j+k) + ");");
                        out.println("    }");
                    }
                } else if ((passBy instanceof ByPtrPtr || passBy instanceof ByPtrRef) &&
                        !methodInfo.valueSetter && !methodInfo.memberSetter) {
                    if (!methodInfo.parameterTypes[j].isAnnotationPresent(Opaque.class)) {
                        out.println("    ptr" + j + " -= position" + j + ";");
                    }
                    out.println("    if (arg" + j + " != NULL) env->SetLongField(arg" + j +
                            ", JavaCPP_addressFID, ptr_to_jlong(ptr" + j + "));");
                }
            } else if (methodInfo.parameterTypes[j] == String.class) {
                out.println("    JavaCPP_releaseStringBytes(env, arg" + j + ", ptr" + j + ");");
            } else if (methodInfo.parameterTypes[j].isArray() &&
                    methodInfo.parameterTypes[j].getComponentType().isPrimitive()) {
                for (int k = 0; adapterInfo != null && k < adapterInfo.argc; k++) {
                    out.println("    " + typeName[0] + " rptr" + (j+k) + typeName[1] + " = " + cast + "adapter" + j + ";");
                    out.println("    void* rowner" + (j+k) + " = adapter" + j + ".owner" + (k > 0 ? (k+1) + ";" : ";"));
                    out.println("    if (rptr" + (j+k) + " != " + cast + "ptr" + (j+k) + ") {");
                    out.println("        " + adapterInfo.name + "::deallocate(rowner" + (j+k) + ");");
                    out.println("    }");
                }
                out.print("    if (arg" + j + " != NULL) ");
                if (methodInfo.valueGetter || methodInfo.valueSetter ||
                        methodInfo.memberGetter || methodInfo.memberSetter) {
                    out.println("env->ReleasePrimitiveArrayCritical(arg" + j + ", ptr" + j + ", " + releaseArrayFlag + ");");
                } else {
                    String componentType = methodInfo.parameterTypes[j].getComponentType().getName();
                    String componentTypeUpperCase = Character.toUpperCase(componentType.charAt(0)) + componentType.substring(1);
                    out.println("env->Release" + componentTypeUpperCase + "ArrayElements(arg" + j + ", (j" + componentType + "*)ptr" + j + ", " + releaseArrayFlag + ");");
                }
            } else if (Buffer.class.isAssignableFrom(methodInfo.parameterTypes[j])
                    && methodInfo.parameterTypes[j] != Buffer.class) {
                for (int k = 0; adapterInfo != null && k < adapterInfo.argc; k++) {
                    out.println("    " + typeName[0] + " rptr" + (j+k) + typeName[1] + " = " + cast + "adapter" + j + ";");
                    out.println("    void* rowner" + (j+k) + " = adapter" + j + ".owner" + (k > 0 ? (k+1) + ";" : ";"));
                    out.println("    if (rptr" + (j+k) + " != " + cast + "ptr" + (j+k) + ") {");
                    out.println("        " + adapterInfo.name + "::deallocate(rowner" + (j+k) + ");");
                    out.println("    }");
                }
                out.print("    if (arr" + j + " != NULL) ");
                String parameterSimpleName = methodInfo.parameterTypes[j].getSimpleName();
                parameterSimpleName = parameterSimpleName.substring(0, parameterSimpleName.length() - 6);
                String parameterSimpleNameLowerCase = Character.toLowerCase(parameterSimpleName.charAt(0)) + parameterSimpleName.substring(1);
                
                out.println("env->Release" + parameterSimpleName + "ArrayElements(arr" + j + ", " + 
                            "(j" + parameterSimpleNameLowerCase + "*)ptr" + j + ", " + 
                            releaseArrayFlag + ");");
            }
        }
    }

    void callback(Class<?> cls, Method callbackMethod, String callbackName, boolean needDefinition, MethodInformation methodInfo) {
        Class<?> callbackReturnType = callbackMethod.getReturnType();
        Class<?>[] callbackParameterTypes = callbackMethod.getParameterTypes();
        Annotation[] callbackAnnotations = callbackMethod.getAnnotations();
        Annotation[][] callbackParameterAnnotations = callbackMethod.getParameterAnnotations();

        String instanceTypeName = functionClassName(cls);
        String[] callbackTypeName = cppFunctionTypeName(callbackMethod);
        String[] returnConvention = callbackTypeName[0].split("\\(");
        returnConvention[1] = constValueTypeName(returnConvention[1]);
        String parameterDeclaration = callbackTypeName[1].substring(1);
        String fieldName = mangle(callbackMethod.getName()) + "__" + mangle(signature(callbackMethod.getParameterTypes()));

        String firstLine = "";
        if (methodInfo != null) {
            // stuff from a virtualized class
            String nonconstParamDeclaration = parameterDeclaration.endsWith(" const")
                    ? parameterDeclaration.substring(0, parameterDeclaration.length() - 6)
                    : parameterDeclaration;
            String[] typeName = methodInfo.returnRaw ? new String[] { "" }
                    : cppTypeName(methodInfo.cls);
            String valueTypeName = valueTypeName(typeName);
            String subType = "JavaCPP_" + mangle(valueTypeName);
            Set<String> memberList = virtualMembers.get(cls);
            if (memberList == null) {
                virtualMembers.put(cls, memberList = new LinkedHashSet<String>());
            }
            String member = "    ";
            if (methodInfo.arrayAllocator) {
                return;
            } else if (methodInfo.allocator) {
                member += subType + nonconstParamDeclaration + " : " + valueTypeName + "(";
                for (int j = 0; j < callbackParameterTypes.length; j++) {
                    member += "arg" + j;
                    if (j < callbackParameterTypes.length - 1) {
                        member += ", ";
                    }
                }
                member += "), obj(NULL) { }";
            } else {
                Set<String> functionList = virtualFunctions.get(cls);
                if (functionList == null) {
                    virtualFunctions.put(cls, functionList = new LinkedHashSet<String>());
                }
                member += "using " + valueTypeName + "::" + methodInfo.memberName[0] + ";\n    "
                       +  "virtual " + returnConvention[0] + (returnConvention.length > 1 ? returnConvention[1] : "")
                       +  methodInfo.memberName[0] + parameterDeclaration + ";\n    "
                       +  returnConvention[0] + "super_" + methodInfo.memberName[0] + nonconstParamDeclaration + " { ";
                if (methodInfo.method.getAnnotation(Virtual.class).value()) {
                    member += "throw JavaCPP_exception(\"Cannot call a pure virtual function.\"); }";
                } else {
                    member += (callbackReturnType != void.class ? "return " : "") + valueTypeName + "::" + methodInfo.memberName[0] + "(";
                    for (int j = 0; j < callbackParameterTypes.length; j++) {
                        member += "arg" + j;
                        if (j < callbackParameterTypes.length - 1) {
                            member += ", ";
                        }
                    }
                    member += "); }";
                }
                firstLine = returnConvention[0] + (returnConvention.length > 1 ? returnConvention[1] : "")
                        + subType + "::" + methodInfo.memberName[0] + parameterDeclaration + " {";
                functionList.add(fieldName);
            }
            memberList.add(member);
        } else if (callbackName != null) {
            callbacks.index("static " + instanceTypeName + " " + callbackName + "_instance;");
            Convention convention = cls.getAnnotation(Convention.class);
            if (convention != null && !convention.extern().equals("C")) {
                out.println("extern \"" + convention.extern() + "\" {");
                if (out2 != null) {
                    out2.println("extern \"" + convention.extern() + "\" {");
                }
            }
            if (out2 != null) {
                out2.println("JNIIMPORT " + returnConvention[0] + (returnConvention.length > 1 ?
                        returnConvention[1] : "") + callbackName + parameterDeclaration + ";");
            }
            out.println("JNIEXPORT " + returnConvention[0] + (returnConvention.length > 1 ?
                    returnConvention[1] : "") + callbackName + parameterDeclaration + " {");
            out.print((callbackReturnType != void.class ? "    return " : "    ") + callbackName + "_instance(");
            for (int j = 0; j < callbackParameterTypes.length; j++) {
                out.print("arg" + j);
                if (j < callbackParameterTypes.length - 1) {
                    out.print(", ");
                }
            }
            out.println(");");
            out.println("}");
            if (convention != null && !convention.extern().equals("C")) {
                out.println("}");
                if (out2 != null) {
                    out2.println("}");
                }
            }

            firstLine = returnConvention[0] + instanceTypeName + "::operator()" + parameterDeclaration + " {";
        }

        if (!needDefinition) {
            return;
        }
        out.println(firstLine);

        String returnPrefix = "";
        if (callbackReturnType != void.class) {
            out.println("    " + jniTypeName(callbackReturnType) + " rarg = 0;");
            returnPrefix = "rarg = ";
            if (callbackReturnType == String.class) {
                returnPrefix += "(jstring)";
            }
        }
        String callbackReturnCast = cast(callbackReturnType, callbackAnnotations);
        Annotation returnBy = by(callbackAnnotations);
        String[] returnTypeName = cppTypeName(callbackReturnType);
        String returnValueTypeName = valueTypeName(returnTypeName);
        AdapterInformation returnAdapterInfo = adapterInformation(false, returnValueTypeName, callbackAnnotations);

        out.println("    jthrowable exc = NULL;");
        out.println("    JNIEnv* env;");
        out.println("    bool attached = JavaCPP_getEnv(&env);");
        out.println("    if (env == NULL) {");
        out.println("        goto end;");
        out.println("    }");
        out.println("{");
        if (callbackParameterTypes.length > 0) {
            out.println("    jvalue args[" + callbackParameterTypes.length + "];");
            for (int j = 0; j < callbackParameterTypes.length; j++) {
                if (callbackParameterTypes[j].isPrimitive()) {
                    out.println("    args[" + j + "]." +
                            signature(callbackParameterTypes[j]).toLowerCase() + " = (" +
                            jniTypeName(callbackParameterTypes[j]) + ")arg" + j + ";");
                } else {
                    Annotation passBy = by(callbackParameterAnnotations[j]);
                    String[] typeName = cppTypeName(callbackParameterTypes[j]);
                    String valueTypeName = valueTypeName(typeName);
                    AdapterInformation adapterInfo = adapterInformation(false, valueTypeName, callbackParameterAnnotations[j]);

                    if (adapterInfo != null) {
                        usesAdapters = true;
                        out.println("    " + adapterInfo.name + " adapter" + j + "(arg" + j + ");");
                    }

                    if (Pointer.class.isAssignableFrom(callbackParameterTypes[j]) ||
                            Buffer.class.isAssignableFrom(callbackParameterTypes[j]) ||
                            (callbackParameterTypes[j].isArray() &&
                             callbackParameterTypes[j].getComponentType().isPrimitive())) {
                        String cast = "(" + typeName[0] + typeName[1] + ")";
                        if (FunctionPointer.class.isAssignableFrom(callbackParameterTypes[j])) {
                            functions.index(callbackParameterTypes[j]);
                            typeName[0] = functionClassName(callbackParameterTypes[j]) + "*";
                            typeName[1] = "";
                            valueTypeName = valueTypeName(typeName);
                        } else if (virtualFunctions.containsKey(callbackParameterTypes[j])) {
                            String subType = "JavaCPP_" + mangle(valueTypeName);
                            valueTypeName = subType;
                        }
                        out.println("    " + jniTypeName(callbackParameterTypes[j]) + " obj" + j + " = NULL;");
                        out.println("    " + typeName[0] + " ptr" + j + typeName[1] + " = NULL;");
                        if (FunctionPointer.class.isAssignableFrom(callbackParameterTypes[j])) {
                            out.println("    ptr" + j + " = new (std::nothrow) " + valueTypeName + ";");
                            out.println("    if (ptr" + j + " != NULL) {");
                            out.println("        ptr" + j + "->ptr = " + cast + "&arg" + j + ";");
                            out.println("    }");
                        } else if (adapterInfo != null) {
                            out.println("    ptr" + j + " = adapter" + j + ";");
                        } else if (passBy instanceof ByVal && callbackParameterTypes[j] != Pointer.class) {
                            out.println("    ptr" + j + (noException(callbackParameterTypes[j], callbackMethod) ?
                                " = new (std::nothrow) " : " = new ") + valueTypeName + typeName[1] +
                                "(*" + cast + "&arg" + j + ");");
                        } else if (passBy instanceof ByVal || passBy instanceof ByRef) {
                            out.println("    ptr" + j + " = " + cast + "&arg" + j + ";");
                        } else if (passBy instanceof ByPtrPtr) {
                            out.println("    if (arg" + j + " == NULL) {");
                            out.println("        JavaCPP_log(\"Pointer address of argument " + j + " is NULL in callback for " + cls.getCanonicalName() + ".\");");
                            out.println("    } else {");
                            out.println("        ptr" + j + " = " + cast + "*arg" + j + ";");
                            out.println("    }");
                        } else { // ByPtr || ByPtrRef
                            out.println("    ptr" + j + " = " + cast + "arg" + j + ";");
                        }
                    }

                    boolean needInit = false;
                    if (adapterInfo != null) {
                        if (callbackParameterTypes[j] != String.class) {
                            out.println("    jlong size" + j + " = (jlong)adapter" + j + ".size;");
                            out.println("    void* owner" + j + " = adapter" + j + ".owner;");
                            out.println("    void (*deallocator" + j + ")(void*) = &" + adapterInfo.name + "::deallocate;");
                        }
                        needInit = true;
                    } else if ((passBy instanceof ByVal && callbackParameterTypes[j] != Pointer.class) ||
                            FunctionPointer.class.isAssignableFrom(callbackParameterTypes[j])) {
                        out.println("    jlong size" + j + " = 1;");
                        out.println("    void* owner" + j + " = ptr" + j + ";");
                        out.println("    void (*deallocator" + j + ")(void*) = &JavaCPP_" +
                                mangle(callbackParameterTypes[j].getName()) + "_deallocate;");
                        deallocators.index(callbackParameterTypes[j]);
                        needInit = true;
                    }

                    if (Pointer.class.isAssignableFrom(callbackParameterTypes[j])) {
                        String s = "    obj" + j + " = JavaCPP_createPointer(env, " + jclasses.index(callbackParameterTypes[j]) + ");";
                        adapterInfo = adapterInformation(true, valueTypeName, callbackParameterAnnotations[j]);
                        if (adapterInfo != null || passBy instanceof ByPtrPtr || passBy instanceof ByPtrRef) {
                            out.println(s);
                        } else {
                            out.println("    if (ptr" + j + " != NULL) { ");
                            out.println("    " + s);
                            out.println("    }");
                        }
                        out.println("    if (obj" + j + " != NULL) { ");
                        if (needInit) {
                            out.println("        JavaCPP_initPointer(env, obj" + j + ", ptr" + j + ", size" + j + ", owner" + j + ", deallocator" + j + ");");
                        } else {
                            out.println("        env->SetLongField(obj" + j + ", JavaCPP_addressFID, ptr_to_jlong(ptr" + j + "));");
                        }
                        out.println("    }");
                        out.println("    args[" + j + "].l = obj" + j + ";");
                    } else if (callbackParameterTypes[j] == String.class) {
                        passesStrings = true;
                        out.println("    jstring obj" + j + " = JavaCPP_createString(env, (const char*)" + (adapterInfo != null ? "adapter" : "arg") + j + ");");
                        out.println("    args[" + j + "].l = obj" + j + ";");
                    } else if (callbackParameterTypes[j].isArray() &&
                            callbackParameterTypes[j].getComponentType().isPrimitive()) {
                        if (adapterInfo == null) {
                            out.println("    jlong size" + j + " = ptr" + j + " != NULL ? 1 : 0;");
                        }
                        String componentType = callbackParameterTypes[j].getComponentType().getName();
                        String S = Character.toUpperCase(componentType.charAt(0)) + componentType.substring(1);
                        out.println("    if (ptr" + j + " != NULL) {");
                        out.println("        obj" + j + " = env->New" + S + "Array(size" + j + " < INT_MAX ? size" + j + " : INT_MAX);");
                        out.println("        env->Set" + S + "ArrayRegion(obj" + j + ", 0, size" + j + " < INT_MAX ? size" + j + " : INT_MAX, (j" + componentType + "*)ptr" + j + ");");
                        out.println("    }");
                        if (adapterInfo != null) {
                            out.println("    if (deallocator" + j + " != 0 && ptr" + j + " != NULL) {");
                            out.println("        (*(void(*)(void*))jlong_to_ptr(deallocator" + j + "))((void*)ptr" + j + ");");
                            out.println("    }");
                        }
                    } else if (Buffer.class.isAssignableFrom(callbackParameterTypes[j])) {
                        if (adapterInfo == null) {
                            out.println("    jlong size" + j + " = ptr" + j + " != NULL ? 1 : 0;");
                        }
                        out.println("    if (ptr" + j + " != NULL) {");
                        out.println("        jlong sizeptr = size" + j + " * sizeof(ptr" + j + "[0]);");
                        out.println("        obj" + j + " = env->NewDirectByteBuffer((void*)ptr" + j + ", sizeptr < INT_MAX ? sizeptr : INT_MAX);");
                        out.println("    }");
                    } else {
                        logger.warn("Callback \"" + callbackMethod + "\" has unsupported parameter type \"" +
                                callbackParameterTypes[j].getCanonicalName() + "\". Compilation will most likely fail.");
                    }
                }
            }
        }

        if (methodInfo != null) {
            out.println("    if (" + fieldName + " == NULL) {");
            out.println("        " + fieldName + " = JavaCPP_getMethodID(env, " + jclasses.index(cls) + ", \"" + methodInfo.method.getName() + "\", \"(" +
                    signature(methodInfo.method.getParameterTypes()) + ")" + signature(methodInfo.method.getReturnType()) + "\");");
            out.println("    }");
            out.println("    jmethodID mid = " + fieldName + ";");
        } else if (callbackName != null) {
            out.println("    if (obj == NULL) {");
            out.println("        obj = JavaCPP_createPointer(env, " + jclasses.index(cls) + ");");
            out.println("        obj = obj == NULL ? NULL : env->NewGlobalRef(obj);");
            out.println("        if (obj == NULL) {");
            out.println("            JavaCPP_log(\"Error creating global reference of " + cls.getCanonicalName() + " instance for callback.\");");
            out.println("        } else {");
            out.println("            env->SetLongField(obj, JavaCPP_addressFID, ptr_to_jlong(this));");
            out.println("        }");
            out.println("        ptr = &" + callbackName + ";");
            out.println("    }");
            out.println("    if (mid == NULL) {");
            out.println("        mid = JavaCPP_getMethodID(env, " + jclasses.index(cls) + ", \"" + callbackMethod.getName() + "\", \"(" +
                    signature(callbackMethod.getParameterTypes()) + ")" + signature(callbackMethod.getReturnType()) + "\");");
            out.println("    }");
        }
        out.println("    if (env->IsSameObject(obj, NULL)) {");
        out.println("        JavaCPP_log(\"Function pointer object is NULL in callback for " + cls.getCanonicalName() + ".\");");
        out.println("    } else if (mid == NULL) {");
        out.println("        JavaCPP_log(\"Error getting method ID of function caller \\\"" + callbackMethod + "\\\" for callback.\");");
        out.println("    } else {");
        String s = "Object";
        if (callbackReturnType.isPrimitive()) {
            s = callbackReturnType.getName();
            s = Character.toUpperCase(s.charAt(0)) + s.substring(1);
        }
        out.println("        " + returnPrefix + "env->Call" + s + "MethodA(obj, mid, " + (callbackParameterTypes.length == 0 ? "NULL);" : "args);"));
        out.println("        if ((exc = env->ExceptionOccurred()) != NULL) {");
        out.println("            env->ExceptionClear();");
        out.println("        }");
        out.println("    }");

        for (int j = 0; j < callbackParameterTypes.length; j++) {
            if (Pointer.class.isAssignableFrom(callbackParameterTypes[j])) {
                String[] typeName = cppTypeName(callbackParameterTypes[j]);
                Annotation passBy = by(callbackParameterAnnotations[j]);
                String cast = cast(callbackParameterTypes[j], callbackParameterAnnotations[j]);
                String valueTypeName = valueTypeName(typeName);
                AdapterInformation adapterInfo = adapterInformation(true, valueTypeName, callbackParameterAnnotations[j]);

                if ("void*".equals(typeName[0]) && !callbackParameterTypes[j].isAnnotationPresent(Opaque.class)) {
                    typeName[0] = "char*";
                }
                if (adapterInfo != null || passBy instanceof ByPtrPtr || passBy instanceof ByPtrRef) {
                    out.println("    " + typeName[0] + " rptr" + j + typeName[1] + " = (" +
                            typeName[0] + typeName[1] + ")jlong_to_ptr(env->GetLongField(obj" + j + ", JavaCPP_addressFID));");
                    if (adapterInfo != null) {
                        out.println("    jlong rsize" + j + " = env->GetLongField(obj" + j + ", JavaCPP_limitFID);");
                        out.println("    void* rowner" + j + " = JavaCPP_getPointerOwner(env, obj" + j + ");");
                    }
                    if (!callbackParameterTypes[j].isAnnotationPresent(Opaque.class)) {
                        out.println("    jlong rposition" + j + " = env->GetLongField(obj" + j + ", JavaCPP_positionFID);");
                        out.println("    rptr" + j + " += rposition" + j + ";");
                        if (adapterInfo != null) {
                            out.println("    rsize" + j + " -= rposition" + j + ";");
                        }
                    }
                    if (adapterInfo != null) {
                        out.println("    adapter" + j + ".assign(rptr" + j + ", rsize" + j + ", rowner" + j + ");");
                    } else if (passBy instanceof ByPtrPtr) {
                        out.println("    if (arg" + j + " != NULL) {");
                        out.println("        *arg" + j + " = *" + cast + "&rptr" + j + ";");
                        out.println("    }");
                    } else if (passBy instanceof ByPtrRef) {
                        out.println("    arg"  + j + " = " + cast + "rptr" + j + ";");
                    }
                }
            }
            if (!callbackParameterTypes[j].isPrimitive()) {
                out.println("    env->DeleteLocalRef(obj" + j + ");");
            }
        }
        out.println("}");
        out.println("end:");

        if (callbackReturnType != void.class) {
            if ("void*".equals(returnTypeName[0]) && !callbackReturnType.isAnnotationPresent(Opaque.class)) {
                returnTypeName[0] = "char*";
            }
            if (Pointer.class.isAssignableFrom(callbackReturnType)) {
                out.println("    " + returnTypeName[0] + " rptr" + returnTypeName[1] + " = rarg == NULL ? NULL : (" +
                        returnTypeName[0] + returnTypeName[1] + ")jlong_to_ptr(env->GetLongField(rarg, JavaCPP_addressFID));");
                if (returnAdapterInfo != null) {
                    out.println("    jlong rsize = rarg == NULL ? 0 : env->GetLongField(rarg, JavaCPP_limitFID);");
                    out.println("    void* rowner = JavaCPP_getPointerOwner(env, rarg);");
                }
                if (!callbackReturnType.isAnnotationPresent(Opaque.class)) {
                    out.println("    jlong rposition = rarg == NULL ? 0 : env->GetLongField(rarg, JavaCPP_positionFID);");
                    out.println("    rptr += rposition;");
                    if (returnAdapterInfo != null) {
                        out.println("    rsize -= rposition;");
                    }
                }
            } else if (callbackReturnType == String.class) {
                passesStrings = true;
                out.println("    " + returnTypeName[0] + " rptr" + returnTypeName[1] + " = JavaCPP_getStringBytes(env, rarg);");
                if (returnAdapterInfo != null) {
                    out.println("    jlong rsize = 0;");
                    out.println("    void* rowner = (void*)rptr");
                }
            } else if (Buffer.class.isAssignableFrom(callbackReturnType)) {
                out.println("    " + returnTypeName[0] + " rptr" + returnTypeName[1] + " = rarg == NULL ? NULL : env->GetDirectBufferAddress(rarg);");
                if (returnAdapterInfo != null) {
                    out.println("    jlong rsize = rarg == NULL ? 0 : env->GetDirectBufferCapacity(rarg);");
                    out.println("    void* rowner = (void*)rptr;");
                }
            } else if (!callbackReturnType.isPrimitive()) {
                logger.warn("Callback \"" + callbackMethod + "\" has unsupported return type \"" +
                        callbackReturnType.getCanonicalName() + "\". Compilation will most likely fail.");
            }
        }

        out.println("    if (exc != NULL) {");
        out.println("        jstring str = (jstring)env->CallObjectMethod(exc, JavaCPP_toStringMID);");
        out.println("        env->DeleteLocalRef(exc);");
        out.println("        const char *msg = JavaCPP_getStringBytes(env, str);");
        out.println("        JavaCPP_exception e(msg);");
        out.println("        JavaCPP_releaseStringBytes(env, str, msg);");
        out.println("        env->DeleteLocalRef(str);");
        out.println("        JavaCPP_detach(attached);");
        out.println("        throw e;");
        out.println("    } else {");
        out.println("        JavaCPP_detach(attached);");
        out.println("    }");

        if (callbackReturnType != void.class) {
            if (callbackReturnType.isPrimitive()) {
                out.println("    return " + callbackReturnCast + "rarg;");
            } else if (returnAdapterInfo != null) {
                usesAdapters = true;
                out.println("    return " + returnAdapterInfo.name + "(" + callbackReturnCast + "rptr, rsize, rowner);");
            } else if (FunctionPointer.class.isAssignableFrom(callbackReturnType)) {
                functions.index(callbackReturnType);
                out.println("    return " + callbackReturnCast + "(rptr == NULL ? NULL : rptr->ptr);");
            } else if (returnBy instanceof ByVal || returnBy instanceof ByRef) {
                out.println("    if (rptr == NULL) {");
                out.println("        JavaCPP_log(\"Return pointer address is NULL in callback for " + cls.getCanonicalName() + ".\");");
                out.println("        static " + returnConvention[0] + " empty" + returnTypeName[1] + ";");
                out.println("        return empty;");
                out.println("    } else {");
                out.println("        return *" + callbackReturnCast + "rptr;");
                out.println("    }");
            } else if (returnBy instanceof ByPtrPtr) {
                out.println("    return " + callbackReturnCast + "&rptr;");
            } else { // ByPtr || ByPtrRef
                out.println("    return " + callbackReturnCast + "rptr;");
            }
        }
        out.println("}");
    }

    void callbackAllocator(Class cls, String callbackName) {
        // XXX: Here, we should actually allocate new trampolines on the heap somehow...
        // For now it just bumps out from the global variable the last object that called this method
        String[] typeName = cppTypeName(cls);
        String instanceTypeName = functionClassName(cls);
        out.println("    obj = env->NewWeakGlobalRef(obj);");
        out.println("    if (obj == NULL) {");
        out.println("        JavaCPP_log(\"Error creating global reference of " + cls.getCanonicalName() + " instance for callback.\");");
        out.println("        return;");
        out.println("    }");
        out.println("    " + instanceTypeName + "* rptr = new (std::nothrow) " + instanceTypeName + ";");
        out.println("    if (rptr != NULL) {");
        out.println("        rptr->ptr = " + (callbackName == null ? "(" + typeName[0] + typeName[1] + ")jlong_to_ptr(arg0)" : "&" + callbackName) + ";");
        out.println("        rptr->obj = obj;");
        out.println("        JavaCPP_initPointer(env, obj, rptr, 1, rptr, &JavaCPP_" + mangle(cls.getName()) + "_deallocate);");
        deallocators.index(cls);
        if (callbackName != null) {
            out.println("        " + callbackName + "_instance = *rptr;");
        }
        out.println("    }");
        out.println("}");
    }

    boolean checkPlatform(Class<?> cls) {
        // check in priority this class for platform information, before the enclosing class
        Class<?> enclosingClass = Loader.getEnclosingClass(cls);
        while (!cls.isAnnotationPresent(org.bytedeco.javacpp.annotation.Properties.class)
                && !cls.isAnnotationPresent(Platform.class) && cls.getSuperclass() != null) {
            if (enclosingClass != null && cls.getSuperclass() == Object.class) {
                cls = enclosingClass;
                enclosingClass = null;
            } else {
                cls = cls.getSuperclass();
            }
        }

        org.bytedeco.javacpp.annotation.Properties classProperties =
                cls.getAnnotation(org.bytedeco.javacpp.annotation.Properties.class);
        if (classProperties != null) {
            Class[] classes = classProperties.inherit();

            // get default platform names, searching in inherited classes as well
            String[] defaultNames = classProperties.names();
            Deque<Class> queue = new ArrayDeque<Class>(Arrays.asList(classes));
            while (queue.size() > 0 && (defaultNames == null || defaultNames.length == 0)) {
                Class<?> c = queue.removeFirst();
                org.bytedeco.javacpp.annotation.Properties p =
                        c.getAnnotation(org.bytedeco.javacpp.annotation.Properties.class);
                if (p != null) {
                    defaultNames = p.names();
                    queue.addAll(Arrays.asList(p.inherit()));
                }
            }

            // check in priority the platforms inside our properties annotation, before inherited ones
            Platform[] platforms = classProperties.value();
            if (platforms != null) {
                for (Platform p : platforms) {
                    if (checkPlatform(p, defaultNames)) {
                        return true;
                    }
                }
            } else if (classes != null) {
                for (Class c : classes) {
                    if (checkPlatform(c)) {
                        return true;
                    }
                }
            }
        } else if (checkPlatform(cls.getAnnotation(Platform.class), null)) {
            return true;
        }
        return false;
    }

    boolean checkPlatform(Platform platform, String[] defaultNames) {
        if (platform == null) {
            return true;
        }
        if (defaultNames == null) {
            defaultNames = new String[0];
        }
        String platform2 = properties.getProperty("platform");
        String[][] names = { platform.value().length > 0 ? platform.value() : defaultNames, platform.not() };
        boolean[] matches = { false, false };
        for (int i = 0; i < names.length; i++) {
            for (String s : names[i]) {
                if (platform2.startsWith(s)) {
                    matches[i] = true;
                    break;
                }
            }
        }
        if ((names[0].length == 0 || matches[0]) && (names[1].length == 0 || !matches[1])) {
            return true;
        }
        return false;
    }

    static String functionClassName(Class<?> cls) {
        Name name = cls.getAnnotation(Name.class);
        return name != null ? name.value()[0] : "JavaCPP_" + mangle(cls.getName());
    }

    static Method functionMethod(Class<?> cls, boolean[] callbackAllocators) {
        if (!FunctionPointer.class.isAssignableFrom(cls)) {
            return null;
        }
        Method[] methods = cls.getDeclaredMethods();
        Method functionMethod = null;
        for (int i = 0; i < methods.length; i++) {
            String methodName = methods[i].getName();
            int modifiers = methods[i].getModifiers();
            Class[] parameterTypes = methods[i].getParameterTypes();
            Class returnType = methods[i].getReturnType();
            if (Modifier.isStatic(modifiers)) {
                continue;
            }
            if (callbackAllocators != null && methodName.startsWith("allocate") &&
                    Modifier.isNative(modifiers) && returnType == void.class &&
                    (parameterTypes.length == 0 || (parameterTypes.length == 1 &&
                    (parameterTypes[0] == int.class || parameterTypes[0] == long.class)))) {
                // found a callback allocator method
                callbackAllocators[i] = true;
            } else if (methodName.startsWith("call") || methodName.startsWith("apply")) {
                // found a function caller method and/or callback method
                functionMethod = methods[i];
            }
        }
        return functionMethod;
    }

    MethodInformation methodInformation(Method method) {
        MethodInformation info = new MethodInformation();
        info.cls         = method.getDeclaringClass();
        info.method      = method;
        info.annotations = method.getAnnotations();
        info.modifiers   = method.getModifiers();
        info.returnType  = method.getReturnType();
        info.name = method.getName();
        Name name = method.getAnnotation(Name.class);
        info.memberName = name != null ? name.value() : new String[] { info.name };
        Index index = method.getAnnotation(Index.class);
        info.dim    = index != null ? index.value() : 0;
        info.parameterTypes       = method.getParameterTypes();
        info.parameterAnnotations = method.getParameterAnnotations();
        info.returnRaw = method.isAnnotationPresent(Raw.class);
        info.withEnv = info.returnRaw ? method.getAnnotation(Raw.class).withEnv() : false;
        info.parameterRaw = new boolean[info.parameterAnnotations.length];
        for (int i = 0; i < info.parameterAnnotations.length; i++) {
            for (int j = 0; j < info.parameterAnnotations[i].length; j++) {
                if (info.parameterAnnotations[i][j] instanceof Raw) {
                    info.parameterRaw[i] = true;
                    info.withEnv |= ((Raw)info.parameterAnnotations[i][j]).withEnv();
                }
            }
        }

        boolean canBeGetter =  info.returnType != void.class || (info.parameterTypes.length > 0 &&
                info.parameterTypes[0].isArray() && info.parameterTypes[0].getComponentType().isPrimitive());
        boolean canBeSetter = (info.returnType == void.class ||
                info.returnType == info.cls) && info.parameterTypes.length > 0;
        boolean canBeAllocator = !Modifier.isStatic(info.modifiers) && info.returnType == void.class;
        boolean canBeArrayAllocator = canBeAllocator && info.parameterTypes.length == 1 &&
                (info.parameterTypes[0] == int.class || info.parameterTypes[0] == long.class);

        boolean valueGetter = false;
        boolean valueSetter = false;
        boolean memberGetter = false;
        boolean memberSetter = false;
        boolean noReturnGetter = false;
        Method pairedMethod = null;
        for (Method method2 : info.cls.getDeclaredMethods()) {
            MethodInformation info2 = annotationCache.get(method2);
            if (info2 == null) {
                annotationCache.put(method2, info2 = new MethodInformation());
                info2.modifiers            = method2.getModifiers();
                info2.returnType           = method2.getReturnType();
                info2.name                 = method2.getName();
                info2.parameterTypes       = method2.getParameterTypes();
                info2.annotations          = method2.getAnnotations();
                info2.parameterAnnotations = method2.getParameterAnnotations();
            }
            int skipParameters = info.parameterTypes.length > 0 && info.parameterTypes[0] == Class.class ? 1 : 0;
            int skipParameters2 = info2.parameterTypes.length > 0 && info2.parameterTypes[0] == Class.class ? 1 : 0;

            if (method.equals(method2) || !Modifier.isNative(info2.modifiers)) {
                continue;
            }

            boolean canBeValueGetter = false;
            boolean canBeValueSetter = false;
            boolean canBeMemberGetter = false;
            boolean canBeMemberSetter = false;
            if (canBeGetter && "get".equals(info.name) && "put".equals(info2.name)) {
                canBeValueGetter = true;
            } else if (canBeSetter && "put".equals(info.name) && "get".equals(info2.name)) {
                canBeValueSetter = true;
            } else if (info2.name.equals(info.name)) {
                info.overloaded = true;
                canBeMemberGetter = canBeGetter;
                canBeMemberSetter = canBeSetter;
                for (int j = skipParameters; j < info.parameterTypes.length; j++) {
                    if (info.parameterTypes[j] != int.class && info.parameterTypes[j] != long.class) {
                        canBeMemberGetter = false;
                        if (j < info.parameterTypes.length - 1) {
                            canBeMemberSetter = false;
                        }
                    }
                }
            } else {
                continue;
            }

            boolean sameIndexParameters = true;
            for (int j = 0; j < info.parameterTypes.length - skipParameters && j < info2.parameterTypes.length - skipParameters2; j++) {
                if (info.parameterTypes[j + skipParameters] != info2.parameterTypes[j + skipParameters2]) {
                    sameIndexParameters = false;
                }
            }
            if (!sameIndexParameters) {
                continue;
            }

            boolean parameterAsReturn = canBeValueGetter && info.parameterTypes.length > 0 &&
                    info.parameterTypes[0].isArray() && info.parameterTypes[0].getComponentType().isPrimitive();
            boolean parameterAsReturn2 = canBeValueSetter && info2.parameterTypes.length > 0 &&
                    info2.parameterTypes[0].isArray() && info2.parameterTypes[0].getComponentType().isPrimitive();

            if (canBeGetter && info2.parameterTypes.length - (parameterAsReturn ? 0 : 1) == info.parameterTypes.length - skipParameters
                    && (parameterAsReturn ? info.parameterTypes[info.parameterTypes.length - 1] : info.returnType) ==
                        info2.parameterTypes[info2.parameterTypes.length - 1] && (info2.returnType == void.class || info2.returnType == info.cls)
                    && (info2.parameterAnnotations[info2.parameterAnnotations.length - 1].length == 0
                        || (Arrays.equals(info2.parameterAnnotations[info2.parameterAnnotations.length - 1], info.annotations)))) {
                pairedMethod = method2;
                valueGetter  = canBeValueGetter;
                memberGetter = canBeMemberGetter;
                noReturnGetter = parameterAsReturn;
            } else if (canBeSetter && info.parameterTypes.length - (parameterAsReturn2 ? 0 : 1) == info2.parameterTypes.length - skipParameters2
                    && (parameterAsReturn2 ? info2.parameterTypes[info2.parameterTypes.length - 1] : info2.returnType) ==
                        info.parameterTypes[info.parameterTypes.length - 1] && (info.returnType == void.class || info.returnType == info.cls)
                    && (info.parameterAnnotations[info.parameterAnnotations.length - 1].length == 0
                        || (Arrays.equals(info.parameterAnnotations[info.parameterAnnotations.length - 1], info2.annotations)))) {
                pairedMethod = method2;
                valueSetter  = canBeValueSetter;
                memberSetter = canBeMemberSetter;
            }
        }

        Annotation behavior = behavior(info.annotations);
        if (canBeGetter && behavior instanceof ValueGetter) {
            info.valueGetter = true;
            info.noReturnGetter = noReturnGetter;
        } else if (canBeSetter && behavior instanceof ValueSetter) {
            info.valueSetter = true;
        } else if (canBeGetter && behavior instanceof MemberGetter) {
            info.memberGetter = true;
            info.noReturnGetter = noReturnGetter;
        } else if (canBeSetter && behavior instanceof MemberSetter) {
            info.memberSetter = true;
        } else if (canBeAllocator && behavior instanceof Allocator) {
            info.allocator = true;
        } else if (canBeArrayAllocator && behavior instanceof ArrayAllocator) {
            info.allocator = info.arrayAllocator = true;
        } else if (behavior == null) {
            // try to guess the behavior of the method
            if (info.returnType == void.class && "deallocate".equals(info.name) &&
                    !Modifier.isStatic(info.modifiers) && info.parameterTypes.length == 2 &&
                    info.parameterTypes[0] == long.class && info.parameterTypes[1] == long.class) {
                info.deallocator = true;
            } else if (canBeAllocator && "allocate".equals(info.name)) {
                info.allocator = true;
            } else if (canBeArrayAllocator && "allocateArray".equals(info.name)) {
                info.allocator = info.arrayAllocator = true;
            } else if (info.returnType.isAssignableFrom(ByteBuffer.class) && "asDirectBuffer".equals(info.name) &&
                    !Modifier.isStatic(info.modifiers) && info.parameterTypes.length == 0) {
                info.bufferGetter = true;
            } else if (valueGetter) {
                info.valueGetter = true;
                info.noReturnGetter = noReturnGetter;
                info.pairedMethod = pairedMethod;
            } else if (valueSetter) {
                info.valueSetter = true;
                info.pairedMethod = pairedMethod;
            } else if (memberGetter) {
                info.memberGetter = true;
                info.noReturnGetter = noReturnGetter;
                info.pairedMethod = pairedMethod;
            } else if (memberSetter) {
                info.memberSetter = true;
                info.pairedMethod = pairedMethod;
            }
        } else if (!(behavior instanceof Function)) {
            logger.warn("Method \"" + method + "\" cannot behave like a \"" +
                    behavior.annotationType().getSimpleName() + "\". No code will be generated.");
            return null;
        }

        if (name == null && info.pairedMethod != null) {
            name = info.pairedMethod.getAnnotation(Name.class);
            if (name != null) {
                info.memberName = name.value();
            }
        }

        info.noOffset = info.cls.isAnnotationPresent(NoOffset.class) ||
                          method.isAnnotationPresent(NoOffset.class) ||
                          method.isAnnotationPresent(Index.class);
        if (!info.noOffset && info.pairedMethod != null) {
            info.noOffset = info.pairedMethod.isAnnotationPresent(NoOffset.class) ||
                            info.pairedMethod.isAnnotationPresent(Index.class);
        }

        if (info.parameterTypes.length == 0 || !info.parameterTypes[0].isArray()) {
            if (info.valueGetter || info.memberGetter) {
                info.dim = info.parameterTypes.length;
            } else if (info.memberSetter || info.valueSetter) {
                info.dim = info.parameterTypes.length-1;
            }
        }

        info.throwsException = null;
        if (!noException(info.cls, method)) {
            if ((by(info.annotations) instanceof ByVal && !noException(info.returnType, method)) ||
                    !info.deallocator && !info.valueGetter && !info.valueSetter &&
                    !info.memberGetter && !info.memberSetter && !info.bufferGetter) {
                Class<?>[] exceptions = method.getExceptionTypes();
                info.throwsException = exceptions.length > 0 ? exceptions[0] : RuntimeException.class;
            }
        }
        return info;
    }

    static boolean noException(Class<?> cls, Method method) {
        boolean noException = baseClasses.contains(cls) ||
                method.isAnnotationPresent(NoException.class);
        while (!noException && cls != null) {
            if (noException = cls.isAnnotationPresent(NoException.class)) {
                break;
            }
            cls = cls.getDeclaringClass();
        }
        return noException;
    }

    AdapterInformation adapterInformation(boolean out, MethodInformation methodInfo, int j) {
        if (out && (methodInfo.parameterTypes[j] == String.class || methodInfo.valueSetter || methodInfo.memberSetter)) {
            return null;
        }
        String typeName = cast(methodInfo, j);
        if (typeName != null && typeName.startsWith("(") && typeName.endsWith(")")) {
            typeName = typeName.substring(1, typeName.length()-1);
        }
        if (typeName == null || typeName.length() == 0) {
            typeName = cppCastTypeName(methodInfo.parameterTypes[j], methodInfo.parameterAnnotations[j])[0];
        }
        String valueTypeName = valueTypeName(typeName);
        AdapterInformation adapter = adapterInformation(out, valueTypeName, methodInfo.parameterAnnotations[j]);
        if (adapter == null && methodInfo.pairedMethod != null && j == methodInfo.parameterTypes.length - 1 &&
                (methodInfo.valueSetter || methodInfo.memberSetter)) {
            adapter = adapterInformation(out, valueTypeName, methodInfo.pairedMethod.getAnnotations());
        }
        return adapter;
    }

    AdapterInformation adapterInformation(boolean out, String valueTypeName, Annotation ... annotations) {
        AdapterInformation adapterInfo = null;
        boolean constant = false;
        String cast = "";
        for (Annotation a : annotations) {
            Adapter adapter = a instanceof Adapter ? (Adapter)a : a.annotationType().getAnnotation(Adapter.class);
            if (adapter != null) {
                adapterInfo = new AdapterInformation();
                adapterInfo.name = adapter.value();
                adapterInfo.argc = adapter.argc();
                if (a != adapter) {
                    try {
                        Class cls = a.annotationType();
                        if (cls.isAnnotationPresent(Const.class)) {
                            constant = true;
                        }
                        try {
                            String value = cls.getDeclaredMethod("value").invoke(a).toString();
                            if (value != null && value.length() > 0) {
                                valueTypeName = value;
                            }
                            // else use inferred type
                        } catch (NoSuchMethodException e) {
                            // this adapter does not support a template type
                            valueTypeName = null;
                        }
                        Cast c = (Cast)cls.getAnnotation(Cast.class);
                        if (c != null && cast.length() == 0) {
                            cast = c.value()[0];
                            if (valueTypeName != null) {
                                cast += "< " + valueTypeName + " >";
                            }
                            if (c.value().length > 1) {
                                cast += c.value()[1];
                            }
                        }
                    } catch (Exception ex) { 
                        logger.warn("Could not invoke the value() method on annotation \"" + a + "\": " + ex);
                    }
                    if (valueTypeName != null && valueTypeName.length() > 0) {
                        adapterInfo.name += "< " + valueTypeName + " >";
                    }
                }
            } else if (a instanceof Const) {
                constant = true;
            } else if (a instanceof Cast) {
                Cast c = ((Cast)a);
                if (c.value().length > 1) {
                    cast = c.value()[1];
                }
            }
        }
        if (adapterInfo != null) {
            adapterInfo.cast = cast;
            adapterInfo.constant = constant;
        }
        return out && constant ? null : adapterInfo;
    }

    String cast(MethodInformation methodInfo, int j) {
        String cast = cast(methodInfo.parameterTypes[j], methodInfo.parameterAnnotations[j]);
        if ((cast == null || cast.length() == 0) && j == methodInfo.parameterTypes.length-1 &&
                (methodInfo.valueSetter || methodInfo.memberSetter) && methodInfo.pairedMethod != null) {
            cast = cast(methodInfo.pairedMethod.getReturnType(), methodInfo.pairedMethod.getAnnotations());
        }
        return cast;
    }

    String cast(Class<?> type, Annotation ... annotations) {
        String[] typeName = null;
        for (Annotation a : annotations) {
            if ((a instanceof Cast && ((Cast)a).value()[0].length() > 0) || a instanceof Const) {
                typeName = cppCastTypeName(type, annotations);
                break;
            }
        }
        return typeName != null && typeName.length > 0 ? "(" + typeName[0] + typeName[1] + ")" : "";
    }

    Annotation by(MethodInformation methodInfo, int j) {
        Annotation passBy = by(methodInfo.parameterAnnotations[j]);
        if (passBy == null && methodInfo.pairedMethod != null &&
                (methodInfo.valueSetter || methodInfo.memberSetter)) {
            passBy = by(methodInfo.pairedMethod.getAnnotations());
        }
        return passBy;
    }

    Annotation by(Annotation ... annotations) {
        Annotation byAnnotation = null;
        for (Annotation a : annotations) {
            if (a instanceof ByPtr || a instanceof ByPtrPtr || a instanceof ByPtrRef ||
                    a instanceof ByRef || a instanceof ByVal) {
                if (byAnnotation != null) {
                    logger.warn("\"By\" annotation \"" + byAnnotation +
                            "\" already found. Ignoring superfluous annotation \"" + a + "\".");
                } else {
                    byAnnotation = a;
                }
            }
        }
        return byAnnotation;
    }

    Annotation behavior(Annotation ... annotations) {
        Annotation behaviorAnnotation = null;
        for (Annotation a : annotations) {
            if (a instanceof Function || a instanceof Allocator || a instanceof ArrayAllocator ||
                    a instanceof ValueSetter || a instanceof ValueGetter ||
                    a instanceof MemberGetter || a instanceof MemberSetter) {
                if (behaviorAnnotation != null) {
                    logger.warn("Behavior annotation \"" + behaviorAnnotation +
                            "\" already found. Ignoring superfluous annotation \"" + a + "\".");
                } else {
                    behaviorAnnotation = a;
                }
            }
        }
        return behaviorAnnotation;
    }

    static String constValueTypeName(String ... typeName) {
        String type = typeName[0];
        if (type.endsWith("*") || type.endsWith("&")) {
            type = type.substring(0, type.length()-1);
        }
        return type;
    }

    static String valueTypeName(String ... typeName) {
        String type = typeName[0];
        if (type.startsWith("const ")) {
            type = type.substring(6, type.length()-1);
        } else if (type.endsWith("*") || type.endsWith("&")) {
            type = type.substring(0, type.length()-1);
        }
        return type;
    }

    String[] cppAnnotationTypeName(Class<?> type, Annotation ... annotations) {
        String[] typeName = cppCastTypeName(type, annotations);
        String prefix = typeName[0];
        String suffix = typeName[1];

        boolean casted = false;
        for (Annotation a : annotations) {
            if ((a instanceof Cast && ((Cast)a).value()[0].length() > 0) || a instanceof Const) {
                casted = true;
                break;
            }
        }

        Annotation by = by(annotations);
        if (by instanceof ByVal) {
            prefix = constValueTypeName(typeName);
        } else if (by instanceof ByRef) {
            prefix = constValueTypeName(typeName) + "&";
        } else if (by instanceof ByPtrPtr && !casted) {
            prefix = prefix + "*";
        } else if (by instanceof ByPtrRef) {
            prefix = prefix + "&";
        } // else ByPtr

        typeName[0] = prefix;
        typeName[1] = suffix;
        return typeName;
    }

    String[] cppCastTypeName(Class<?> type, Annotation ... annotations) {
        String[] typeName = null;
        boolean warning = false, adapter = false;
        for (Annotation a : annotations) {
            if (a instanceof Cast) {
                warning = typeName != null;
                String prefix = ((Cast)a).value()[0], suffix = "";
                int parenthesis = prefix.indexOf(')');
                if (parenthesis > 0) {
                    suffix = prefix.substring(parenthesis).trim();
                    prefix = prefix.substring(0, parenthesis).trim();
                }
                typeName = prefix.length() > 0 ? new String[] { prefix, suffix } : null;
            } else if (a instanceof Const) {
                if (warning = typeName != null) {
                    // prioritize @Cast
                    continue;
                }
                typeName = cppTypeName(type);
                boolean[] b = ((Const)a).value();
                if (b.length > 1 && b[1]) {
                    typeName[0] = valueTypeName(typeName) + " const *";
                }
                if (b.length > 0 && b[0]) {
                    typeName[0] = "const " + typeName[0];
                }
                Annotation by = by(annotations);
                if (by instanceof ByPtrPtr) {
                    typeName[0] += "*";
                } else if (by instanceof ByPtrRef) {
                    typeName[0] += "&";
                }
            } else if (a instanceof Adapter || a.annotationType().isAnnotationPresent(Adapter.class)) {
                adapter = true;
            }
        }
        if (warning && !adapter) {
            logger.warn("Without \"Adapter\", \"Cast\" and \"Const\" annotations are mutually exclusive.");
        }
        if (typeName == null) {
            typeName = cppTypeName(type);
        }
        return typeName;
    }

    String[] cppTypeName(Class<?> type) {
        String prefix = "", suffix = "";
        if (type == Buffer.class || type == Pointer.class) {
            prefix = "void*";
        } else if (type == byte[].class || type == ByteBuffer.class || type == BytePointer.class) {
            prefix = "signed char*";
        } else if (type == short[].class || type == ShortBuffer.class || type == ShortPointer.class) {
            prefix = "short*";
        } else if (type == int[].class || type == IntBuffer.class || type == IntPointer.class) {
            prefix = "int*";
        } else if (type == long[].class || type == LongBuffer.class || type == LongPointer.class) {
            prefix = "jlong*";
        } else if (type == float[].class || type == FloatBuffer.class || type == FloatPointer.class) {
            prefix = "float*";
        } else if (type == double[].class || type == DoubleBuffer.class || type == DoublePointer.class) {
            prefix = "double*";
        } else if (type == char[].class || type == CharBuffer.class || type == CharPointer.class) {
            prefix = "unsigned short*";
        } else if (type == boolean[].class) {
            prefix = "unsigned char*";
        } else if (type == PointerPointer.class) {
            prefix = "void**";
        } else if (type == String.class) {
            prefix = "const char*";
        } else if (type == byte.class) {
            prefix = "signed char";
        } else if (type == long.class) {
            prefix = "jlong";
        } else if (type == char.class) {
            prefix = "unsigned short";
        } else if (type == boolean.class) {
            prefix = "unsigned char";
        } else if (type.isPrimitive()) {
            prefix = type.getName();
        } else if (FunctionPointer.class.isAssignableFrom(type)) {
            Method functionMethod = functionMethod(type, null);
            if (functionMethod != null) {
                return cppFunctionTypeName(functionMethod);
            }
        } else {
            String scopedType = cppScopeName(type);
            if (scopedType.length() > 0) {
                prefix = scopedType + "*";
            } else {
                logger.warn("The class " + type.getCanonicalName() +
                        " does not map to any C++ type. Compilation will most likely fail.");
            }
        }
        return new String[] { prefix, suffix };
    }

    String[] cppFunctionTypeName(Method functionMethod) {
        String prefix, suffix;
        Class<?> type = functionMethod.getDeclaringClass();
        Convention convention = type.getAnnotation(Convention.class);
        String callingConvention = convention == null ? "" : convention.value() + " ";
        // for virtual functions, the namespace is managed by the enclosing class
        Namespace namespace = FunctionPointer.class.isAssignableFrom(type) ? type.getAnnotation(Namespace.class) : null;
        String spaceName = namespace == null ? "" : namespace.value();
        if (spaceName.length() > 0 && !spaceName.endsWith("::")) {
            spaceName += "::";
        }
        Class returnType = functionMethod.getReturnType();
        Class[] parameterTypes = functionMethod.getParameterTypes();
        Annotation[] annotations = functionMethod.getAnnotations();
        Annotation[][] parameterAnnotations = functionMethod.getParameterAnnotations();
        String[] returnTypeName = cppAnnotationTypeName(returnType, annotations);
        AdapterInformation returnAdapterInfo = adapterInformation(false, valueTypeName(returnTypeName), annotations);
        if (returnAdapterInfo != null && returnAdapterInfo.cast.length() > 0) {
            prefix = returnAdapterInfo.cast;
        } else {
            prefix = returnTypeName[0] + returnTypeName[1];
        }
        prefix += " (" + callingConvention + spaceName + "*";
        suffix = ")(";
        if (FunctionPointer.class.isAssignableFrom(type) && namespace != null
                && (parameterTypes.length == 0 || !Pointer.class.isAssignableFrom(parameterTypes[0]))) {
            logger.warn("First parameter of caller method call() or apply() for member function pointer " +
                    type.getCanonicalName() + " is not a Pointer. Compilation will most likely fail.");
        }
        for (int j = namespace == null ? 0 : 1; j < parameterTypes.length; j++) {
            String[] paramTypeName = cppAnnotationTypeName(parameterTypes[j], parameterAnnotations[j]);
            AdapterInformation paramAdapterInfo = adapterInformation(false, valueTypeName(paramTypeName), parameterAnnotations[j]);
            if (paramAdapterInfo != null && paramAdapterInfo.cast.length() > 0) {
                suffix += paramAdapterInfo.cast + " arg" + j;
            } else {
                suffix += paramTypeName[0] + " arg" + j + paramTypeName[1];
            }
            if (j < parameterTypes.length - 1) {
                suffix += ", ";
            }
        }
        suffix += ")";
        if (type.isAnnotationPresent(Const.class)) {
            suffix += " const";
        }
        return new String[] { prefix, suffix };
    }

    static String cppScopeName(MethodInformation methodInfo) {
        String scopeName = cppScopeName(methodInfo.cls);
        if (methodInfo.method.isAnnotationPresent(Virtual.class)) {
            String subType = "JavaCPP_" + mangle(scopeName);
            scopeName = subType;
        }
        Namespace namespace = methodInfo.method.getAnnotation(Namespace.class);
        String spaceName = namespace == null ? "" : namespace.value();
        if ((namespace != null && namespace.value().length() == 0) || spaceName.startsWith("::")) {
            scopeName = ""; // user wants to reset namespace here
        }
        if (scopeName.length() > 0 && !scopeName.endsWith("::")) {
            scopeName += "::";
        }
        scopeName += spaceName;
        if (spaceName.length() > 0 && !spaceName.endsWith("::")) {
            scopeName += "::";
        }
        return scopeName + methodInfo.memberName[0];
    }

    static String cppScopeName(Class<?> type) {
        String scopeName = "";
        while (type != null) {
            Namespace namespace = type.getAnnotation(Namespace.class);
            String spaceName = namespace == null ? "" : namespace.value();
            if (Pointer.class.isAssignableFrom(type) && (!baseClasses.contains(type)
                    || type.isAnnotationPresent(Name.class))) {
                Name name = type.getAnnotation(Name.class);
                String s;
                if (name == null) {
                    s = type.getName();
                    int i = s.lastIndexOf("$");
                    if (i < 0) {
                        i = s.lastIndexOf(".");
                    }
                    s = s.substring(i+1);
                } else {
                    s = name.value()[0];
                }
                if (spaceName.length() > 0 && !spaceName.endsWith("::")) {
                    spaceName += "::";
                }
                spaceName += s;
            }
            if (scopeName.length() > 0 && !spaceName.endsWith("::")) {
                spaceName += "::";
            }
            scopeName = spaceName + scopeName;
            if ((namespace != null && namespace.value().length() == 0) || spaceName.startsWith("::")) {
                // user wants to reset namespace here
                break;
            }
            type = type.getDeclaringClass();
        }
        return scopeName;
    }

    static String jniTypeName(Class type) {
        if (type == byte.class) {
            return "jbyte";
        } else if (type == short.class) {
            return "jshort";
        } else if (type == int.class) {
            return "jint";
        } else if (type == long.class) {
            return "jlong";
        } else if (type == float.class) {
            return "jfloat";
        } else if (type == double.class) {
            return "jdouble";
        } else if (type == char.class) {
            return "jchar";
        } else if (type == boolean.class) {
            return "jboolean";
        } else if (type == byte[].class) {
            return "jbyteArray";
        } else if (type == short[].class) {
            return "jshortArray";
        } else if (type == int[].class) {
            return "jintArray";
        } else if (type == long[].class) {
            return "jlongArray";
        } else if (type == float[].class) {
            return "jfloatArray";
        } else if (type == double[].class) {
            return "jdoubleArray";
        } else if (type == char[].class) {
            return "jcharArray";
        } else if (type == boolean[].class) {
            return "jbooleanArray";
        } else if (type.isArray()) {
            return "jobjectArray";
        } else if (type == String.class) {
            return "jstring";
        } else if (type == Class.class) {
            return "jclass";
        } else if (type == void.class) {
            return "void";
        } else {
            return "jobject";
        }
    }

    static String signature(Class ... types) {
        StringBuilder signature = new StringBuilder(2*types.length);
        for (Class type : types) {
            if (type == byte.class) {
                signature.append("B");
            } else if (type == short.class) {
                signature.append("S");
            } else if (type == int.class) {
                signature.append("I");
            } else if (type == long.class) {
                signature.append("J");
            } else if (type == float.class) {
                signature.append("F");
            } else if (type == double.class) {
                signature.append("D");
            } else if (type == boolean.class) {
                signature.append("Z");
            } else if (type == char.class) {
                signature.append("C");
            } else if (type == void.class) {
                signature.append("V");
            } else if (type.isArray()) {
                signature.append(type.getName().replace('.', '/'));
            } else {
                signature.append("L").append(type.getName().replace('.', '/')).append(";");
            }
        }
        return signature.toString();
    }

    static String mangle(String name) {
        StringBuilder mangledName = new StringBuilder(2*name.length());
        for (int i = 0; i < name.length(); i++) {
            char c = name.charAt(i);
            if ((c >= '0' && c <= '9') || (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z')) {
                mangledName.append(c);
            } else if (c == '_') {
                mangledName.append("_1");
            } else if (c == ';') {
                mangledName.append("_2");
            } else if (c == '[') {
                mangledName.append("_3");
            } else if (c == '.' || c == '/') {
                mangledName.append("_");
            } else {
                String code = Integer.toHexString(c);
                mangledName.append("_0");
                switch (code.length()) {
                    case 1:  mangledName.append("0");
                    case 2:  mangledName.append("0");
                    case 3:  mangledName.append("0");
                    default: mangledName.append(code);
                }
            }
        }
        return mangledName.toString();
    }
}
