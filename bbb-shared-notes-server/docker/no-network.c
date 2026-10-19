/*
 * no-network — run a command without network access.
 *
 * Usage: no-network [--write DIR]... <command> [args …]
 *
 * The container replacement of run-in-systemd.sh runs the PDF converter through this program,
 * in place of the PrivateNetwork=true, IPAddressDeny=any and ReadWritePaths= properties of the
 * bare-metal unit. It restricts itself and then executes the command; the restrictions are
 * inherited by every process the command starts and cannot be removed. Setting them up needs
 * no privileges (PR_SET_NO_NEW_PRIVS first), so it works under any UID, with a read-only root
 * file system, with Docker's and Kubernetes' default seccomp profiles (RuntimeDefault) and
 * without capabilities.
 *
 * 1. Landlock, if the kernel offers it (best effort: without Landlock, or where the engine's
 *    seccomp profile does not allow its system calls, this layer is skipped):
 *    - files and directories can be created, written, truncated, renamed or removed only below
 *      the --write directories (and /dev/null written); everything stays readable
 *    - processes outside the command's own processes cannot be traced or have their memory
 *      opened (/proc/<pid>/mem), whatever the host's ptrace policy (Yama)
 *    - from Landlock ABI 4: no TCP bind or connect; from ABI 6: no signals to, and no abstract
 *      UNIX sockets of, other processes
 *    Once the kernel reports Landlock, any error in setting it up stops the command.
 * 2. seccomp (always; the guarantee for the network), denied with EACCES or EPERM:
 *    socket()            every address family: no socket can be created, so no connection to any
 *                        address, loopback included, and no name resolution
 *    io_uring_setup()    io_uring can create and connect sockets without socket()
 *    pidfd_getfd(), ptrace(), process_vm_readv(), process_vm_writev()
 *                        taking a socket from, or running code in, another process of the user
 *    any system call of another ABI (i386, x32), which the filter's numbers do not cover
 *    socketpair() stays allowed: it creates a connected pair within the process, nothing else
 *    can reach it.
 *
 * If a restriction cannot be set up, the command is not run (exit status 126).
 */
#define _GNU_SOURCE
#include <errno.h>
#include <fcntl.h>
#include <linux/audit.h>
#include <linux/filter.h>
#include <linux/seccomp.h>
#include <linux/types.h>
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <sys/prctl.h>
#include <sys/syscall.h>
#include <unistd.h>

#if defined(__x86_64__)
#define NATIVE_ARCH AUDIT_ARCH_X86_64
#elif defined(__aarch64__)
#define NATIVE_ARCH AUDIT_ARCH_AARCH64
#else
#error "no-network: unsupported architecture"
#endif

/* Landlock UAPI (linux/landlock.h), defined here so that older kernel headers build it too. The
 * system call numbers are the same on every architecture. */
#ifndef __NR_landlock_create_ruleset
#define __NR_landlock_create_ruleset 444
#define __NR_landlock_add_rule 445
#define __NR_landlock_restrict_self 446
#endif
#define LL_CREATE_RULESET_VERSION (1U << 0)
#define LL_RULE_PATH_BENEATH 1
#define LL_FS_WRITE_FILE (1ULL << 1)
#define LL_FS_REMOVE_DIR (1ULL << 4)
#define LL_FS_REMOVE_FILE (1ULL << 5)
#define LL_FS_MAKE_CHAR (1ULL << 6)
#define LL_FS_MAKE_DIR (1ULL << 7)
#define LL_FS_MAKE_REG (1ULL << 8)
#define LL_FS_MAKE_SOCK (1ULL << 9)
#define LL_FS_MAKE_FIFO (1ULL << 10)
#define LL_FS_MAKE_BLOCK (1ULL << 11)
#define LL_FS_MAKE_SYM (1ULL << 12)
#define LL_FS_REFER (1ULL << 13)      /* ABI 2 */
#define LL_FS_TRUNCATE (1ULL << 14)   /* ABI 3 */
#define LL_NET_BIND_TCP (1ULL << 0)   /* ABI 4 */
#define LL_NET_CONNECT_TCP (1ULL << 1)
#define LL_SCOPE_ABSTRACT_UNIX_SOCKET (1ULL << 0) /* ABI 6 */
#define LL_SCOPE_SIGNAL (1ULL << 1)

struct ll_ruleset_attr {
    __u64 handled_access_fs;
    __u64 handled_access_net;
    __u64 scoped;
};

struct ll_path_beneath_attr {
    __u64 allowed_access;
    __s32 parent_fd;
} __attribute__((packed));

#define MAX_WRITE_DIRS 8

static int fail(const char *what)
{
    fprintf(stderr, "no-network: %s: %s\n", what, strerror(errno));
    return 126;
}

