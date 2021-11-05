include $(top_srcdir)/build/modmake.rulesam
MODNAME=mod_opusfile

mod_LTLIBRARIES = mod_opusfile.la
mod_opusfile_la_SOURCES  = mod_opusfile.c
mod_opusfile_la_CFLAGS   = $(AM_CFLAGS)
mod_opusfile_la_LIBADD   = $(switch_builddir)/libfreeswitch.la
mod_opusfile_la_LDFLAGS  = -avoid-version -module -no-undefined -shared

if HAVE_OPUSFILE_DECODE
mod_opusfile_la_CFLAGS += $(OPUSFILE_DECODE_CFLAGS)
mod_opusfile_la_LIBADD += $(OPUSFILE_DECODE_LIBS)
endif

if HAVE_OPUSFILE_ENCODE
mod_opusfile_la_CFLAGS += $(OPUSFILE_ENCODE_CFLAGS) -DHAVE_OPUSFILE_ENCODE
mod_opusfile_la_LIBADD += $(OPUSFILE_ENCODE_LIBS)
endif

