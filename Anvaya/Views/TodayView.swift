import SwiftUI
import SwiftData

struct TodayView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(filter: #Predicate<Activity> { !$0.isArchived },
           sort: \Activity.sortOrder)
    private var activities: [Activity]

    @Query private var allLogs: [DayLog]

    private var todayString: String {
        Date().dayString
    }

    private var todayLogs: [DayLog] {
        allLogs.filter { $0.date == todayString }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Header
                VStack(spacing: 4) {
                    Text("Anvaya")
                        .font(.largeTitle.bold())
                    Text("Small Habits. Meaningful Change.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    Text(Date().friendlyString)
                        .font(.headline)
                        .foregroundStyle(.secondary)
                        .padding(.top, 4)
                }
                .padding(.bottom, 20)

                // Activity cards
                LazyVStack(spacing: 12) {
                    ForEach(activities) { activity in
                        ActivityRow(
                            activity: activity,
                            todayLogs: logsForActivity(activity)
                        )
                    }
                }
                .padding(.horizontal)
            }
            .padding(.top)
        }
        .background(Color(.systemGroupedBackground))
    }

    private func logsForActivity(_ activity: Activity) -> [DayLog] {
        todayLogs.filter { $0.activityId == activity.id }
    }
}
