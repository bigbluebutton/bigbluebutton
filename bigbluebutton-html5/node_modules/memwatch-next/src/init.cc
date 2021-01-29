/*
 * 2012|lloyd|do what the fuck you want to
 */

#include <v8.h>
#include <node.h>

#include "heapdiff.hh"
#include "memwatch.hh"

extern "C" {
    void init (v8::Handle<v8::Object> target)
    {
        Nan::HandleScope scope;
        heapdiff::HeapDiff::Initialize(target);

        Nan::SetMethod(target, "upon_gc", memwatch::upon_gc);
        Nan::SetMethod(target, "gc", memwatch::trigger_gc);

        v8::V8::AddGCEpilogueCallback(memwatch::after_gc);
    }

    NODE_MODULE(memwatch, init);
};
