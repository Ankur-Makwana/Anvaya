import SwiftUI
import SwiftData

struct YesNoLogView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    let activity: Activity
    let existingLog: DayLog?

    var body: some View {
        VStack(spacing: 30) {
            Text(activity.emoji)
                .font(.system(size: 60))

            if let log = existingLog, log.boolValue == true {
                Label("Logged today!", systemImage: "checkmark.circle.fill")
                    .font(.title2)
                    .foregroundStyle(.green)

                Button("Remove Log", role: .destructive) {
                    modelContext.delete(log)
                    dismiss()
                }
                .buttonStyle(.bordered)
            } else {
                Button {
                    logYes()
                } label: {
                    Label("Done!", systemImage: "checkmark")
                        .font(.title3.bold())
                        .frame(maxWidth: .infinity)
                        .padding()
                }
                .buttonStyle(.borderedProminent)
                .tint(.green)
            }

            Spacer()
        }
        .padding(.top, 40)
        .padding(.horizontal)
    }

    private func logYes() {
        let log = DayLog(
            activityId: activity.id,
            date: Date().dayString,
            boolValue: true
        )
        modelContext.insert(log)
        dismiss()
    }
}
