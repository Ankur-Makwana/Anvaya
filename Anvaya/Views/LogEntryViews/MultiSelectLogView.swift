import SwiftUI
import SwiftData

struct MultiSelectLogView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    let activity: Activity
    let existingLog: DayLog?

    @State private var selectedTags: Set<String> = []
    @State private var newTag: String = ""
    @State private var showingAddTag = false

    var body: some View {
        VStack(spacing: 20) {
            Text(activity.emoji)
                .font(.system(size: 50))

            // Tag grid
            FlowLayout(spacing: 8) {
                ForEach(activity.tags, id: \.self) { tag in
                    Button {
                        toggleTag(tag)
                    } label: {
                        Text(tag)
                            .font(.subheadline)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 8)
                            .background(selectedTags.contains(tag) ? Color.green : Color(.tertiarySystemGroupedBackground))
                            .foregroundStyle(selectedTags.contains(tag) ? .white : .primary)
                            .cornerRadius(20)
                    }
                }

                // Add new tag button
                Button {
                    showingAddTag = true
                } label: {
                    Label("Add", systemImage: "plus")
                        .font(.subheadline)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(Color(.tertiarySystemGroupedBackground))
                        .cornerRadius(20)
                }
            }
            .padding(.horizontal)

            if !selectedTags.isEmpty {
                Text("\(selectedTags.count) selected")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
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
        .alert("Add Muscle Group", isPresented: $showingAddTag) {
            TextField("Name", text: $newTag)
            Button("Add") {
                addNewTag()
            }
            Button("Cancel", role: .cancel) {
                newTag = ""
            }
        }
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
        activity.tags.append(trimmed)
        selectedTags.insert(trimmed)
        newTag = ""
    }

    private func saveLog() {
        let tagArray = Array(selectedTags).sorted()

        if let existing = existingLog {
            existing.selectedTags = tagArray
            existing.timestamp = Date()
        } else {
            let log = DayLog(
                activityId: activity.id,
                date: Date().dayString,
                selectedTags: tagArray
            )
            modelContext.insert(log)
        }
        dismiss()
    }
}

// MARK: - FlowLayout (wrapping tag grid)

struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = arrange(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = arrange(proposal: proposal, subviews: subviews)
        for (index, position) in result.positions.enumerated() {
            subviews[index].place(
                at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y),
                proposal: ProposedViewSize(result.sizes[index])
            )
        }
    }

    private func arrange(proposal: ProposedViewSize, subviews: Subviews) -> ArrangeResult {
        let maxWidth = proposal.width ?? .infinity
        var positions: [CGPoint] = []
        var sizes: [CGSize] = []
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > maxWidth, x > 0 {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            positions.append(CGPoint(x: x, y: y))
            sizes.append(size)
            rowHeight = max(rowHeight, size.height)
            x += size.width + spacing
        }

        return ArrangeResult(
            size: CGSize(width: maxWidth, height: y + rowHeight),
            positions: positions,
            sizes: sizes
        )
    }

    struct ArrangeResult {
        var size: CGSize
        var positions: [CGPoint]
        var sizes: [CGSize]
    }
}
