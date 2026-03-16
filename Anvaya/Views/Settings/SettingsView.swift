import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var store: DataStore
    @Environment(\.presentationMode) var presentationMode
    @State private var showingAddActivity = false

    var body: some View {
        NavigationView {
            List {
                Section(header: Text("Active Activities")) {
                    ForEach(store.activeActivities) { activity in
                        NavigationLink(destination: ActivityEditorView(activity: activity)) {
                            HStack {
                                Text(activity.emoji)
                                Text(activity.name)
                                Spacer()
                                Text(activity.trackingType.rawValue)
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                    }
                    .onMove { from, to in
                        var ordered = store.activeActivities
                        ordered.move(fromOffsets: from, toOffset: to)
                        store.reorderActivities(ordered)
                    }
                }

                if !store.archivedActivities.isEmpty {
                    Section(header: Text("Archived")) {
                        ForEach(store.archivedActivities) { activity in
                            HStack {
                                Text(activity.emoji)
                                Text(activity.name)
                                    .foregroundColor(.secondary)
                                Spacer()
                                Button("Restore") {
                                    store.restoreActivity(activity)
                                }
                                .font(.caption)
                            }
                        }
                    }
                }
            }
            .listStyle(InsetGroupedListStyle())
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Done") {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showingAddActivity = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    EditButton()
                }
            }
            .sheet(isPresented: $showingAddActivity) {
                ActivityEditorView(activity: nil)
                    .environmentObject(store)
            }
        }
    }
}
