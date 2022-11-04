
# Makefile to build a Debian repository in directory REPOSITORY.
#
# If REPOSITORY isn't specified as a make option, the default is
# $(DISTRO)-$(COMMIT), where $(DISTRO) is either focal or bionic and
# $(COMMIT) is the first six characters of the current git commit.
#
# All package builds are done using docker.  This Makefile expects the
# build scripts to leave the .deb packages in the "artifacts"
# directory.
#
# The repository by default is unsigned, but the SIGNWITH variable,
# if present, is passed to reprepro via a config file.
#
# SIGNWITH=yes signs with the current user's default GPG key.
#
# The BUILD_TYPE variable is passed on to the docker build scripts.
#
# BUILD_TYPE=release is the sensible alternative.
#
# Requirements: docker and reprepro
#
# sudo access is required to run docker

export BUILD_TYPE

# These are the list of packages that we'll build

TARGETS := bbb-apps-akka bbb-config bbb-etherpad bbb-freeswitch-core bbb-freeswitch-sounds bbb-fsesl-akka bbb-html5 bbb-learning-dashboard bbb-libreoffice-docker bbb-mkclean bbb-pads bbb-playback bbb-playback-notes bbb-playback-podcast bbb-playback-presentation bbb-playback-screenshare bbb-record-core bbb-web bbb-webrtc-sfu bigbluebutton

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
endef

$(foreach pkg,${TARGETS},$(eval $(call makerule,$(pkg))))

# PACKAGES is the list of package with wildcards NOT expanded

PACKAGES=$(foreach pkg,${TARGETS},$(PACKAGE_$(pkg)))

# double-colon to recreate this file every time we call make,
# so that SIGNWITH always reflects the current setting

$(REPOSITORY)/conf/distributions::
	mkdir -p $(REPOSITORY)/conf/
	echo Codename: $(CODENAME)  > $(REPOSITORY)/conf/distributions
	echo Architectures: amd64  >> $(REPOSITORY)/conf/distributions
	echo Components: main      >> $(REPOSITORY)/conf/distributions
	if [ -n "$(SIGNWITH)" ]; then echo SignWith: $(SIGNWITH) >> $(REPOSITORY)/conf/distributions; fi

$(REPOSITORY):: $(REPOSITORY)/conf/distributions

$(REPOSITORY):: $(PACKAGES)
	reprepro -b $(REPOSITORY) includedeb $(CODENAME) $(PACKAGES)

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
