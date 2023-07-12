import { spawnSync } from 'node:child_process'

spawnSync('npx', [ 'eslint', 'packages/*/lib/**/*.js', ...process.argv.slice(2) ], {
	cwd: process.cwd(),
	env: process.env,
	stdio: 'inherit',
	encoding: 'utf-8',
})
