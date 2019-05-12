#!/bin/bash


if [ "$1" != "" ]; then
	TARGET="$1"
        git checkout "$TARGET" && git pull origin "$TARGET"

	rm "target/$TARGET.zip"

	zip "target/$TARGET.zip" -r . -x "./.*"
else
	echo "Please specify a target name"
fi
