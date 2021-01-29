/*
 * 2012|lloyd|http://wtfpl.org
 */

#ifndef __HEADDIFF_H
#define __HEADDIFF_H

#include <v8.h>
#include <v8-profiler.h>
#include <node.h>
#include <nan.h>

namespace heapdiff
{
    class HeapDiff : public Nan::ObjectWrap
    {
      public:
        static void Initialize ( v8::Handle<v8::Object> target );

        static NAN_METHOD(New);
        static NAN_METHOD(End);
        static bool InProgress();

      protected:
        HeapDiff();
        ~HeapDiff();
      private:
        const v8::HeapSnapshot * before;
        const v8::HeapSnapshot * after;
        bool ended;
    };
};

#endif
