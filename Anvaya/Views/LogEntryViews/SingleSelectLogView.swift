import SwiftUI
import SwiftData

struct SingleSelectLogView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    let activity: Activity
    let existingLog: DayLog?

    @State private var selectedOption: String? = nil

    var body: some View {
        VStack(spacing: 30) {
            Text(activity.emoji)
                .font(.system(size: 60))

            // Option buttons
            VStack(spacing: 12) {
                ForEach(activity.options, id: \.self) { option in
                    Button {
                        selectedOption = option
                    } label: {
                        Text(option)
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(selectedOption == option ? Color.green : Color(.tertiarySystemGroupedBackground))
                            .foregroundStyle(selectedOption == option ? .white : .primary)
                            .cornerRadius(12)
                    }
                }
            }
            .padding(.horizontal)

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
            .disabled(selectedOption == nil)
            .padding(.horizontal)

            Spacer()
        }
        .padding(.top, 40)
        .onAppear {
            selectedOption = existingLog?.selectedOption
        }
    }

    private func saveLog() {
        guard let option = selectedOption else { return }

        if let existing = existingLog {
            existing.selectedOption = option
            existing.timestamp = Date()
        } else {
            let log = DayLog(
                activityId: activity.id,
                date: Date().dayString,
                selectedOption: option
            )
            modelContext.insert(log)
        }
        dismiss()
    }
}
