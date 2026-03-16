import SwiftUI

struct TodayView: View {
    @EnvironmentObject var store: DataStore

    var body: some View {
        List {
            // Header section
            Section {
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
                .frame(maxWidth: .infinity)
                .padding(.vertical, 8)
                .listRowBackground(Color.clear)
            }

            // Activities
            Section {
                ForEach(store.activeActivities) { activity in
                    ActivityRow(
                        activity: activity,
                        todayLogs: store.logsForActivity(activity)
                    )
                }
            }
        }
        .listStyle(InsetGroupedListStyle())
    }
}
