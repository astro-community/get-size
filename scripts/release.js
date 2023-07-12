import { execSync, spawnSync } from 'node:child_process'

try {
	const pkgs = JSON.parse(execSync('npm pack --workspaces --json').toString())

	for (const pkg of pkgs) {
		spawnSync('npm', [ 'publish', pkg.filename, '--access=public', ...process.argv.slice(2) ], {
			cwd: process.cwd(),
			env: process.env,
			stdio: 'inherit',
			encoding: 'utf-8',
		})

		execSync(`rm -rf ${pkg.filename}`)
	}
} catch (error) {
	console.error(error)
}
