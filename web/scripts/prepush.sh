#!/bin/bash
set -e

# When building on CI on deploy candidate branches, we can omit
# the prepush linting step that gets triggered prior to npm run push
# as linting would have already taken place.

# For all other cases, run lint prior to a push.

if [ "$CIRCLE_BRANCH" == "master" ]; then
    echo Skipping lint
elif [[ "$CIRCLE_BRANCH" == release* ]]; then
	echo Skipping lint
else
    npm run lint
fi
