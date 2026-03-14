import SwiftUI
import SwiftData

struct CounterLogView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    let activity: Activity
    let existingLog: DayLog?

    @State private var count: Int = 0

    var goal: Int { activity.counterGoal ?? 0 }
    var isGoalMet: Bool { goal > 0 && count >= goal }

    var body: some View {
        VStack(spacing: 30) {
            Text(activity.emoji)
                .font(.system(size: 60))

            // Count display
            Text("\(count)")
                .font(.system(size: 72, weight: .bold, design: .rounded))
                .foregroundStyle(isGoalMet ? .green : .primary)

            if goal > 0 {
                Text("Goal: \(goal)")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            // +/- buttons
            HStack(spacing: 40) {
                Button {
                    if count > 0 { count -= 1 }
                } label: {
                    Image(systemName: "minus.circle.fill")
                        .font(.system(size: 44))
                        .foregroundStyle(.red.opacity(0.8))
                }

                Button {
                    count += 1
                } label: {
                    Image(systemName: "plus.circle.fill")
                        .font(.system(size: 44))
                        .foregroundStyle(.green)
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

            Spacer()
        }
        .padding(.top, 40)
        .padding(.horizontal)
        .onAppear {
            count = existingLog?.counterValue ?? 0
        }
    }

    private func saveLog() {
        if let existing = existingLog {
            existing.counterValue = count
            existing.timestamp = Date()
        } else {
            let log = DayLog(
                activityId: activity.id,
                date: Date().dayString,
                counterValue: count
            )
            modelContext.insert(log)
        }
        dismiss()
    }
}
