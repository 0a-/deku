
#
# Binaries.
#

export PATH := ./node_modules/.bin:${PATH}

#
# Wildcards.
#

lib = $(shell find index.js lib/*/*.js)
js = $(shell find index.js lib/*/*.js test/*.js)

#
# Default.
#

default: test

#
# Targets.
#

build.js: node_modules $(js)
	@duo -r ./ test/index.js > build.js

deku.js: $(js)
	@duo -s deku index.js | bfc > deku.js

#
# Tasks.
#

lint: $(lib)
	@jshint lib

serve:
	@duo-serve index.js -g deku

test: build.js
	@duo-test browser -c 'make build.js'

node_modules: package.json
	@npm install

clean:
	@-rm -rf build.js deku.js

distclean:
	@-rm -rf components node_modules

#
# Phonies.
#

.PHONY: lint
.PHONY: test
.PHONY: serve
.PHONY: clean
.PHONY: distclean
