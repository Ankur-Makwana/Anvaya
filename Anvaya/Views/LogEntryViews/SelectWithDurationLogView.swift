import SwiftUI

struct SelectWithDurationLogView: View {
    @EnvironmentObject var store: DataStore
    @Environment(\.presentationMode) var presentationMode
    let activity: Activity
    let existingLog: DayLog?

    @State private var selectedOption: String? = nil
    @State private var selectedMinutes: Int? = nil
    @State private var step: Int = 1  // 1 = pick type, 2 = pick duration

    var body: some View {
        VStack(spacing: 24) {
            Text(activity.emoji)
                .font(.system(size: 50))

            if step == 1 {
                typeSelection
            } else {
                durationSelection
            }

            Spacer()
        }
        .padding(.top, 30)
        .onAppear {
            selectedOption = existingLog?.selectedOption
            selectedMinutes = existingLog?.durationMinutes
            if selectedOption != nil && selectedMinutes != nil {
                step = 2
            }
        }
    }

    private var typeSelection: some View {
        VStack(spacing: 16) {
            Text("What type?")
                .font(.headline)
                .foregroundColor(Color.secondary)

            VStack(spacing: 12) {
                ForEach(activity.options, id: \.self) { option in
                    Button(action: {
                        selectedOption = option
                        step = 2
                    }) {
                        Text(option)
                            .font(.headline)
                            .foregroundColor(selectedOption == option ? Color.white : Color.primary)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(selectedOption == option ? Color.green : Color(.tertiarySystemGroupedBackground))
                            .cornerRadius(12)
                    }
                }
            }
            .padding(.horizontal)
        }
    }

    private var durationSelection: some View {
        VStack(spacing: 16) {
            // Show selected type
            if let option = selectedOption {
                HStack {
                    Text(option)
                        .font(.headline)
                        .foregroundColor(Color.green)
                    Button(action: { step = 1 }) {
                        Text("Change")
                            .font(.caption)
                            .foregroundColor(Color.blue)
                    }
                }
            }

            Text("How long?")
                .font(.headline)
                .foregroundColor(Color.secondary)

            if let minutes = selectedMinutes {
                Text("\(minutes) min")
                    .font(.system(size: 40, weight: .bold, design: .rounded))
                    .foregroundColor(Color.green)
            }

            LazyVGrid(columns: [GridItem(.adaptive(minimum: 70))], spacing: 12) {
                ForEach(activity.durationPresets, id: \.self) { minutes in
                    Button(action: {
                        selectedMinutes = minutes
                    }) {
                        Text("\(minutes)m")
                            .font(.headline)
                            .foregroundColor(selectedMinutes == minutes ? Color.white : Color.primary)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(selectedMinutes == minutes ? Color.green : Color(.tertiarySystemGroupedBackground))
                            .cornerRadius(8)
                    }
                }
            }
            .padding(.horizontal)

            Button(action: { saveLog() }) {
                Text("Save")
                    .font(Font.title3.bold())
                    .foregroundColor(Color.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(selectedMinutes != nil ? Color.green : Color.gray)
                    .cornerRadius(12)
            }
            .disabled(selectedMinutes == nil)
            .padding(.horizontal)
        }
    }

    private func saveLog() {
        guard let option = selectedOption, let minutes = selectedMinutes else { return }

        if var existing = existingLog {
            existing.selectedOption = option
            existing.durationMinutes = minutes
            existing.timestamp = Date()
            store.updateLog(existing)
        } else {
            let log = DayLog(
                activityId: activity.id,
                date: Date().dayString,
                durationMinutes: minutes,
                selectedOption: option
            )
            store.addLog(log)
        }
        presentationMode.wrappedValue.dismiss()
    }
}
