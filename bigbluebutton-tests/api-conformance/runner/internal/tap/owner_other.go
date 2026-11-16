//go:build !unix

package tap

import "io/fs"

// owner returns the user and group that own a file; there are none here.
func owner(fs.FileInfo) (uid, gid int, ok bool) { return 0, 0, false }
