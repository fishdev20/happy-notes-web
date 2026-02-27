export enum NoteLayout {
  SOURCE = "source",
  DIFF = "diff",
  PREVIEW = "preview",
}

export enum NoteStatus {
  ACTIVE = "active",
  ARCHIVED = "archived",
  TRASH = "trash",
}

export default interface Note {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  content: string;
  tag: string[];
  status: NoteStatus;
  color: string;
}
