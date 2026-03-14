import SwiftUI
import SwiftData

struct DurationLogView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    let activity: Activity
    let existingLog: DayLog?

    @State private var selectedMinutes: Int? = nil

    var body: some View {
        VStack(spacing: 30) {
            Text(activity.emoji)
                .font(.system(size: 60))

            if let minutes = selectedMinutes {
                Text("\(minutes) min")
                    .font(.system(size: 48, weight: .bold, design: .rounded))
                    .foregroundStyle(.green)
            } else {
                Text("How long?")
                    .font(.title2)
                    .foregroundStyle(.secondary)
            }

            // Duration preset buttons
            LazyVGrid(columns: [
                GridItem(.adaptive(minimum: 70))
            ], spacing: 12) {
                ForEach(activity.durationPresets, id: \.self) { minutes in
                    Button {
                        selectedMinutes = minutes
                    } label: {
                        Text("\(minutes)m")
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                    }
                    .buttonStyle(.bordered)
                    .tint(selectedMinutes == minutes ? .green : .primary)
                }
            }

            Button {
                saveLog()
            } label: {
                Text("Save")
                    .font(.title3.bold())
                    .frame(maxWidth: .infinity)
                    .padding()
            }
            .buttonStyle(.borderedProminent)
            .tint(.green)
            .disabled(selectedMinutes == nil)

            Spacer()
        }
        .padding(.top, 40)
        .padding(.horizontal)
        .onAppear {
            selectedMinutes = existingLog?.durationMinutes
        }
    }

    private func saveLog() {
        guard let minutes = selectedMinutes else { return }

        if let existing = existingLog {
            existing.durationMinutes = minutes
            existing.timestamp = Date()
        } else {
            let log = DayLog(
                activityId: activity.id,
                date: Date().dayString,
                durationMinutes: minutes
            )
            modelContext.insert(log)
        }
        dismiss()
    }
}
