import SwiftUI

struct ActivityRow: View {
    @EnvironmentObject var store: DataStore
    let activity: Activity
    let todayLogs: [DayLog]

    @State private var showingDetail = false

    var body: some View {
        Button {
            showingDetail = true
        } label: {
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
        .sheet(isPresented: $showingDetail) {
            logEntrySheet
        }
    }

    // MARK: - Status Badge

    private var isLogged: Bool {
        !todayLogs.isEmpty
    }

    @ViewBuilder
    private var statusBadge: some View {
        switch activity.trackingType {
        case .yesNo:
            Image(systemName: isLogged ? "checkmark.circle.fill" : "circle")
                .font(.title2)
                .foregroundColor(isLogged ? .green : .secondary)

        case .counter:
            let count = todayLogs.last?.counterValue ?? 0
            let goal = activity.counterGoal ?? 0
            Text("\(count)/\(goal)")
                .font(.headline.monospacedDigit())
                .foregroundColor(count >= goal && goal > 0 ? .green : .primary)

        case .duration:
            if let minutes = todayLogs.last?.durationMinutes {
                Text("\(minutes) min")
                    .font(.subheadline)
                    .foregroundColor(.green)
            } else {
                Text("—")
                    .foregroundColor(.secondary)
            }

        case .multiSelect:
            if let tags = todayLogs.last?.selectedTags, !tags.isEmpty {
                Text("\(tags.count) logged")
                    .font(.subheadline)
                    .foregroundColor(.green)
            } else {
                Text("—")
                    .foregroundColor(.secondary)
            }

        case .singleSelect:
            if let option = todayLogs.last?.selectedOption {
                Text(option)
                    .font(.subheadline)
                    .foregroundColor(.green)
            } else {
                Text("—")
                    .foregroundColor(.secondary)
            }
        }
    }

    // MARK: - Log Entry Sheets

    @ViewBuilder
    private var logEntrySheet: some View {
        NavigationView {
            Group {
                switch activity.trackingType {
                case .yesNo:
                    YesNoLogView(activity: activity, existingLog: todayLogs.last)
                case .counter:
                    CounterLogView(activity: activity, existingLog: todayLogs.last)
                case .duration:
                    DurationLogView(activity: activity, existingLog: todayLogs.last)
                case .multiSelect:
                    MultiSelectLogView(activity: activity, existingLog: todayLogs.last)
                case .singleSelect:
                    SingleSelectLogView(activity: activity, existingLog: todayLogs.last)
                }
            }
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
