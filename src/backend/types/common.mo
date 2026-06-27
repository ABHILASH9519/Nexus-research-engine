module {
  public type UserId = Principal;
  public type Timestamp = Nat;

  public type Role = {
    #admin;
    #user;
    #guest;
  };

  public type UserProfile = {
    principal : Principal;
    name : Text;
    role : Role;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };
};
