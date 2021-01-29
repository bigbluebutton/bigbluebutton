/*
 * 2012|lloyd|http://wtfpl.org
 */

#include <string>

namespace mw_util {
    // given a size in bytes, return a human readable representation of the
    // string
    std::string niceSize(int bytes);

    // given a delta in seconds, return a human redable representation
    std::string niceDelta(int seconds);
};


