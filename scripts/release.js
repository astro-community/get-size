import { execSync, spawnSync } from 'node:child_process'

try {
	const pkgs = Object.entries(JSON.parse(execSync('npm pkg get private --workspaces --json').toString()))

	for (const [ pkgName, pkgPrivate ] of pkgs) {
		if (pkgPrivate === true) continue

		spawnSync('npm', [ 'publish', '--workspace', JSON.stringify(pkgName), '--access', 'public', ...process.argv.slice(2) ], {
			cwd: process.cwd(),
			env: process.env,
			stdio: 'inherit',
			encoding: 'utf-8',
		})
	}
} catch (error) {
	console.error(error)
}
