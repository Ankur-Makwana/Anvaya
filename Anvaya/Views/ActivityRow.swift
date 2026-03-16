import SwiftUI

struct ActivityRow: View {
    @EnvironmentObject var store: DataStore
    let activity: Activity
    let todayLogs: [DayLog]

    @State private var showingDetail = false

    var body: some View {
        Button(action: {
            showingDetail = true
        }) {
            HStack(spacing: 12) {
                Text(activity.emoji)
                    .font(.title2)

                VStack(alignment: .leading, spacing: 2) {
                    Text(activity.name)
                        .font(.headline)
                        .foregroundColor(.primary)

                    if !activity.subtitle.isEmpty {
                        Text(activity.subtitle)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }

                Spacer()

                statusBadge
            }
            .padding()
            .background(isLogged ? Color.green.opacity(0.1) : Color(.secondarySystemGroupedBackground))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isLogged ? Color.green.opacity(0.3) : Color.clear, lineWidth: 1)
            )
        }
        .buttonStyle(PlainButtonStyle())
        .sheet(isPresented: $showingDetail) {
            logEntrySheet
                .environmentObject(store)
        }
    }

    // MARK: - Status Badge

    private var isLogged: Bool {
        !todayLogs.isEmpty
    }

    @ViewBuilder
    private var statusBadge: some View {
        if activity.trackingType == .yesNo {
            Image(systemName: isLogged ? "checkmark.circle.fill" : "circle")
                .font(.title2)
                .foregroundColor(isLogged ? .green : .secondary)
        } else if activity.trackingType == .counter {
            Text("\(todayLogs.last?.counterValue ?? 0)/\(activity.counterGoal ?? 0)")
                .font(Font.headline.monospacedDigit())
                .foregroundColor(counterGoalMet ? .green : .primary)
        } else if activity.trackingType == .duration {
            if todayLogs.last?.durationMinutes != nil {
                Text("\(todayLogs.last!.durationMinutes!) min")
                    .font(.subheadline)
                    .foregroundColor(.green)
            } else {
                Text("—")
                    .foregroundColor(.secondary)
            }
        } else if activity.trackingType == .multiSelect {
            if let tags = todayLogs.last?.selectedTags, !tags.isEmpty {
                Text("\(tags.count) logged")
                    .font(.subheadline)
                    .foregroundColor(.green)
            } else {
                Text("—")
                    .foregroundColor(.secondary)
            }
        } else {
            if todayLogs.last?.selectedOption != nil {
                Text(todayLogs.last!.selectedOption!)
                    .font(.subheadline)
                    .foregroundColor(.green)
            } else {
                Text("—")
                    .foregroundColor(.secondary)
            }
        }
    }

    private var counterGoalMet: Bool {
        let count = todayLogs.last?.counterValue ?? 0
        let goal = activity.counterGoal ?? 0
        return goal > 0 && count >= goal
    }

    // MARK: - Log Entry Sheets

    @ViewBuilder
    private var logEntryContent: some View {
        if activity.trackingType == .yesNo {
            YesNoLogView(activity: activity, existingLog: todayLogs.last)
        } else if activity.trackingType == .counter {
            CounterLogView(activity: activity, existingLog: todayLogs.last)
        } else if activity.trackingType == .duration {
            DurationLogView(activity: activity, existingLog: todayLogs.last)
        } else if activity.trackingType == .multiSelect {
            MultiSelectLogView(activity: activity, existingLog: todayLogs.last)
        } else {
            SingleSelectLogView(activity: activity, existingLog: todayLogs.last)
        }
    }

    @ViewBuilder
    private var logEntrySheet: some View {
        NavigationView {
            logEntryContent
            .navigationTitle(activity.name)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        showingDetail = false
                    }
                }
            }
        }
    }
}
