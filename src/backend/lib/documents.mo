import Array "mo:core/Array";
import Text "mo:core/Text";
import Common "../types/common";
import Documents "../types/documents";
import Projects "../types/projects";

module {

  public type DocumentId = Documents.DocumentId;
  public type ProjectId = Projects.ProjectId;

  public func createDocument(
    id : DocumentId,
    projectId : ProjectId,
    title : Text,
    filename : Text,
    docType : Documents.DocumentType,
    blobRef : Blob,
    content : Text,
    owner : Common.UserId,
    now : Common.Timestamp,
  ) : Documents.Document {
    {
      id;
      projectId;
      title;
      filename;
      docType;
      blobRef;
      content;
      keywords = extractKeywords(content);
      owner;
      createdAt = now;
      updatedAt = now;
    };
  };

  public func extractKeywords(content : Text) : [Text] {
    let tokens = content.tokens(#char ' ');
    let words = Array.fromIter(tokens);
    let lowerWords = words.map(func(w) { w.toLower() });
    let filtered = lowerWords.filter(func(w) { w.size() >= 3 });
    let cleaned = filtered.map(
      func(w) {
        let chars = w.toArray();
        let cleanedChars = chars.filter(
          func(c) { Char.isAlphabetic(c) or Char.isDigit(c) },
        );
        Text.fromArray(cleanedChars);
      },
    );
    let nonEmpty = cleaned.filter(func(w) { w.size() >= 3 });
    // Simple deduplication by sorting and keeping unique
    let sorted = nonEmpty.sort();
    if (sorted.size() == 0) {
      return [];
    };
    var result : [Text] = [sorted[0]];
    for (i in Nat.range(1, sorted.size())) {
      let last = result[result.size() - 1];
      if (sorted[i] != last) {
        result := result.concat([sorted[i]]);
      };
    };
    result;
  };

  public func searchDocuments(
    searchQuery : Text,
    documents : [Documents.Document],
  ) : [Documents.SearchResult] {
    let queryWords = extractKeywords(searchQuery);
    if (queryWords.size() == 0) {
      return [];
    };

    let results = documents.map(
      func(doc) {
        var score : Nat = 0;
        for (qw in queryWords.values()) {
          for (kw in doc.keywords.values()) {
            if (kw == qw) {
              score += 1;
            } else if (kw.contains(#text qw)) {
              score += 1;
            };
          };
          if (doc.content.contains(#text qw)) {
            score += 1;
          };
          if (doc.title.contains(#text qw)) {
            score += 2;
          };
        };
        let snippetSize = Nat.min(200, doc.content.size());
        let snippet = if (snippetSize == 0) "" else {
          let chars = doc.content.toArray();
          Text.fromArray(chars.sliceToArray(0, snippetSize.toInt()));
        };
        {
          documentId = doc.id;
          title = doc.title;
          snippet;
          score;
        };
      },
    );

    let filtered = results.filter(func(r) { r.score > 0 });
    filtered.sort<Documents.SearchResult>(
      func(a, b) { Nat.compare(b.score, a.score) },
    );
  };

  public func toMetadata(doc : Documents.Document) : Documents.DocumentMetadata {
    {
      id = doc.id;
      projectId = doc.projectId;
      title = doc.title;
      filename = doc.filename;
      docType = doc.docType;
      owner = doc.owner;
      createdAt = doc.createdAt;
      updatedAt = doc.updatedAt;
    };
  };
};
