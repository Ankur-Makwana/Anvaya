# Anvaya

**Small Habits. Meaningful Change.**

A personal daily activity tracker for iPhone. Log workouts, nutrition, habits, and anything else — with flexible tracking types that grow with you.

## Features (v1)

- **Quick-tap daily logging** — tap an activity, log it, done
- **5 tracking types:** Yes/No, Counter (with goals), Duration, Multi-Select tags, Single-Select options
- **Fully customizable** — add new activities with any tracking type
- **Pre-configured activities:** Climbing, Water, Strength Training, Rolling, Nutrition, Breathing, Tennis
- **Local-only** — all data stays on your device, no login needed

## Setup (Mac with Xcode)

1. Clone this repo
2. Open Xcode → File → New → Project → iOS App
   - Product Name: `Anvaya`
   - Interface: SwiftUI
   - Storage: SwiftData
3. Delete the auto-generated `ContentView.swift` and `AnvayaApp.swift` from the Xcode project
4. Drag the `Anvaya/` source folder into the Xcode project navigator
5. Build and run on Simulator or your iPhone

## Tech Stack

- **SwiftUI** — declarative UI framework
- **SwiftData** — on-device persistence (Apple's modern Core Data replacement)
- **iOS 17+** required

## Roadmap

- [ ] v2: History view (calendar, tap to see past days)
- [ ] v3: Stats & streaks (weekly/monthly summaries, trends)
