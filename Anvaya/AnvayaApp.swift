import SwiftUI
import SwiftData

@main
struct AnvayaApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: [Activity.self, DayLog.self])
    }
}

struct ContentView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(filter: #Predicate<Activity> { !$0.isArchived },
           sort: \Activity.sortOrder)
    private var activities: [Activity]

    @State private var showingSettings = false

    var body: some View {
        NavigationStack {
            TodayView()
                .toolbar {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button {
                            showingSettings = true
                        } label: {
                            Image(systemName: "gearshape")
                        }
                    }
                }
                .sheet(isPresented: $showingSettings) {
                    SettingsView()
                }
                .onAppear {
                    seedDefaultActivitiesIfNeeded()
                }
        }
    }

    private func seedDefaultActivitiesIfNeeded() {
        // Only seed if no activities exist (first launch)
        guard activities.isEmpty else { return }

        let defaults: [Activity] = [
            Activity(
                name: "Climbing",
                emoji: "🧗",
                trackingType: .singleSelect,
                sortOrder: 0,
                options: ["Boulder", "Rope"]
            ),
            Activity(
                name: "Climbing Duration",
                emoji: "⏱️",
                trackingType: .duration,
                sortOrder: 1,
                durationPresets: [30, 45, 60, 90, 120]
            ),
            Activity(
                name: "Water",
                subtitle: "Goal: 4 bottles",
                emoji: "💧",
                trackingType: .counter,
                sortOrder: 2,
                counterGoal: 4
            ),
            Activity(
                name: "Strength Training",
                emoji: "💪",
                trackingType: .singleSelect,
                sortOrder: 3,
                options: ["Strength", "Core", "Plyo"]
            ),
            Activity(
                name: "Rolling",
                emoji: "🔵",
                trackingType: .multiSelect,
                sortOrder: 4,
                tags: ["Adductors", "Hip Flexors", "Lats", "Serratus", "Chest", "Quads", "Hamstrings", "Calves", "Glutes", "Upper Back"]
            ),
            Activity(
                name: "Protein Drink",
                emoji: "🥤",
                trackingType: .yesNo,
                sortOrder: 5
            ),
            Activity(
                name: "Creatine",
                emoji: "💊",
                trackingType: .yesNo,
                sortOrder: 6
            ),
            Activity(
                name: "Overnight Oats",
                emoji: "🥣",
                trackingType: .yesNo,
                sortOrder: 7
            ),
            Activity(
                name: "Diaphragmatic Breathing",
                emoji: "🌬️",
                trackingType: .duration,
                sortOrder: 8,
                durationPresets: [5, 10, 15, 20, 30]
            ),
            Activity(
                name: "Tennis",
                emoji: "🎾",
                trackingType: .duration,
                sortOrder: 9,
                durationPresets: [30, 45, 60, 90, 120]
            ),
        ]

        for activity in defaults {
            modelContext.insert(activity)
        }
    }
}
