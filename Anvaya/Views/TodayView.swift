import SwiftUI

struct TodayView: View {
    @EnvironmentObject var store: DataStore

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Header
                VStack(spacing: 4) {
                    Text("Anvaya")
                        .font(.largeTitle.bold())
                    Text("Small Habits. Meaningful Change.")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    Text(Date().friendlyString)
                        .font(.headline)
                        .foregroundColor(.secondary)
                        .padding(.top, 4)
                }
                .padding(.bottom, 20)

                // Activity cards
                LazyVStack(spacing: 12) {
                    ForEach(store.activeActivities) { activity in
                        ActivityRow(
                            activity: activity,
                            todayLogs: store.logsForActivity(activity)
                        )
                    }
                }
                .padding(.horizontal)
            }
            .padding(.top)
        }
        .background(Color(.systemGroupedBackground).ignoresSafeArea())
    }
}
