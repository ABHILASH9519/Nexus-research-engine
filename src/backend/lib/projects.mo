import Common "../types/common";
import Projects "../types/projects";

module {

  public type ProjectId = Projects.ProjectId;

  public func createProject(
    id : ProjectId,
    name : Text,
    description : Text,
    owner : Common.UserId,
    now : Common.Timestamp,
  ) : Projects.Project {
    {
      id;
      name;
      description;
      owner;
      status = #active;
      createdAt = now;
      updatedAt = now;
    };
  };

  public func archiveProject(project : Projects.Project) : Projects.Project {
    { project with status = #archived; updatedAt = project.updatedAt };
  };

  public func duplicateProject(
    project : Projects.Project,
    newId : ProjectId,
    now : Common.Timestamp,
  ) : Projects.Project {
    {
      project with
      id = newId;
      name = project.name # " (Copy)";
      status = #active;
      createdAt = now;
      updatedAt = now;
    };
  };

  public func toSummary(project : Projects.Project) : Projects.ProjectSummary {
    {
      id = project.id;
      name = project.name;
      description = project.description;
      status = project.status;
      createdAt = project.createdAt;
      updatedAt = project.updatedAt;
    };
  };
};
