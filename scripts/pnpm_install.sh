#!/usr/bin/env bash
#
# Run "pnpm install" with flags appropriate to the environment (local
# development vs build system). The install is always run within the current
# directory.
#
# Usage: pnpm_install.sh [optional extra flags]

set -euo pipefail

npm install -g pnpm@8.14.0

pnpm_flags=(
	# Do not execute install scripts
	# TODO: check if build works properly with this enabled
	# --ignore-scripts

	# Check if existing node_modules are valid
	# TODO: determine if this is necessary
	# --check-files
)

if [[ -n ${CI:-} ]]; then
	pnpm_flags+=(
		# Install dependencies from lockfile, ensuring builds are fully
		# reproducible
		--no-frozen-lockfile
		# Disable interactive prompts.
		--reporter append-only
	)
fi

# Append whatever is specified on the command line
pnpm_flags+=("$@")

echo "+ pnpm install ${pnpm_flags[*]}"
pnpm install "${pnpm_flags[@]}"
