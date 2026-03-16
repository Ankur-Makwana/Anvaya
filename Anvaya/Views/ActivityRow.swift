import SwiftUI

struct ActivityRow: View {
    @EnvironmentObject var store: DataStore
    let activity: Activity
    let todayLogs: [DayLog]

    @State private var showingDetail = false

    private var isLogged: Bool {
        !todayLogs.isEmpty
    }

    private var statusText: String {
        switch activity.trackingType {
        case .yesNo:
            return isLogged ? "✓" : ""
        case .counter:
            let count = todayLogs.last?.counterValue ?? 0
            let goal = activity.counterGoal ?? 0
            return "\(count)/\(goal)"
        case .duration:
            if let min = todayLogs.last?.durationMinutes {
                return "\(min) min"
            }
            return "—"
        case .multiSelect:
            if let tags = todayLogs.last?.selectedTags, !tags.isEmpty {
                return "\(tags.count) logged"
            }
            return "—"
        case .singleSelect:
            return todayLogs.last?.selectedOption ?? "—"
        case .singleSelectWithDuration:
            if let opt = todayLogs.last?.selectedOption, let min = todayLogs.last?.durationMinutes {
                return "\(opt) · \(min)m"
            }
            return "—"
        }
    }

    var body: some View {
        Button(action: {
            self.showingDetail = true
        }) {
            HStack(spacing: 12) {
                Text(activity.emoji)
                    .font(.title2)

                VStack(alignment: .leading, spacing: 2) {
                    Text(activity.name)
                        .font(.headline)
                        .foregroundColor(Color.primary)

                    if !activity.subtitle.isEmpty {
                        Text(activity.subtitle)
                            .font(.caption)
                            .foregroundColor(Color.secondary)
                    }
                }

                Spacer()

                Text(statusText)
                    .font(.subheadline)
                    .foregroundColor(isLogged ? Color.green : Color.secondary)
            }
            .padding(.vertical, 8)
        }
        .buttonStyle(PlainButtonStyle())
        .sheet(isPresented: $showingDetail) {
            SheetRouter(activity: self.activity, existingLog: self.todayLogs.last, showingDetail: self.$showingDetail)
                .environmentObject(self.store)
        }
    }
}

struct SheetRouter: View {
    @EnvironmentObject var store: DataStore
    let activity: Activity
    let existingLog: DayLog?
    @Binding var showingDetail: Bool

    var body: some View {
        NavigationView {
            sheetContent
                .navigationTitle(activity.name)
                .navigationBarTitleDisplayMode(.inline)
                .navigationBarItems(leading: Button("Cancel") {
                    showingDetail = false
                })
        }
    }

    @ViewBuilder
    private var sheetContent: some View {
        if activity.trackingType == .yesNo {
            YesNoLogView(activity: activity, existingLog: existingLog)
        } else if activity.trackingType == .counter {
            CounterLogView(activity: activity, existingLog: existingLog)
        } else if activity.trackingType == .duration {
            DurationLogView(activity: activity, existingLog: existingLog)
        } else if activity.trackingType == .multiSelect {
            MultiSelectLogView(activity: activity, existingLog: existingLog)
        } else if activity.trackingType == .singleSelectWithDuration {
            SelectWithDurationLogView(activity: activity, existingLog: existingLog)
        } else {
            SingleSelectLogView(activity: activity, existingLog: existingLog)
        }
    }
}
