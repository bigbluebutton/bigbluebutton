/*
 * 2012|lloyd|http://wtfpl.org
 */
#include <map>
#include <string>
#include <set>
#include <vector>

#include <stdlib.h> // abs()
#include <time.h>   // time()

#include "heapdiff.hh"
#include "util.hh"

using namespace v8;
using namespace node;
using namespace std;

static bool s_inProgress = false;
static time_t s_startTime;

bool heapdiff::HeapDiff::InProgress()
{
    return s_inProgress;
}

heapdiff::HeapDiff::HeapDiff() : ObjectWrap(), before(NULL), after(NULL),
                                 ended(false)
{
}

heapdiff::HeapDiff::~HeapDiff()
{
    if (before) {
        ((HeapSnapshot *) before)->Delete();
        before = NULL;
    }

    if (after) {
        ((HeapSnapshot *) after)->Delete();
        after = NULL;
    }
}

void
heapdiff::HeapDiff::Initialize ( v8::Handle<v8::Object> target )
{
    Nan::HandleScope scope;

    v8::Local<v8::FunctionTemplate> t = Nan::New<v8::FunctionTemplate>(New);
    t->InstanceTemplate()->SetInternalFieldCount(1);
    t->SetClassName(Nan::New<v8::String>("HeapDiff").ToLocalChecked());

    Nan::SetPrototypeMethod(t, "end", End);

    target->Set(Nan::New<v8::String>("HeapDiff").ToLocalChecked(), t->GetFunction());
}

NAN_METHOD(heapdiff::HeapDiff::New)
{
    // Don't blow up when the caller says "new require('memwatch').HeapDiff()"
    // issue #30
    // stolen from: https://github.com/kkaefer/node-cpp-modules/commit/bd9432026affafd8450ecfd9b49b7dc647b6d348
    if (!info.IsConstructCall()) {
        return Nan::ThrowTypeError("Use the new operator to create instances of this object.");
    }

    Nan::HandleScope scope;

    // allocate the underlying c++ class and wrap it up in the this pointer
    HeapDiff * self = new HeapDiff();
    self->Wrap(info.This());

    // take a snapshot and save a pointer to it
    s_inProgress = true;
    s_startTime = time(NULL);

#if (NODE_MODULE_VERSION >= 0x002D)
    self->before = v8::Isolate::GetCurrent()->GetHeapProfiler()->TakeHeapSnapshot(NULL);
#else
#if (NODE_MODULE_VERSION > 0x000B)
    self->before = v8::Isolate::GetCurrent()->GetHeapProfiler()->TakeHeapSnapshot(Nan::New<v8::String>("").ToLocalChecked(), NULL);
#else
    self->before = v8::HeapProfiler::TakeSnapshot(Nan::New<v8::String>("").ToLocalChecked(), HeapSnapshot::kFull, NULL);
#endif
#endif

    s_inProgress = false;

    info.GetReturnValue().Set(info.This());
}

static string handleToStr(const Handle<Value> & str)
{
	String::Utf8Value utfString(str->ToString());
	return *utfString;
}

static void
buildIDSet(set<uint64_t> * seen, const HeapGraphNode* cur, int & s)
{
    Nan::HandleScope scope;

    // cycle detection
    if (seen->find(cur->GetId()) != seen->end()) {
        return;
    }
    // always ignore HeapDiff related memory
    if (cur->GetType() == HeapGraphNode::kObject &&
        handleToStr(cur->GetName()).compare("HeapDiff") == 0)
    {
        return;
    }

    // update memory usage as we go
#if (NODE_MODULE_VERSION >= 0x002D)
    s += cur->GetShallowSize();
#else
    s += cur->GetSelfSize();
#endif
    seen->insert(cur->GetId());

    for (int i=0; i < cur->GetChildrenCount(); i++) {
        buildIDSet(seen, cur->GetChild(i)->GetToNode(), s);
    }
}

typedef set<uint64_t> idset;

