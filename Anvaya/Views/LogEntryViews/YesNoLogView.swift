import SwiftUI

struct YesNoLogView: View {
    @EnvironmentObject var store: DataStore
    @Environment(\.presentationMode) var presentationMode
    let activity: Activity
    let existingLog: DayLog?

    private var isAlreadyLogged: Bool {
        existingLog?.boolValue == true
    }

    var body: some View {
        VStack(spacing: 30) {
            Text(activity.emoji)
                .font(.system(size: 60))

            if isAlreadyLogged {
                Label("Logged today!", systemImage: "checkmark.circle.fill")
                    .font(.title2)
                    .foregroundColor(Color.green)

                Button(action: {
                    if let log = existingLog {
                        store.deleteLog(log)
                    }
                    presentationMode.wrappedValue.dismiss()
                }) {
                    Text("Remove Log")
                        .foregroundColor(Color.red)
                        .padding()
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(Color.red, lineWidth: 1)
                        )
                }
            } else {
                Button(action: {
                    logYes()
                }) {
                    Text("Done!")
                        .font(Font.title3.bold())
                        .foregroundColor(Color.white)
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
