import AddNoteCard from "@/components/add-note-card";

export default function Notes() {
  return (
    <div>
      {/* <CategoryFilter /> */}
      <div className="grid grid-cols-1 gap-8 p-4 md:grid-cols-2 lg:grid-cols-3">
        <AddNoteCard />
        {/* {mockNotes.map((note) => (
          <NotePreview note={note} key={note.id} />
        ))} */}
      </div>
    </div>
  );
}
