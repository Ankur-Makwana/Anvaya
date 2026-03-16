import SwiftUI

struct TodayView: View {
    @EnvironmentObject var store: DataStore

    var body: some View {
        VStack(spacing: 0) {
            // Header
            VStack(spacing: 4) {
                Text("Anvaya")
                    .font(Font.largeTitle.bold())
                Text("Small Habits. Meaningful Change.")
                    .font(.subheadline)
                    .foregroundColor(Color.secondary)
                Text(Date().friendlyString)
                    .font(.headline)
                    .foregroundColor(Color.secondary)
                    .padding(.top, 4)
            }
            .padding(.vertical, 16)

            // Activity list
            List {
                ForEach(store.activeActivities) { activity in
                    ActivityRow(
                        activity: activity,
                        todayLogs: store.logsForActivity(activity)
                    )
                    .listRowInsets(EdgeInsets(top: 4, leading: 16, bottom: 4, trailing: 16))
                }
            }
            .listStyle(PlainListStyle())
        }
    }
}
