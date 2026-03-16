import Foundation
import Combine

class DataStore: ObservableObject {
    @Published var activities: [Activity] = []
    @Published var logs: [DayLog] = []

    private let activitiesFile = "activities.json"
    private let logsFile = "logs.json"

    var activeActivities: [Activity] {
        activities.filter { !$0.isArchived }.sorted { $0.sortOrder < $1.sortOrder }
    }

    var archivedActivities: [Activity] {
        activities.filter { $0.isArchived }
    }

    func todayLogs() -> [DayLog] {
        let today = Date().dayString
        return logs.filter { $0.date == today }
    }

    func logsForActivity(_ activity: Activity) -> [DayLog] {
        let today = Date().dayString
        return logs.filter { $0.activityId == activity.id && $0.date == today }
    }

    // MARK: - Activity CRUD

    func addActivity(_ activity: Activity) {
        activities.append(activity)
        saveActivities()
    }

    func updateActivity(_ activity: Activity) {
        if let index = activities.firstIndex(where: { $0.id == activity.id }) {
            activities[index] = activity
            saveActivities()
        }
    }

    func archiveActivity(_ activity: Activity) {
        if let index = activities.firstIndex(where: { $0.id == activity.id }) {
            activities[index].isArchived = true
            saveActivities()
        }
    }

    func restoreActivity(_ activity: Activity) {
        if let index = activities.firstIndex(where: { $0.id == activity.id }) {
            activities[index].isArchived = false
            saveActivities()
        }
    }

    func reorderActivities(_ reordered: [Activity]) {
        for (index, activity) in reordered.enumerated() {
            if let i = activities.firstIndex(where: { $0.id == activity.id }) {
                activities[i].sortOrder = index
            }
        }
        saveActivities()
    }

    // MARK: - Log CRUD

    func addLog(_ log: DayLog) {
        logs.append(log)
        saveLogs()
    }

    func updateLog(_ log: DayLog) {
        if let index = logs.firstIndex(where: { $0.id == log.id }) {
            logs[index] = log
            saveLogs()
        }
    }

    func deleteLog(_ log: DayLog) {
        logs.removeAll { $0.id == log.id }
        saveLogs()
    }

    // MARK: - Persistence

    init() {
        loadActivities()
        loadLogs()
        if activities.isEmpty {
            seedDefaults()
        }
    }

    private func getDocumentsURL() -> URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    }

    private func saveActivities() {
        save(activities, to: activitiesFile)
    }

    private func saveLogs() {
        save(logs, to: logsFile)
    }

    private func loadActivities() {
        if let loaded: [Activity] = load(from: activitiesFile) {
            activities = loaded
        }
    }

    private func loadLogs() {
        if let loaded: [DayLog] = load(from: logsFile) {
            logs = loaded
        }
    }

    private func save<T: Encodable>(_ data: T, to filename: String) {
        let url = getDocumentsURL().appendingPathComponent(filename)
        do {
            let encoded = try JSONEncoder().encode(data)
            try encoded.write(to: url)
        } catch {
            print("Failed to save \(filename): \(error)")
        }
    }

    private func load<T: Decodable>(from filename: String) -> T? {
        let url = getDocumentsURL().appendingPathComponent(filename)
        guard FileManager.default.fileExists(atPath: url.path) else { return nil }
        do {
            let data = try Data(contentsOf: url)
            return try JSONDecoder().decode(T.self, from: data)
        } catch {
            print("Failed to load \(filename): \(error)")
            return nil
        }
    }

    // MARK: - Default Activities

    private func seedDefaults() {
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

        activities = defaults
        saveActivities()
    }
}
