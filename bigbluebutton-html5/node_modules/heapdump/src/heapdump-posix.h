// Copyright (c) 2012, Ben Noordhuis <info@bnoordhuis.nl>
//
// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.
//
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
// ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
// ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
// OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

#ifndef SRC_HEAPDUMP_POSIX_H_
#define SRC_HEAPDUMP_POSIX_H_

#include <assert.h>
#include <signal.h>

namespace {

static char snapshot_filename[kMaxPath];
static uv_signal_t signal_handle;

inline void OnSIGUSR2(uv_signal_t* handle, int signo) {
  assert(handle == &signal_handle);
  v8::Isolate* isolate = reinterpret_cast<v8::Isolate*>(handle->data);
  RandomSnapshotFilename(snapshot_filename, sizeof(snapshot_filename));
  WriteSnapshot(isolate, snapshot_filename);
}

inline void PlatformInit(v8::Isolate* isolate, int flags) {
  const bool nosignal = !(flags & kSignalFlag);
  if (nosignal == false) {
    uv_signal_init(uv_default_loop(), &signal_handle);
    uv_signal_start(&signal_handle, OnSIGUSR2, SIGUSR2);
    uv_unref(reinterpret_cast<uv_handle_t*>(&signal_handle));
    signal_handle.data = isolate;
  }
}

}  // namespace anonymous

#endif  // SRC_HEAPDUMP_POSIX_H_
