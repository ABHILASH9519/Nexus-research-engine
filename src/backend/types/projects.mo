import Common "./common";

module {

  public type ProjectId = Nat;
  public type DocumentId = Nat;
  public type MessageId = Nat;
  public type AgentRunId = Nat;
  public type ReportId = Nat;
  public type BookmarkId = Nat;
  public type NoteId = Nat;

  public type ProjectStatus = {
    #active;
    #archived;
  };

  public type Project = {
    id : ProjectId;
    name : Text;
    description : Text;
    owner : Common.UserId;
    status : ProjectStatus;
    createdAt : Common.Timestamp;
    updatedAt : Common.Timestamp;
  };

  public type ProjectSummary = {
    id : ProjectId;
    name : Text;
    description : Text;
    status : ProjectStatus;
    createdAt : Common.Timestamp;
    updatedAt : Common.Timestamp;
  };
};
