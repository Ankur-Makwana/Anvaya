import Foundation

extension Date {
    /// Returns date as "2026-03-13" string for grouping logs by day
    var dayString: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: self)
    }

    /// Returns a friendly display string like "Thu, Mar 13"
    var friendlyString: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEE, MMM d"
        return formatter.string(from: self)
    }
}
