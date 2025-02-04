package util

import "strconv"

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

func GetStringOrDefaultValue(param string, defaultValue string) string {
	if param != "" {
		return param
	}
	return defaultValue
}
