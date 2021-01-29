/*
 * 2012|lloyd|http://wtfpl.org
 */

#include "platformcompat.hh"
#include "memwatch.hh"
#include "heapdiff.hh"
#include "util.hh"

#include <node.h>
#include <node_version.h>

#include <string>
#include <cstring>
#include <sstream>

#include <math.h> // for pow
#include <time.h> // for time

using namespace v8;
using namespace node;

Handle<Object> g_context;
Nan::Callback *g_cb;

struct Baton {
    uv_work_t req;
    size_t heapUsage;
    GCType type;
    GCCallbackFlags flags;
};

static const unsigned int RECENT_PERIOD = 10;
static const unsigned int ANCIENT_PERIOD = 120;

static struct
{
    // counts of different types of gc events
    unsigned int gc_full;
    unsigned int gc_inc;
    unsigned int gc_compact;

    // last base heap size as measured *right* after GC
    unsigned int last_base;

    // the estimated "base memory" usage of the javascript heap
    // over the RECENT_PERIOD number of GC runs
    unsigned int base_recent;

    // the estimated "base memory" usage of the javascript heap
    // over the ANCIENT_PERIOD number of GC runs
    unsigned int base_ancient;

    // the most extreme values we've seen for base heap size
    unsigned int base_max;
    unsigned int base_min;

    // leak detection!

    // the period from which this leak analysis starts
    time_t leak_time_start;
    // the base memory for the detection period
    time_t leak_base_start;
    // the number of consecutive compactions for which we've grown
    unsigned int consecutive_growth;
} s_stats;

static Local<Value> getLeakReport(size_t heapUsage)
{
    Nan::EscapableHandleScope scope;

    size_t growth = heapUsage - s_stats.leak_base_start;
    int now = time(NULL);
    int delta = now - s_stats.leak_time_start;

    Local<Object> leakReport = Nan::New<v8::Object>();
    //leakReport->Set(Nan::New("start").ToLocalChecked(), NODE_UNIXTIME_V8(s_stats.leak_time_start));
    //leakReport->Set(Nan::New("end").ToLocalChecked(), NODE_UNIXTIME_V8(now));
    leakReport->Set(Nan::New("growth").ToLocalChecked(), Nan::New<v8::Number>(growth));

    std::stringstream ss;
    ss << "heap growth over 5 consecutive GCs ("
       << mw_util::niceDelta(delta) << ") - "
       << mw_util::niceSize(growth / ((double) delta / (60.0 * 60.0))) << "/hr";

    leakReport->Set(Nan::New("reason").ToLocalChecked(), Nan::New(ss.str().c_str()).ToLocalChecked());

    return scope.Escape(leakReport);
}

