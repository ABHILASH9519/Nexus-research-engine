import Common "../types/common";
import Chat "../types/chat";
import Projects "../types/projects";

module {

  public type MessageId = Chat.MessageId;
  public type ProjectId = Projects.ProjectId;

  public func createMessage(
    id : MessageId,
    projectId : ProjectId,
    role : Chat.MessageRole,
    content : Text,
    citations : [Chat.Citation],
    now : Common.Timestamp,
  ) : Chat.ChatMessage {
    {
      id;
      projectId;
      role;
      content;
      citations;
      createdAt = now;
    };
  };

  public func buildPrompt(
    messages : [Chat.ChatMessage],
    context : Text,
  ) : Text {
    var prompt = "Context:\n" # context # "\n\nConversation:\n";
    for (msg in messages.values()) {
      let roleText = switch (msg.role) {
        case (#user) "User";
        case (#assistant) "Assistant";
        case (#system_) "System";
      };
      prompt := prompt # roleText # ": " # msg.content # "\n";
    };
    prompt # "\nAssistant: ";
  };
};
