
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

build.js: $(js)
	@duo -r ./ test/index.js > build.js

tests.js: $(js)
	@duo -r ./ test/index.js | bfc > tests.js

dist/deku.js: $(js)
	@-mkdir dist
	@duo -s deku index.js | bfc > dist/deku.js
	@minify dist/deku.js > dist/deku.min.js

#
# Tasks.
#

lint: $(lib)
	@jshint lib

serve:
	@duo-serve index.js -g deku

test: build.js
	@duo-test browser -c 'make build.js'

test-phantom: build.js
	@duo-test phantomjs

test-cloud: tests.js
	@zuul -- tests.js

node_modules: package.json
	@npm install

clean:
	@-rm -rf build.js dist

distclean:
	@-rm -rf components node_modules

release: clean dist/deku.js
	@git checkout master && \
	@git reset --hard && \
	@bump $(VERSION) && \
	@git changelog --tag $(VERSION) CHANGELOG.md && \
	@git commit --all -m "Release $(VERSION)" && \
	@git tag $(VERSION) && \
	@git push origin master --tags && \
	@npm publish

#
# Phonies.
#

.PHONY: lint
.PHONY: test
.PHONY: test-cloud
.PHONY: test-phantom
.PHONY: serve
.PHONY: clean
.PHONY: distclean
