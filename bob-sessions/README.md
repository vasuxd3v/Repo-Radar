# IBM Bob Build Sessions

This directory contains evidence of IBM Bob's role as development partner throughout the RepoRadar build.

## How to use this directory

After each Bob session where Bob writes code for this project:
1. Export or screenshot the Bob conversation from bob.ibm.com
2. Save it here as: `session-{number}-{feature-name}.png` or `.pdf`
3. Add an entry to the session log below

## Session Log

| Session | Feature built | Bob's contribution | File(s) produced |
|---------|--------------|-------------------|-----------------|
| 001 | BobExplainerPanel | Wrote the full slide-in panel component | src/components/BobExplainerPanel.tsx |
| 002 | explain API route | Wrote the rate-limited POST handler | src/app/api/explain/route.ts |
| 003 | bob-explainer lib | Wrote the file fetching and Bob API call logic | src/lib/bob-explainer.ts |
| 004 | README generation | Generated README.bob-generated.md | README.bob-generated.md |

Add new rows as you use Bob for more features.

## Export instructions for IBM Bob

In IBM Bob (bob.ibm.com):
1. Complete your coding session
2. Click the export/share button in the top right
3. Export as PDF or save the session report
4. Rename the file to match the session log above (e.g. `session-001-bob-explainer-panel.pdf`)
5. Place it in this directory
