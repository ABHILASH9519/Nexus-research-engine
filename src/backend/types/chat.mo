import Common "./common";
import Projects "./projects";

module {

  public type MessageId = Projects.MessageId;

  public type MessageRole = {
    #user;
    #assistant;
    #system_;
  };

  public type ChatMessage = {
    id : MessageId;
    projectId : Projects.ProjectId;
    role : MessageRole;
    content : Text;
    citations : [Citation];
    createdAt : Common.Timestamp;
  };

  public type Citation = {
    documentId : Projects.DocumentId;
    title : Text;
    snippet : Text;
  };

  public type ChatSession = {
    projectId : Projects.ProjectId;
    messages : [ChatMessage];
    updatedAt : Common.Timestamp;
  };
};