// why doesn't STL work?
// XXX: improve this algorithm
void setDiff(idset a, idset b, vector<uint64_t> &c)
{
    for (idset::iterator i = a.begin(); i != a.end(); i++) {
        if (b.find(*i) == b.end()) c.push_back(*i);
    }
}


class example
{
public:
    HeapGraphEdge::Type context;
    HeapGraphNode::Type type;
    std::string name;
    std::string value;
    std::string heap_value;
    int self_size;
    int retained_size;
    int retainers;

    example() : context(HeapGraphEdge::kHidden),
                type(HeapGraphNode::kHidden),
                self_size(0), retained_size(0), retainers(0) { };
};

class change
{
public:
    long int size;
    long int added;
    long int released;
    std::vector<example> examples;

    change() : size(0), added(0), released(0) { }
};

typedef std::map<std::string, change>changeset;

static void manageChange(changeset & changes, const HeapGraphNode * node, bool added)
{
    std::string type;

    switch(node->GetType()) {
        case HeapGraphNode::kArray:
            type.append("Array");
            break;
        case HeapGraphNode::kString:
            type.append("String");
            break;
        case HeapGraphNode::kObject:
            type.append(handleToStr(node->GetName()));
            break;
        case HeapGraphNode::kCode:
            type.append("Code");
            break;
        case HeapGraphNode::kClosure:
            type.append("Closure");
            break;
        case HeapGraphNode::kRegExp:
            type.append("RegExp");
            break;
        case HeapGraphNode::kHeapNumber:
            type.append("Number");
            break;
        case HeapGraphNode::kNative:
            type.append("Native");
            break;
        case HeapGraphNode::kHidden:
        default:
            return;
    }

    if (changes.find(type) == changes.end()) {
        changes[type] = change();
    }

    changeset::iterator i = changes.find(type);

#if (NODE_MODULE_VERSION >= 0x002D)
    i->second.size += node->GetShallowSize() * (added ? 1 : -1);
#else
    i->second.size += node->GetSelfSize() * (added ? 1 : -1);
#endif
    if (added) i->second.added++;
    else i->second.released++;

    // XXX: example

    return;
}

static Handle<Value> changesetToObject(changeset & changes)
{
    Nan::EscapableHandleScope scope;
    Local<Array> a = Nan::New<v8::Array>();

    for (changeset::iterator i = changes.begin(); i != changes.end(); i++) {
        Local<Object> d = Nan::New<v8::Object>();
        d->Set(Nan::New("what").ToLocalChecked(), Nan::New(i->first.c_str()).ToLocalChecked());
        d->Set(Nan::New("size_bytes").ToLocalChecked(), Nan::New<v8::Number>(i->second.size));
        d->Set(Nan::New("size").ToLocalChecked(), Nan::New(mw_util::niceSize(i->second.size).c_str()).ToLocalChecked());
        d->Set(Nan::New("+").ToLocalChecked(), Nan::New<v8::Number>(i->second.added));
        d->Set(Nan::New("-").ToLocalChecked(), Nan::New<v8::Number>(i->second.released));
        a->Set(a->Length(), d);
    }

    return scope.Escape(a);
}


