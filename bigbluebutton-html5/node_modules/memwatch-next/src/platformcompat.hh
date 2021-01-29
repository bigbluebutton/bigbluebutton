#ifndef __PLATFORMCOMPAT_H
#define __PLATFORMCOMPAT_H

#if defined(_MSC_VER)
#include <float.h> //isinf, isnan
#include <stdlib.h> //min
#define ISINF _finite
#define ISNAN _isnan
#define FMIN __min
#define ROUND(x) floor(x + 0.5)
#else
#include <cmath> // round(), isinf, isnan
#define ISINF std::isinf
#define ISNAN std::isnan
#define FMIN fmin
#define ROUND round
#endif

#endif
