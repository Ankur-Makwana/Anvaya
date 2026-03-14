import SwiftUI
import SwiftData

struct SettingsView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    @Query(sort: \Activity.sortOrder) private var activities: [Activity]

    @State private var showingAddActivity = false

    var activeActivities: [Activity] {
        activities.filter { !$0.isArchived }
    }

    var archivedActivities: [Activity] {
        activities.filter { $0.isArchived }
    }

    var body: some View {
        NavigationStack {
            List {
                Section("Active Activities") {
                    ForEach(activeActivities) { activity in
                        NavigationLink {
                            ActivityEditorView(activity: activity)
                        } label: {
                            HStack {
                                Text(activity.emoji)
                                Text(activity.name)
                                Spacer()
                                Text(activity.trackingType.rawValue)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                    .onMove { from, to in
                        reorder(from: from, to: to)
                    }
                }

                if !archivedActivities.isEmpty {
                    Section("Archived") {
                        ForEach(archivedActivities) { activity in
                            HStack {
                                Text(activity.emoji)
                                Text(activity.name)
                                    .foregroundStyle(.secondary)
                                Spacer()
                                Button("Restore") {
                                    activity.isArchived = false
                                }
                                .font(.caption)
                            }
                        }
                    }
                }
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Done") { dismiss() }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showingAddActivity = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    EditButton()
                }
            }
            .sheet(isPresented: $showingAddActivity) {
                ActivityEditorView(activity: nil)
            }
        }
    }

    private func reorder(from source: IndexSet, to destination: Int) {
        var ordered = activeActivities
        ordered.move(fromOffsets: source, toOffset: destination)
        for (index, activity) in ordered.enumerated() {
            activity.sortOrder = index
        }
    }
}
