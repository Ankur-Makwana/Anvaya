import SwiftUI

struct SingleSelectLogView: View {
    @EnvironmentObject var store: DataStore
    @Environment(\.presentationMode) var presentationMode
    let activity: Activity
    let existingLog: DayLog?

    @State private var selectedOption: String? = nil

    var body: some View {
        VStack(spacing: 30) {
            Text(activity.emoji)
                .font(.system(size: 60))

            VStack(spacing: 12) {
                ForEach(activity.options, id: \.self) { option in
                    Button {
                        selectedOption = option
                    } label: {
                        Text(option)
                            .font(.headline)
                            .foregroundColor(selectedOption == option ? .white : .primary)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(selectedOption == option ? Color.green : Color(.tertiarySystemGroupedBackground))
                            .cornerRadius(12)
                    }
                }
            }
            .padding(.horizontal)

            Button {
                saveLog()
            } label: {
                Text("Save")
                    .font(.title3)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(selectedOption != nil ? Color.green : Color.gray)
                    .cornerRadius(12)
            }
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

        if var existing = existingLog {
            existing.selectedOption = option
            existing.timestamp = Date()
            store.updateLog(existing)
        } else {
            let log = DayLog(
                activityId: activity.id,
                date: Date().dayString,
                selectedOption: option
            )
            store.addLog(log)
        }
        presentationMode.wrappedValue.dismiss()
    }
}