static v8::Local<Value>
compare(const v8::HeapSnapshot * before, const v8::HeapSnapshot * after)
{
    Nan::EscapableHandleScope scope;
    int s, diffBytes;

    Local<Object> o = Nan::New<v8::Object>();

    // first let's append summary information
    Local<Object> b = Nan::New<v8::Object>();
    b->Set(Nan::New("nodes").ToLocalChecked(), Nan::New(before->GetNodesCount()));
    //b->Set(Nan::New("time"), s_startTime);
    o->Set(Nan::New("before").ToLocalChecked(), b);

    Local<Object> a = Nan::New<v8::Object>();
    a->Set(Nan::New("nodes").ToLocalChecked(), Nan::New(after->GetNodesCount()));
    //a->Set(Nan::New("time"), time(NULL));
    o->Set(Nan::New("after").ToLocalChecked(), a);

    // now let's get allocations by name
    set<uint64_t> beforeIDs, afterIDs;
    s = 0;
    buildIDSet(&beforeIDs, before->GetRoot(), s);
    b->Set(Nan::New("size_bytes").ToLocalChecked(), Nan::New(s));
    b->Set(Nan::New("size").ToLocalChecked(), Nan::New(mw_util::niceSize(s).c_str()).ToLocalChecked());

    diffBytes = s;
    s = 0;
    buildIDSet(&afterIDs, after->GetRoot(), s);
    a->Set(Nan::New("size_bytes").ToLocalChecked(), Nan::New(s));
    a->Set(Nan::New("size").ToLocalChecked(), Nan::New(mw_util::niceSize(s).c_str()).ToLocalChecked());

    diffBytes = s - diffBytes;

    Local<Object> c = Nan::New<v8::Object>();
    c->Set(Nan::New("size_bytes").ToLocalChecked(), Nan::New(diffBytes));
    c->Set(Nan::New("size").ToLocalChecked(), Nan::New(mw_util::niceSize(diffBytes).c_str()).ToLocalChecked());
    o->Set(Nan::New("change").ToLocalChecked(), c);

    // before - after will reveal nodes released (memory freed)
    vector<uint64_t> changedIDs;
    setDiff(beforeIDs, afterIDs, changedIDs);
    c->Set(Nan::New("freed_nodes").ToLocalChecked(), Nan::New<v8::Number>(changedIDs.size()));

    // here's where we'll collect all the summary information
    changeset changes;

    // for each of these nodes, let's aggregate the change information
    for (unsigned long i = 0; i < changedIDs.size(); i++) {
        const HeapGraphNode * n = before->GetNodeById(changedIDs[i]);
        manageChange(changes, n, false);
    }

    changedIDs.clear();

    // after - before will reveal nodes added (memory allocated)
    setDiff(afterIDs, beforeIDs, changedIDs);

    c->Set(Nan::New("allocated_nodes").ToLocalChecked(), Nan::New<v8::Number>(changedIDs.size()));

    for (unsigned long i = 0; i < changedIDs.size(); i++) {
        const HeapGraphNode * n = after->GetNodeById(changedIDs[i]);
        manageChange(changes, n, true);
    }

    c->Set(Nan::New("details").ToLocalChecked(), changesetToObject(changes));

    return scope.Escape(o);
}

NAN_METHOD(heapdiff::HeapDiff::End)
{
    // take another snapshot and compare them
    Nan::HandleScope scope;

    HeapDiff *t = Unwrap<HeapDiff>( info.This() );

    // How shall we deal with double .end()ing?  The only reasonable
    // approach seems to be an exception, cause nothing else makes
    // sense.
    if (t->ended) {
        return Nan::ThrowError("attempt to end() a HeapDiff that was already ended");
    }
    t->ended = true;

    s_inProgress = true;
#if (NODE_MODULE_VERSION >= 0x002D)
    t->after = v8::Isolate::GetCurrent()->GetHeapProfiler()->TakeHeapSnapshot(NULL);
#else
#if (NODE_MODULE_VERSION > 0x000B)
    t->after = v8::Isolate::GetCurrent()->GetHeapProfiler()->TakeHeapSnapshot(Nan::New<v8::String>("").ToLocalChecked(), NULL);
#else
    t->after = v8::HeapProfiler::TakeSnapshot(Nan::New<v8::String>("").ToLocalChecked(), HeapSnapshot::kFull, NULL);
#endif
#endif
    s_inProgress = false;

    v8::Local<Value> comparison = compare(t->before, t->after);
    // free early, free often.  I mean, after all, this process we're in is
    // probably having memory problems.  We want to help her.
    ((HeapSnapshot *) t->before)->Delete();
    t->before = NULL;
    ((HeapSnapshot *) t->after)->Delete();
    t->after = NULL;

    info.GetReturnValue().Set(comparison);
}
