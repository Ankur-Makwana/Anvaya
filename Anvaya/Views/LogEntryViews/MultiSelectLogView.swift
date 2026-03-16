import SwiftUI

struct MultiSelectLogView: View {
    @EnvironmentObject var store: DataStore
    @Environment(\.presentationMode) var presentationMode
    let activity: Activity
    let existingLog: DayLog?

    @State private var selectedTags: Set<String> = []
    @State private var showingAddTag = false

    var body: some View {
        VStack(spacing: 20) {
            Text(activity.emoji)
                .font(.system(size: 50))

            LazyVGrid(columns: [GridItem(.adaptive(minimum: 100))], spacing: 8) {
                ForEach(activity.tags, id: \.self) { tag in
                    Button(action: {
                        toggleTag(tag)
                    }) {
                        Text(tag)
                            .font(.subheadline)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 8)
                            .frame(maxWidth: .infinity)
                            .background(selectedTags.contains(tag) ? Color.green : Color(.tertiarySystemGroupedBackground))
                            .foregroundColor(selectedTags.contains(tag) ? Color.white : Color.primary)
                            .cornerRadius(20)
                    }
                    .buttonStyle(PlainButtonStyle())
                }

                Button(action: {
                    showingAddTag = true
                }) {
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
                .buttonStyle(PlainButtonStyle())
            }
            .padding(.horizontal)

            if !selectedTags.isEmpty {
                Text("\(selectedTags.count) selected")
                    .font(.subheadline)
                    .foregroundColor(Color.secondary)
            }

            Button(action: { saveLog() }) {
                Text("Save")
                    .font(Font.title3.bold())
                    .foregroundColor(Color.white)
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
        .sheet(isPresented: $showingAddTag) {
            AddTagSheet(activity: activity, selectedTags: $selectedTags)
                .environmentObject(store)
        }
    }

    private func toggleTag(_ tag: String) {
        if selectedTags.contains(tag) {
            selectedTags.remove(tag)
        } else {
            selectedTags.insert(tag)
        }
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

struct AddTagSheet: View {
    @EnvironmentObject var store: DataStore
    @Environment(\.presentationMode) var presentationMode
    let activity: Activity
    @Binding var selectedTags: Set<String>
    @State private var newTag: String = ""

    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                TextField("Muscle group name", text: $newTag)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .padding(.horizontal)
                    .padding(.top, 20)

                Button(action: { addTag() }) {
                    Text("Add")
                        .font(Font.headline)
                        .foregroundColor(Color.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(newTag.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? Color.gray : Color.green)
                        .cornerRadius(12)
                }
                .disabled(newTag.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                .padding(.horizontal)

                Spacer()
            }
            .navigationTitle("Add Muscle Group")
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarItems(leading: Button("Cancel") {
                presentationMode.wrappedValue.dismiss()
            })
        }
    }

    private func addTag() {
        let trimmed = newTag.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty, !activity.tags.contains(trimmed) else { return }

        var updated = activity
        updated.tags.append(trimmed)
        store.updateActivity(updated)
        selectedTags.insert(trimmed)
        presentationMode.wrappedValue.dismiss()
    }
}
