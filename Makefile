
# Makefile to build a Debian repository in directory REPOSITORY.
#
# We can also trigger a build of a single package with 'make PACKAGE_bbb-html5' (for example)
#
# If REPOSITORY isn't specified as a make option, the default is
# $(DISTRO)-$(COMMIT), where $(DISTRO) is either focal or bionic and
# $(COMMIT) is the first six characters of the current git commit.
#
# All package builds are done using docker.  This Makefile expects the
# build scripts to leave the .deb packages in the "artifacts"
# directory.
#
# The repository by default is unsigned, but 'make sign' will
# sign the repository with the current users's default GPG key.
#
# The BUILD_TYPE variable is passed on to the docker build scripts.
#
# BUILD_TYPE=release is the sensible alternative.
#
# Requirements: docker and reprepro; gpg for signing
#
# sudo access is required to run docker

export BUILD_TYPE

# These are the list of packages that we'll build

TARGETS := $(shell basename -a $(shell dirname build/packages-template/*/build.sh))

# Placeholders are shell scripts that are run to create subdirectories, typically by running a git checkout.

PLACEHOLDERS := $(shell echo *.placeholder.sh | sed 's/.placeholder.sh//g')

# The current commit's hash (used for the name of the repository) and date (used for the package names)
COMMIT := $(shell git rev-parse HEAD | cut -c 1-6)
COMMIT_DATE := $(shell git log -n1 --pretty='format:%cd' --date=format:'%Y%m%dT%H%M%S')

# The BigBlueButton version number
VERSION_NUMBER := $(shell cat "bigbluebutton-config/bigbluebutton-release" | cut -d '=' -f2 | cut -d "-" -f1)

# Ubuntu distribution, currently bionic for BigBlueButton 2.4 and focal for BigBlueButton 2.5 and 2.6
DISTRO := $(shell if echo $(VERSION_NUMBER) | grep -q 2\\.4; then echo bionic; else echo focal; fi)

# Package repository codename
CODENAME := bigbluebutton-$(DISTRO)

# The directory in which we'll build the Debian package repository
REPOSITORY ?= $(DISTRO)-$(COMMIT)

$(REPOSITORY)::
	@if ! which reprepro >/dev/null; then echo apt install reprepro is required; exit 1; fi

# PACKAGE_$(pkg) contains the package filename with wildcards NOT expanded
#
# The point is to trigger a build when the file doesn't exist, even
# though all we know is its wildcard pattern

ifeq ($(BUILD_TYPE),release)
   PACKAGE_LABEL=$(VERSION_NUMBER)
else
   PACKAGE_LABEL=$(COMMIT_DATE)
endif

define makerule =
  PACKAGE_$1 = artifacts/$1_*$(PACKAGE_LABEL)*.deb
  $$(PACKAGE_$1):
	./build/setup.sh $1
  .PHONY: $1
  $1: $$(PACKAGE_$1)
endef

$(foreach pkg,${TARGETS},$(eval $(call makerule,$(pkg))))

# PACKAGES is the list of packages with wildcards NOT expanded

PACKAGES=$(foreach pkg,${TARGETS},$(PACKAGE_$(pkg)))

$(REPOSITORY)/conf/distributions:
	mkdir -p $(REPOSITORY)/conf/
	echo Codename: $(CODENAME)  > $(REPOSITORY)/conf/distributions
	echo Architectures: amd64  >> $(REPOSITORY)/conf/distributions
	echo Components: main      >> $(REPOSITORY)/conf/distributions

$(REPOSITORY):: $(REPOSITORY)/conf/distributions

# reprepro won't overwrite an existing package in the repository, so when updating,
# remove the packages first and just ignore any errors that occur

$(REPOSITORY):: $(PACKAGES)
	reprepro -b $(REPOSITORY) remove $(CODENAME) $(shell basename -a $? | sed 's/_[^ ]*//g')
	reprepro -b $(REPOSITORY) includedeb $(CODENAME) $?
	touch $(REPOSITORY)

# It's not clear which placeholders need to be created to be any given package, so depend
# all of the packages on all of the placeholders.
#
# Some of the placeholder directory names are also package names, so something like
# 'make bbb-etherpad' is ambiguous.  We resolve the ambiguity by declaring the target
# to build the package .PHONY (see 'makerule' above), which means it always gets
# run, and using another .PHONY target to make sure all of the placeholders
# have been created by mimicing the logic make is supposed to use (sigh).

.PHONY: placeholders
$(PACKAGES): placeholders

placeholders:
	for ph in $(PLACEHOLDERS); do if [ ! $$ph -nt $$ph.placeholder.sh ]; then echo rm -rf $$ph; echo ./$$ph.placeholder.sh; fi; done | bash -x

# Download the third party packages tar file, but only if it's been updated on the Internet.
# Untar any files in it that are missing from the repository.
# If any files were untared, call reprepro to update the repository package files.
#
# double-colon rules always get run, even if the target already exists
# wget --timestamping only downloads the file if it's newer
#
# The cleanest way to include the 3rd-part-packages would be to extract the tar file
# to a temporary directory, then call "reprepro includedeb" on all of the package
# files therein.  I've found that I can extract the tar file directly into the
# repository directory and call "reprepro includedeb" on the packages there,
# avoiding the need for a temp directory.
#
# Listing which files tar extracted: https://unix.stackexchange.com/a/503174/37949
# Accepted answers suggests the use of a temp file and "find -cnewer"
#
# Setting a make variable in a rule: https://stackoverflow.com/a/1909390/1493790
#
# It's difficult to set a make variable to the output of the find command,
# due to variable expansion order: https://stackoverflow.com/a/58410600/1493790

EXTRA_PACKAGES_TAR := cache-3rd-part-packages.tar

$(REPOSITORY)::
	$(eval MYTMP := $(shell mktemp))
	wget --timestamping http://ci.bbbvm.imdt.com.br/cache-3rd-part-packages.tar
	mkdir -p $(REPOSITORY)/pool/main
	tar -f $(EXTRA_PACKAGES_TAR) -C $(REPOSITORY)/pool/main -x --skip-old-files
	if find $(REPOSITORY)/pool/main -type f -cnewer $(MYTMP) | grep .; then \
	    reprepro -b $(REPOSITORY) includedeb $(CODENAME) $$(find $(REPOSITORY)/pool/main -type f -cnewer $(MYTMP)); \
	fi
	rm $(MYTMP)

# Repository signing

sign: $(REPOSITORY) $(REPOSITORY)/dists/$(CODENAME)/Release.gpg

$(REPOSITORY)/dists/$(CODENAME)/Release.gpg: $(REPOSITORY)/dists/$(CODENAME)/Release
	gpg --armor --detach-sign --output $(REPOSITORY)/dists/$(CODENAME)/Release.gpg $(REPOSITORY)/dists/$(CODENAME)/Release
