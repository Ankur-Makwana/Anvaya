import SwiftUI

struct DurationLogView: View {
    @EnvironmentObject var store: DataStore
    @Environment(\.presentationMode) var presentationMode
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
                    .foregroundColor(.green)
            } else {
                Text("How long?")
                    .font(.title2)
                    .foregroundColor(.secondary)
            }

            LazyVGrid(columns: [
                GridItem(.adaptive(minimum: 70))
            ], spacing: 12) {
                ForEach(activity.durationPresets, id: \.self) { minutes in
                    Button {
                        selectedMinutes = minutes
                    } label: {
                        Text("\(minutes)m")
                            .font(.headline)
                            .foregroundColor(selectedMinutes == minutes ? .white : .primary)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(selectedMinutes == minutes ? Color.green : Color(.tertiarySystemGroupedBackground))
                            .cornerRadius(8)
                    }
                }
            }

            Button {
                saveLog()
            } label: {
                Text("Save")
                    .font(.title3.bold())
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(selectedMinutes != nil ? Color.green : Color.gray)
                    .cornerRadius(12)
            }
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

        if var existing = existingLog {
            existing.durationMinutes = minutes
            existing.timestamp = Date()
            store.updateLog(existing)
        } else {
            let log = DayLog(
                activityId: activity.id,
                date: Date().dayString,
                durationMinutes: minutes
            )
            store.addLog(log)
        }
        presentationMode.wrappedValue.dismiss()
    }
}
