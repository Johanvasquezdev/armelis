# Armelis Trivy Adapter

This package converts Trivy JSON into Armelis normalized findings and provides a controlled local repository runner.

## Run a scan from Node.js

```js
const { runTrivy } = require('./packages/scanner-adapters/trivy/runner');

const result = await runTrivy({
  target: 'test-targets/example-service',
  workspaceRoot: process.cwd(),
  executable: 'trivy'
});
```

The runner invokes Trivy without a shell and enables vulnerability, misconfiguration, secret, and license scanners. It rejects URLs and paths outside the configured workspace root.

Scanner failures and invalid output are returned as errors and must be recorded by the future scan lifecycle service.

## Automated scan command

From the Armelis repository root:

```powershell
node packages/scanner-adapters/trivy/scan.js --target test-targets/example-service
```

The command writes a timestamped normalized report below `.armelis/scans/`. Reports are created with an exclusive write so an existing report is never overwritten accidentally.