static void AsyncMemwatchAfter(uv_work_t* request) {
    Nan::HandleScope scope;

    Baton * b = (Baton *) request->data;

    // do the math in C++, permanent
    // record the type of GC event that occured
    if (b->type == kGCTypeMarkSweepCompact) s_stats.gc_full++;
    else s_stats.gc_inc++;

    if (
#if NODE_VERSION_AT_LEAST(0,8,0)
        b->type == kGCTypeMarkSweepCompact
#else
        b->flags == kGCCallbackFlagCompacted
#endif
        ) {
        // leak detection code.  has the heap usage grown?
        if (s_stats.last_base < b->heapUsage) {
            if (s_stats.consecutive_growth == 0) {
                s_stats.leak_time_start = time(NULL);
                s_stats.leak_base_start = b->heapUsage;
            }

            s_stats.consecutive_growth++;

            // consecutive growth over 5 GCs suggests a leak
            if (s_stats.consecutive_growth >= 5) {
                // reset to zero
                s_stats.consecutive_growth = 0;

                // emit a leak report!
                Local<Value> argv[3];
                argv[0] = Nan::New<v8::Boolean>(false);
                // the type of event to emit
                argv[1] = Nan::New("leak").ToLocalChecked();
                argv[2] = getLeakReport(b->heapUsage);
                g_cb->Call(3, argv);
            }
        } else {
            s_stats.consecutive_growth = 0;
        }

        // update last_base
        s_stats.last_base = b->heapUsage;

        // update compaction count
        s_stats.gc_compact++;

        // the first ten compactions we'll use a different algorithm to
        // dampen out wider memory fluctuation at startup
        if (s_stats.gc_compact < RECENT_PERIOD) {
            double decay = pow(s_stats.gc_compact / RECENT_PERIOD, 2.5);
            decay *= s_stats.gc_compact;
            if (ISINF(decay) || ISNAN(decay)) decay = 0;
            s_stats.base_recent = ((s_stats.base_recent * decay) +
                                   s_stats.last_base) / (decay + 1);

            decay = pow(s_stats.gc_compact / RECENT_PERIOD, 2.4);
            decay *= s_stats.gc_compact;
            s_stats.base_ancient = ((s_stats.base_ancient * decay) +
                                    s_stats.last_base) /  (1 + decay);

        } else {
            s_stats.base_recent = ((s_stats.base_recent * (RECENT_PERIOD - 1)) +
                                   s_stats.last_base) / RECENT_PERIOD;
            double decay = FMIN(ANCIENT_PERIOD, s_stats.gc_compact);
            s_stats.base_ancient = ((s_stats.base_ancient * (decay - 1)) +
                                    s_stats.last_base) / decay;
        }

        // only record min/max after 3 gcs to let initial instability settle
        if (s_stats.gc_compact >= 3) {
            if (!s_stats.base_min || s_stats.base_min > s_stats.last_base) {
                s_stats.base_min = s_stats.last_base;
            }

            if (!s_stats.base_max || s_stats.base_max < s_stats.last_base) {
                s_stats.base_max = s_stats.last_base;
            }
        }

        // if there are any listeners, it's time to emit!
        if (!g_cb->IsEmpty()) {
            Local<Value> argv[3];
            // magic argument to indicate to the callback all we want to know is whether there are
            // listeners (here we don't)
            argv[0] = Nan::New<v8::Boolean>(true);

            //Handle<Value> haveListeners = g_cb->call(1, argv);


            double ut= 0.0;
            if (s_stats.base_ancient) {
                ut = (double) ROUND(((double) (s_stats.base_recent - s_stats.base_ancient) /
                                      (double) s_stats.base_ancient) * 1000.0) / 10.0;
            }

            // ok, there are listeners, we actually must serialize and emit this stats event
            Local<Object> stats = Nan::New<v8::Object>();
            stats->Set(Nan::New("num_full_gc").ToLocalChecked(), Nan::New(s_stats.gc_full));
            stats->Set(Nan::New("num_inc_gc").ToLocalChecked(), Nan::New(s_stats.gc_inc));
            stats->Set(Nan::New("heap_compactions").ToLocalChecked(), Nan::New(s_stats.gc_compact));
            stats->Set(Nan::New("usage_trend").ToLocalChecked(), Nan::New(ut));
            stats->Set(Nan::New("estimated_base").ToLocalChecked(), Nan::New(s_stats.base_recent));
            stats->Set(Nan::New("current_base").ToLocalChecked(), Nan::New(s_stats.last_base));
            stats->Set(Nan::New("min").ToLocalChecked(), Nan::New(s_stats.base_min));
            stats->Set(Nan::New("max").ToLocalChecked(), Nan::New(s_stats.base_max));
            argv[0] = Nan::New<v8::Boolean>(false);
            // the type of event to emit
            argv[1] = Nan::New("stats").ToLocalChecked();
            argv[2] = stats;
            g_cb->Call(3, argv);
        }
    }

    delete b;
}

static void noop_work_func(uv_work_t *) { }

void memwatch::after_gc(GCType type, GCCallbackFlags flags)
{
    if (heapdiff::HeapDiff::InProgress()) return;

    Nan::HandleScope scope;

    Baton * baton = new Baton;
    v8::HeapStatistics hs;

    Nan::GetHeapStatistics(&hs);

    baton->heapUsage = hs.used_heap_size();
    baton->type = type;
    baton->flags = flags;
    baton->req.data = (void *) baton;

    // schedule our work to run in a moment, once gc has fully completed.
    //
    // here we pass a noop work function to work around a flaw in libuv,
    // uv_queue_work on unix works fine, but will will crash on
    // windows.  see: https://github.com/joyent/libuv/pull/629
    uv_queue_work(uv_default_loop(), &(baton->req),
		  noop_work_func, (uv_after_work_cb)AsyncMemwatchAfter);
}

NAN_METHOD(memwatch::upon_gc) {
    Nan::HandleScope scope;
    if (info.Length() >= 1 && info[0]->IsFunction()) {
        g_cb = new Nan::Callback(info[0].As<v8::Function>());
    }
    info.GetReturnValue().Set(Nan::Undefined());
}

NAN_METHOD(memwatch::trigger_gc) {
    Nan::HandleScope scope;
    int deadline_in_ms = 500;
    if (info.Length() >= 1 && info[0]->IsNumber()) {
    		deadline_in_ms = (int)(info[0]->Int32Value()); 
    }
#if (NODE_MODULE_VERSION >= 0x002D)
    Nan::IdleNotification(deadline_in_ms);
    Nan::LowMemoryNotification();
#else
    while(!Nan::IdleNotification(deadline_in_ms)) {};
    Nan::LowMemoryNotification();
#endif
    info.GetReturnValue().Set(Nan::Undefined());
}
