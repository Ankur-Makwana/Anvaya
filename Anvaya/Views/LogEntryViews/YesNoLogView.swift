import SwiftUI

struct YesNoLogView: View {
    @EnvironmentObject var store: DataStore
    @Environment(\.presentationMode) var presentationMode
    let activity: Activity
    let existingLog: DayLog?

    var body: some View {
        VStack(spacing: 30) {
            Text(activity.emoji)
                .font(.system(size: 60))

            if let log = existingLog, log.boolValue == true {
                Label("Logged today!", systemImage: "checkmark.circle.fill")
                    .font(.title2)
                    .foregroundColor(.green)

                Button("Remove Log") {
                    store.deleteLog(log)
                    presentationMode.wrappedValue.dismiss()
                }
                .foregroundColor(.red)
                .padding()
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color.red, lineWidth: 1)
                )
            } else {
                Button {
                    logYes()
                } label: {
                    Label("Done!", systemImage: "checkmark")
                        .font(.title3.bold())
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.green)
                        .cornerRadius(12)
                }
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
        store.addLog(log)
        presentationMode.wrappedValue.dismiss()
    }
}
