# The Tier 1 stack: make -C env <target>. See the README, "Tier 1".
SHELL := /bin/sh
TIER1 := $(CURDIR)/tier1
STATE := $(CURDIR)/.state
export DEBS_DIR ?= $(STATE)/debs

.PHONY: debs

# Build the five debs the stack runs, from a snapshot of the tree.
# PKGS=bbb-web rebuilds just that one.
debs:
	$(TIER1)/build-debs.sh $(PKGS)
