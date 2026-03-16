import Foundation

enum TrackingType: String, Codable, CaseIterable, Identifiable {
    case yesNo = "Yes / No"
    case counter = "Counter"
    case duration = "Duration"
    case multiSelect = "Multi-Select"
    case singleSelect = "Single-Select"

    var id: String { rawValue }
}

struct Activity: Codable, Identifiable, Equatable {
    var id: UUID
    var name: String
    var subtitle: String
    var emoji: String
    var trackingType: TrackingType
    var sortOrder: Int
    var isArchived: Bool
    var createdAt: Date

    var counterGoal: Int?
    var options: [String]
    var tags: [String]
    var durationPresets: [Int]

    init(
        name: String,
        subtitle: String = "",
        emoji: String = "📌",
        trackingType: TrackingType,
        sortOrder: Int = 0,
        counterGoal: Int? = nil,
        options: [String] = [],
        tags: [String] = [],
        durationPresets: [Int] = [5, 10, 15, 20, 30, 45, 60, 90, 120]
    ) {
        self.id = UUID()
        self.name = name
        self.subtitle = subtitle
        self.emoji = emoji
        self.trackingType = trackingType
        self.sortOrder = sortOrder
        self.isArchived = false
        self.createdAt = Date()
        self.counterGoal = counterGoal
        self.options = options
        self.tags = tags
        self.durationPresets = durationPresets
    }
}
