/*
 * 2012|lloyd|http://wtfpl.org
 */

#ifndef __MEMWATCH_HH
#define __MEMWATCH_HH

#include <node.h>
#include <nan.h>

namespace memwatch
{
    NAN_METHOD(upon_gc);
    NAN_METHOD(trigger_gc);
    void after_gc(v8::GCType type, v8::GCCallbackFlags flags);
};

#endif
