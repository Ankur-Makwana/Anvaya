import SwiftUI

struct CounterLogView: View {
    @EnvironmentObject var store: DataStore
    @Environment(\.presentationMode) var presentationMode
    let activity: Activity
    let existingLog: DayLog?

    @State private var count: Int = 0

    var goal: Int { activity.counterGoal ?? 0 }
    var isGoalMet: Bool { goal > 0 && count >= goal }

    var body: some View {
        VStack(spacing: 30) {
            Text(activity.emoji)
                .font(.system(size: 60))

            Text("\(count)")
                .font(.system(size: 72, weight: .bold, design: .rounded))
                .foregroundColor(isGoalMet ? .green : .primary)

            if goal > 0 {
                Text("Goal: \(goal)")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }

            HStack(spacing: 40) {
                Button {
                    if count > 0 { count -= 1 }
                } label: {
                    Image(systemName: "minus.circle.fill")
                        .font(.system(size: 44))
                        .foregroundColor(Color.red.opacity(0.8))
                }

                Button {
                    count += 1
                } label: {
                    Image(systemName: "plus.circle.fill")
                        .font(.system(size: 44))
                        .foregroundColor(.green)
                }
            }

            Button {
                saveLog()
            } label: {
                Text("Save")
                    .font(Font.title3.bold())
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.green)
                    .cornerRadius(12)
            }

            Spacer()
        }
        .padding(.top, 40)
        .padding(.horizontal)
        .onAppear {
            count = existingLog?.counterValue ?? 0
        }
    }

    private func saveLog() {
        if var existing = existingLog {
            existing.counterValue = count
            existing.timestamp = Date()
            store.updateLog(existing)
        } else {
            let log = DayLog(
                activityId: activity.id,
                date: Date().dayString,
                counterValue: count
            )
            store.addLog(log)
        }
        presentationMode.wrappedValue.dismiss()
    }
}
