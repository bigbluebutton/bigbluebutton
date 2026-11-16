#!/usr/bin/env python3
"""Guard: the user list must be multiplexed per meeting, never per user.

Hasura groups live-query subscribers into cohorts by the session variables that
the permissions of every table touched by the query reference. If any of them
references a per-user variable (X-Hasura-UserId, X-Hasura-LockedUserId, ...),
each connected user becomes its own cohort and Hasura re-runs the whole query
once per user on every poll: the user list cost becomes O(users) per poll,
O(users^2) per meeting.

This script walks the `bbb_client` select permissions of `v_user` (the
`user` root field used by Patched_UserListSubscription, RaisedHandUsers,
AudioOnlyUsers, GridUsers, ...), of every table that can be selected through
its relationships at any depth (`user { cameras { voice } }`), and of every
table referenced inside those filters (relationship paths and `_exists`), and
fails if any filter uses a session variable outside MEETING_SCOPED_VARS.

Own-row data ("the current user can always see their own X") must be served
through `user_current` and its dedicated `v_user_current_*` views instead.
"""
import glob
import os
import sys

import yaml

ROOT_TABLE = "v_user"
ROLE = "bbb_client"
# Variables whose value is the same for every subscriber of a meeting
# (or depends only on role / lock state), so they never split cohorts per user.
MEETING_SCOPED_VARS = {
    "x-hasura-meetingid",
    "x-hasura-notlockedinmeeting",
    "x-hasura-moderatorinmeeting",
    "x-hasura-presenterinmeeting",
}
BOOL_OPS = {"_and", "_or", "_not"}
# Relationships, as (table, relationship), that are inherently own-row only and that NO
# user-root subscription may select. They are skipped here but listed on every run so
# they are never forgotten. Do not add entries to make this check pass: move the data to
# user_current instead.
SKIPPED_RELATIONSHIPS = {
    ("v_user", "connectionStatus"): "self-only (userId + sessionToken); use user_current.connectionStatus",
}
# Relationships, as (table, relationship), whose target permission is checked but whose
# own relationships are not followed. Same rule: listed on every run, and no user-root
# subscription may select anything below them.
NOT_FOLLOWED_RELATIONSHIPS = {
    ("v_user", "meeting"): "v_meeting leads to per-user data (polls...); use the meeting root field",
}

here = os.path.dirname(os.path.abspath(__file__))
tables_dir = os.path.join(here, "..", "metadata", "databases", "BigBlueButton", "tables")


def load_tables():
    tables = {}
    for path in glob.glob(os.path.join(tables_dir, "public_*.yaml")):
        with open(path) as f:
            doc = yaml.safe_load(f)
        if not isinstance(doc, dict) or "table" not in doc:
            continue
        rels = {}
        for kind in ("object_relationships", "array_relationships"):
            for rel in doc.get(kind) or []:
                using = rel.get("using", {})
                remote = using.get("manual_configuration", {}).get("remote_table")
                if remote is None and isinstance(using.get("foreign_key_constraint_on"), dict):
                    remote = using["foreign_key_constraint_on"].get("table")
                # None: the target could not be resolved (e.g. foreign_key_constraint_on
                # given as a column name). It is reported if the relationship is reachable.
                rels[rel["name"]] = remote["name"] if isinstance(remote, dict) else None
        filt = None
        for perm in doc.get("select_permissions") or []:
            if perm.get("role") == ROLE:
                filt = perm.get("permission", {}).get("filter", {})
        tables[doc["table"]["name"]] = {"file": os.path.basename(path), "rels": rels, "filter": filt}
    return tables


def scan_filter(node, table, tables, out_vars, out_tables):
    """Collect session variables and referenced tables from a boolean expression."""
    if isinstance(node, list):
        for item in node:
            scan_filter(item, table, tables, out_vars, out_tables)
        return
    if isinstance(node, str):
        if node.lower().startswith("x-hasura-"):
            out_vars.add(node)
        return
    if not isinstance(node, dict):
        return
    for key, value in node.items():
        if key in BOOL_OPS:
            scan_filter(value, table, tables, out_vars, out_tables)
        elif key == "_exists":
            target = value.get("_table", {}).get("name")
            if target:
                out_tables.add(target)
            # the _where is evaluated against the _exists table
            scan_filter(value.get("_where", {}), target, tables, out_vars, out_tables)
        elif table in tables and tables[table]["rels"].get(key):
            remote = tables[table]["rels"][key]
            out_tables.add(remote)
            scan_filter(value, remote, tables, out_vars, out_tables)
        else:
            # column comparison: {"_eq": "X-Hasura-..."} etc.
            scan_filter(value, table, tables, out_vars, out_tables)


def main():
    tables = load_tables()
    if ROOT_TABLE not in tables:
        print(f"ERROR: {ROOT_TABLE} metadata not found in {tables_dir}")
        return 2

    # (table, follow): follow=True for tables that can be selected (v_user and everything
    # below its relationships, at any depth), so their relationships are walked too.
    # Tables only referenced inside a filter are checked, but nothing is selected from them.
    pending = [(ROOT_TABLE, True)]
    seen, followed, violations, unresolved = set(), set(), [], []
    while pending:
        name, follow = pending.pop()
        info = tables.get(name)
        if name not in seen:
            seen.add(name)
            if info is not None and info["filter"] is not None:
                found_vars, ref_tables = set(), set()
                scan_filter(info["filter"], name, tables, found_vars, ref_tables)
                bad = sorted(v for v in found_vars if v.lower() not in MEETING_SCOPED_VARS)
                if bad:
                    violations.append((name, info["file"], bad))
                pending.extend((ref, False) for ref in ref_tables)
        # a table without a permission for ROLE cannot be selected: nothing below it either
        if not follow or name in followed or info is None or info["filter"] is None:
            continue
        followed.add(name)
        for rel, remote in info["rels"].items():
            if (name, rel) in SKIPPED_RELATIONSHIPS:
                continue
            if remote is None:
                unresolved.append((name, rel, info["file"]))
                continue
            pending.append((remote, (name, rel) not in NOT_FOLLOWED_RELATIONSHIPS))

    for (table, rel), why in SKIPPED_RELATIONSHIPS.items():
        print(f"NOTE: {table}.{rel} is not checked ({why}); never select it in a user-root subscription.")
    for (table, rel), why in NOT_FOLLOWED_RELATIONSHIPS.items():
        print(f"NOTE: relationships below {table}.{rel} are not checked ({why}); never select them in a user-root subscription.")
    print(f"Checked {len(seen)} tables reachable from {ROOT_TABLE} ({ROLE}): {', '.join(sorted(seen))}")
    if unresolved:
        print()
        print("ERROR: cannot resolve the target table of relationships reachable from the user list.")
        print("Declare them with manual_configuration so their permission can be checked.")
        for table, rel, fname in unresolved:
            print(f"  - {table}.{rel} ({fname})")
        if not violations:
            return 1
    if violations:
        print()
        print("ERROR: per-user session variables found in permissions reachable from the user list.")
        print("Every connected user becomes a separate Hasura cohort and the user list query is")
        print("re-executed once per user on every poll. Serve own-row data through user_current")
        print("(v_user_current_* views) instead.")
        for name, fname, bad in violations:
            print(f"  - {name} ({fname}): {', '.join(bad)}")
        return 1
    print("OK: the user list stays multiplexed per meeting.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
