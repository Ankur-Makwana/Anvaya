import Foundation

struct DayLog: Codable, Identifiable, Equatable {
    var id: UUID
    var activityId: UUID
    var date: String                    // "2026-03-13" for grouping by day
    var timestamp: Date                 // exact time of logging

    var boolValue: Bool?
    var counterValue: Int?
    var durationMinutes: Int?
    var selectedTags: [String]?
    var selectedOption: String?

    init(
        activityId: UUID,
        date: String,
        boolValue: Bool? = nil,
        counterValue: Int? = nil,
        durationMinutes: Int? = nil,
        selectedTags: [String]? = nil,
        selectedOption: String? = nil
    ) {
        self.id = UUID()
        self.activityId = activityId
        self.date = date
        self.timestamp = Date()
        self.boolValue = boolValue
        self.counterValue = counterValue
        self.durationMinutes = durationMinutes
        self.selectedTags = selectedTags
        self.selectedOption = selectedOption
    }
}
