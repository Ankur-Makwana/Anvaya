import Foundation
import SwiftData

@Model
final class DayLog {
    var id: UUID
    var activityId: UUID
    var date: String                    // "2026-03-13" — just the day for easy grouping
    var timestamp: Date                 // exact time of logging

    // Value fields — only one is used per entry, based on activity's trackingType
    var boolValue: Bool?                // yesNo
    var counterValue: Int?              // counter
    var durationMinutes: Int?           // duration
    var selectedTags: [String]?         // multiSelect
    var selectedOption: String?         // singleSelect

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
