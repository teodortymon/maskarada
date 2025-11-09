
# Sane defaults
SHELL := /opt/homebrew/bin/fish
.ONESHELL:
# .SHELLFLAGS := -eu -o pipefail -c
.DELETE_ON_ERROR:
MAKEFLAGS += --warn-undefined-variables
MAKEFLAGS += --no-builtin-rules

dev: # Run
	chruby ruby-3.1.3
	bundle exec jekyll serve --livereload --incremental

dev-tina: # Run jekyll with tina
	npx tinacms dev -c "bundle exec jekyll serve --livereload --host localhost"

resize: # Create structure and resize pictures
	cd $(args)
	mkdir small
	mkdir large
	cp *.JPG small/
	cp *.JPG large/
	mogrify -resize 180x180 small/*.JPG
	mogrify -resize 600x600 large/*.JPG
	rm -rf *.JPG
	cd ..
	cp -r $(args) t/lay/img/

# -----------------------------------------------------------
# CAUTION: If you have a file with the same name as make
# command, you need to add it to .PHONY below, otherwise it
# won't work. E.g. `make run` wouldn't work if you have
# `run` file in pwd.
.PHONY: help

# -----------------------------------------------------------
# -----       (Makefile helpers and decoration)      --------
# -----------------------------------------------------------

.DEFAULT_GOAL := help
# check https://stackoverflow.com/questions/4842424/list-of-ansi-color-escape-sequences
NC = \033[0m
ERR = \033[31;1m
TAB := '%-20s' # Increase if you have long commands

# tput colors
red := $(shell tput setaf 1)
green := $(shell tput setaf 2)
yellow := $(shell tput setaf 3)
blue := $(shell tput setaf 4)
cyan := $(shell tput setaf 6)
cyan80 := $(shell tput setaf 86)
grey500 := $(shell tput setaf 244)
grey300 := $(shell tput setaf 240)
bold := $(shell tput bold)
underline := $(shell tput smul)
reset := $(shell tput sgr0)

help:
	@printf '\n'
	@printf 'If you are running this project for the first time then we recommend to start with:'
	@printf '\n $(yellow)make init && make run $(reset)\n\n'
	
	@printf '    $(underline)$(grey500)Available make commands:$(reset)\n\n'
	@# Print non-check commands with comments
	@grep -E '^([a-zA-Z0-9_-]+\.?)+:.+#.+$$' $(MAKEFILE_LIST) \
		| grep -v '^check-' \
		| grep -v '^env-' \
		| grep -v '^arg-' \
		| sed 's/:.*#/: #/g' \
		| awk 'BEGIN {FS = "[: ]+#[ ]+"}; \
		{printf " $(grey300)   make $(reset)$(cyan80)$(bold)$(TAB) $(reset)$(grey300)# %s$(reset)\n", \
			$$1, $$2}'
	@grep -E '^([a-zA-Z0-9_-]+\.?)+:( +\w+-\w+)*$$' $(MAKEFILE_LIST) \
		| grep -v help \
		| awk 'BEGIN {FS = ":"}; \
		{printf " $(grey300)   make $(reset)$(cyan80)$(bold)$(TAB)$(reset)\n", \
			$$1}'
	@echo -e ""
