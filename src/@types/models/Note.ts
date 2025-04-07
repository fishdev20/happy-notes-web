export enum NoteLayout {
  SOURCE = "source",
  DIFF = "diff",
  PREVIEW = "preview",
}

export default interface Note {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  content: string;
  tag: string[];
}
