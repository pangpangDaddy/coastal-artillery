# Coastal Artillery（岸防炮）

A black-and-white silhouette coastal-defense naval strategy game inspired by the Flash classic *Black Navy War*. Command three eras of warfare — WWI, WWII, and modern 2026 — across 9 stages with boss flagships.

## Tech

TypeScript + HTML5 Canvas 2D + Vite. Zero runtime dependencies. All art is procedural silhouette rendering; all sound is procedural WebAudio.

## Run

```bash
npm install
npm run dev        # dev server
npm run build      # production build -> dist/
npm run typecheck  # tsc --noEmit
npm run sim        # headless balance simulation (test/sim.ts)
```

## How to play

- Defend your coast (left), destroy the enemy base (right).
- Resource grows over time; kills pay bounties.
- Buy units (ships / aircraft / submarines) and build turrets on the cliff slots — anti-ship and anti-air.
- Scroll the camera with Arrow keys / A,D / mouse at screen edges. `M` mute, `Esc` pause.
- Radar (bottom-right) shows the whole battlefield.
- Win a stage to unlock the next. Progress is saved in localStorage. Debug: append `?unlock` to the URL to unlock all stages.

## Structure

```
src/
  main.ts         entry, mode state machine
  core.ts         loop / input / camera
  types.ts        shared types & world constants
  data.ts         weapons, units, turrets, eras, 9 stage configs
  entities.ts     combat logic (movement, targeting, projectiles, damage)
  battle.ts       battle orchestration, waves, boss, win/lose
  silhouettes.ts  procedural unit/turret drawing
  effects.ts      particles & screen shake
  audio.ts        procedural WebAudio sound
  render.ts       battlefield rendering
  hud.ts          HUD, shop buttons, radar, result overlay
  menus.ts        title & stage select
test/sim.ts       headless balance test (scripted policy plays all stages)
```

## Roadmap

- Steam packaging (Electron/Tauri), save files, achievements
- More units per era, difficulty modes, localization
