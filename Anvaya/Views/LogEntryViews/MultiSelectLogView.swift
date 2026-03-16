import SwiftUI

struct MultiSelectLogView: View {
    @EnvironmentObject var store: DataStore
    @Environment(\.presentationMode) var presentationMode
    let activity: Activity
    let existingLog: DayLog?

    @State private var selectedTags: Set<String> = []
    @State private var newTag: String = ""
    @State private var showingAddTag = false

    var body: some View {
        VStack(spacing: 20) {
            Text(activity.emoji)
                .font(.system(size: 50))

            // Tag grid using LazyVGrid
            LazyVGrid(columns: [
                GridItem(.adaptive(minimum: 100))
            ], spacing: 8) {
                ForEach(activity.tags, id: \.self) { tag in
                    Button {
                        toggleTag(tag)
                    } label: {
                        Text(tag)
                            .font(.subheadline)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 8)
                            .frame(maxWidth: .infinity)
                            .background(selectedTags.contains(tag) ? Color.green : Color(.tertiarySystemGroupedBackground))
                            .foregroundColor(selectedTags.contains(tag) ? .white : .primary)
                            .cornerRadius(20)
                    }
                }

                Button {
                    showingAddTag = true
                } label: {
                    HStack {
                        Image(systemName: "plus")
                        Text("Add")
                    }
                    .font(.subheadline)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 8)
                    .frame(maxWidth: .infinity)
                    .background(Color(.tertiarySystemGroupedBackground))
                    .cornerRadius(20)
                }
            }
            .padding(.horizontal)

            if !selectedTags.isEmpty {
                Text("\(selectedTags.count) selected")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }

            Button {
                saveLog()
            } label: {
                Text("Save")
                    .font(Font.title3.bold())
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(selectedTags.isEmpty ? Color.gray : Color.green)
                    .cornerRadius(12)
            }
            .disabled(selectedTags.isEmpty)
            .padding(.horizontal)

            Spacer()
        }
        .padding(.top, 20)
        .onAppear {
            if let tags = existingLog?.selectedTags {
                selectedTags = Set(tags)
            }
        }
        .alert(isPresented: $showingAddTag) {
            Alert(
                title: Text("Add Muscle Group"),
                message: Text("Enter the name below"),
                primaryButton: .default(Text("Add")) {
                    addNewTag()
                },
                secondaryButton: .cancel {
                    newTag = ""
                }
            )
        }
        .overlay(
            // TextField workaround for alert (iOS 14 alerts don't support TextField)
            // We'll use a sheet instead for adding tags
            EmptyView()
        )
    }

    private func toggleTag(_ tag: String) {
        if selectedTags.contains(tag) {
            selectedTags.remove(tag)
        } else {
            selectedTags.insert(tag)
        }
    }

    private func addNewTag() {
        let trimmed = newTag.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty, !activity.tags.contains(trimmed) else {
            newTag = ""
            return
        }
        var updated = activity
        updated.tags.append(trimmed)
        store.updateActivity(updated)
        selectedTags.insert(trimmed)
        newTag = ""
    }

    private func saveLog() {
        let tagArray = Array(selectedTags).sorted()

        if var existing = existingLog {
            existing.selectedTags = tagArray
            existing.timestamp = Date()
            store.updateLog(existing)
        } else {
            let log = DayLog(
                activityId: activity.id,
                date: Date().dayString,
                selectedTags: tagArray
            )
            store.addLog(log)
        }
        presentationMode.wrappedValue.dismiss()
    }
}
