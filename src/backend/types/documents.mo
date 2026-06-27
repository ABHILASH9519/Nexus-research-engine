import Common "./common";
import Projects "./projects";

module {

  public type DocumentId = Projects.DocumentId;

  public type DocumentType = {
    #pdf;
    #docx;
    #txt;
    #markdown;
    #csv;
  };

  public type Document = {
    id : DocumentId;
    projectId : Projects.ProjectId;
    title : Text;
    filename : Text;
    docType : DocumentType;
    blobRef : Blob;
    content : Text;
    keywords : [Text];
    owner : Common.UserId;
    createdAt : Common.Timestamp;
    updatedAt : Common.Timestamp;
  };

  public type DocumentMetadata = {
    id : DocumentId;
    projectId : Projects.ProjectId;
    title : Text;
    filename : Text;
    docType : DocumentType;
    owner : Common.UserId;
    createdAt : Common.Timestamp;
    updatedAt : Common.Timestamp;
  };

  public type SearchResult = {
    documentId : DocumentId;
    title : Text;
    snippet : Text;
    score : Nat;
  };
};