/* Returns 0 when Landlock is in force or not available, 126 on an error. */
static int restrict_landlock(char **dirs, int ndirs)
{
    struct ll_ruleset_attr attr = { 0 };
    size_t attr_size = sizeof(attr.handled_access_fs);
    long abi = syscall(__NR_landlock_create_ruleset, NULL, 0, LL_CREATE_RULESET_VERSION);
    int ruleset, i;

    if (abi < 1)
        return 0; /* ENOSYS, EOPNOTSUPP (disabled), or blocked by the engine's seccomp profile */

    attr.handled_access_fs = LL_FS_WRITE_FILE | LL_FS_REMOVE_DIR | LL_FS_REMOVE_FILE
        | LL_FS_MAKE_CHAR | LL_FS_MAKE_DIR | LL_FS_MAKE_REG | LL_FS_MAKE_SOCK | LL_FS_MAKE_FIFO
        | LL_FS_MAKE_BLOCK | LL_FS_MAKE_SYM;
    if (abi >= 2)
        attr.handled_access_fs |= LL_FS_REFER;
    if (abi >= 3)
        attr.handled_access_fs |= LL_FS_TRUNCATE;
    if (abi >= 4) {
        attr.handled_access_net = LL_NET_BIND_TCP | LL_NET_CONNECT_TCP;
        attr_size = offsetof(struct ll_ruleset_attr, scoped);
    }
    if (abi >= 6) {
        attr.scoped = LL_SCOPE_ABSTRACT_UNIX_SOCKET | LL_SCOPE_SIGNAL;
        attr_size = sizeof(attr);
    }

    ruleset = (int)syscall(__NR_landlock_create_ruleset, &attr, attr_size, 0U);
    if (ruleset < 0)
        return fail("landlock_create_ruleset");
    for (i = 0; i < ndirs; i++) {
        struct ll_path_beneath_attr rule = {
            .allowed_access = attr.handled_access_fs,
            .parent_fd = open(dirs[i], O_PATH | O_DIRECTORY | O_CLOEXEC),
        };
        if (rule.parent_fd < 0)
            return fail(dirs[i]);
        if (syscall(__NR_landlock_add_rule, ruleset, LL_RULE_PATH_BENEATH, &rule, 0U) != 0)
            return fail("landlock_add_rule");
        close(rule.parent_fd);
    }
    {
        /* /dev/null stays writable, as /dev is in the bare-metal unit (ProtectSystem=strict) */
        struct ll_path_beneath_attr rule = {
            .allowed_access = LL_FS_WRITE_FILE | (abi >= 3 ? LL_FS_TRUNCATE : 0),
            .parent_fd = open("/dev/null", O_PATH | O_CLOEXEC),
        };
        if (rule.parent_fd < 0)
            return fail("/dev/null");
        if (syscall(__NR_landlock_add_rule, ruleset, LL_RULE_PATH_BENEATH, &rule, 0U) != 0)
            return fail("landlock_add_rule /dev/null");
        close(rule.parent_fd);
    }
    if (syscall(__NR_landlock_restrict_self, ruleset, 0U) != 0)
        return fail("landlock_restrict_self");
    close(ruleset);
    return 0;
}

#define DENY(nr, err) \
    BPF_JUMP(BPF_JMP | BPF_JEQ | BPF_K, (nr), 0, 1), \
    BPF_STMT(BPF_RET | BPF_K, SECCOMP_RET_ERRNO | ((err) & SECCOMP_RET_DATA))

int main(int argc, char *argv[])
{
    struct sock_filter filter[] = {
        BPF_STMT(BPF_LD | BPF_W | BPF_ABS, offsetof(struct seccomp_data, arch)),
        BPF_JUMP(BPF_JMP | BPF_JEQ | BPF_K, NATIVE_ARCH, 1, 0),
        BPF_STMT(BPF_RET | BPF_K, SECCOMP_RET_ERRNO | EPERM),
        BPF_STMT(BPF_LD | BPF_W | BPF_ABS, offsetof(struct seccomp_data, nr)),
#if defined(__x86_64__)
        /* x32 system calls share the arch value and set this bit in the number */
        BPF_JUMP(BPF_JMP | BPF_JGE | BPF_K, 0x40000000, 0, 1),
        BPF_STMT(BPF_RET | BPF_K, SECCOMP_RET_ERRNO | EPERM),
#endif
        DENY(__NR_socket, EACCES),
        DENY(__NR_io_uring_setup, EPERM),
        DENY(__NR_pidfd_getfd, EPERM),
        DENY(__NR_ptrace, EPERM),
        DENY(__NR_process_vm_readv, EPERM),
        DENY(__NR_process_vm_writev, EPERM),
        BPF_STMT(BPF_RET | BPF_K, SECCOMP_RET_ALLOW),
    };
    struct sock_fprog prog = {
        .len = (unsigned short)(sizeof(filter) / sizeof(filter[0])),
        .filter = filter,
    };
    char *dirs[MAX_WRITE_DIRS];
    int ndirs = 0, cmd = 1, rc;

    while (cmd + 1 < argc && strcmp(argv[cmd], "--write") == 0) {
        if (ndirs == MAX_WRITE_DIRS) {
            fprintf(stderr, "no-network: at most %d --write directories\n", MAX_WRITE_DIRS);
            return 2;
        }
        dirs[ndirs++] = argv[cmd + 1];
        cmd += 2;
    }
    if (cmd >= argc || strcmp(argv[cmd], "--write") == 0) {
        fprintf(stderr, "Usage: %s [--write DIR]... <command> [args …]\n", argv[0]);
        return 2;
    }
    if (prctl(PR_SET_NO_NEW_PRIVS, 1, 0, 0, 0) != 0)
        return fail("PR_SET_NO_NEW_PRIVS");
    rc = restrict_landlock(dirs, ndirs);
    if (rc != 0)
        return rc;
    if (prctl(PR_SET_SECCOMP, SECCOMP_MODE_FILTER, &prog, 0, 0) != 0)
        return fail("cannot install the seccomp filter");
    execvp(argv[cmd], &argv[cmd]);
    fprintf(stderr, "no-network: %s: %s\n", argv[cmd], strerror(errno));
    return errno == ENOENT ? 127 : 126;
}
