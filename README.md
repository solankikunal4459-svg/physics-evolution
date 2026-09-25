<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/f2d135a3-5809-4061-b883-8af60a380faf

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## Physics Evolution Network v3

This build expands the playable evolution graph so all 22 existing physical quantities are reachable from the universal starting state `m`, and every quantity has at least one onward transformation.

The graph now includes:
- Linear mechanics: `m → p → v → a → F → J/W/P`
- Energy rates: `KE → P`, `PE → P`
- Rotational loop: `m → I → α/ω → τ/L → F` and `ω → θ → ω`
- Electrical loop: `W → q → I → V → R → V`
- Field bridges: `F ↔ q`, `F ↔ E`, `F ↔ B`
- Magnetic force: `q × v × B → F` and `B × qv → F`
- Reverse/bridge pickups are represented as visible operator symbols.

The strategic pickup spawner now prefers undiscovered outgoing transformations, then falls back to already-discovered routes. This is intended to keep discovery moving while preserving repeatable evolution loops.

Codex storage key was bumped to v3 so old prototype discovery state does not interfere with testing the expanded network.
