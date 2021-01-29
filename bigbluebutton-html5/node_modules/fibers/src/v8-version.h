// These macros weren't added until v8 version 4.4
#ifndef V8_MAJOR_VERSION
	#if NODE_MODULE_VERSION <= 11
		#define V8_MAJOR_VERSION 3
		#define V8_MINOR_VERSION 14
	#elif V8_MAJOR_VERSION <= 14
		#define V8_MAJOR_VERSION 3
		#define V8_MINOR_VERSION 28
	#else
		#error v8 version macros missing
	#endif
#endif

#define V8_AT_LEAST(major, minor) (V8_MAJOR_VERSION > major || (V8_MAJOR_VERSION == major && V8_MINOR_VERSION >= minor))
