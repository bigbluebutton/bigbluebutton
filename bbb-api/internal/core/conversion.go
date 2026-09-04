package core

import "strconv"

// GetInt32OrDefaultValue attempts to parse the input string
// into an int32 and return the parsed value. If parsing fails
// the function will fallback to the given default value instead.
func GetInt32OrDefaultValue(param string, defaultValue int32) int32 {
	if param != "" {
		conv, err := strconv.ParseInt(param, 10, 32)
		if err != nil {
			return defaultValue
		} else {
			return int32(conv)
		}
	}
	return defaultValue
}

// GetInt64OrDefaultValue attempts to parse the input string
// into an int64 and return the parsed value. If parsing fails
// the function will fallback to the given default value instead.
func GetInt64OrDefaultValue(param string, defaultValue int64) int64 {
	if param != "" {
		conv, err := strconv.ParseInt(param, 10, 64)
		if err != nil {
			return defaultValue
		} else {
			return conv
		}
	}
	return defaultValue
}

// GetBoolOrDefaultValue attempts to parse the input string
// into an bool and return the parsed value. If parsing fails
// the function will fallback to the given default value instead.
func GetBoolOrDefaultValue(param string, defaultValue bool) bool {
	if param != "" {
		conv, err := strconv.ParseBool(param)
		if err != nil {
			return defaultValue
		} else {
			return conv
		}
	}
	return defaultValue
}

// GetStringOrDefaultValue returns the given param if it is
// non-empty. Otherwise, the provided default value is returned.
func GetStringOrDefaultValue(param string, defaultValue string) string {
	if param != "" {
		return param
	}
	return defaultValue
}
