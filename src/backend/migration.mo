import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  type OldComment = {
    id : Nat;
    postId : Nat;
    author : Principal;
    content : Text;
    timestamp : Time.Time;
    likedBy : [Principal];
    authorName : ?Text;
    authorProfilePicture : ?Blob;
    isLikedByCurrentUser : Bool;
  };

  type OldPost = {
    id : Nat;
    author : Principal;
    content : Text;
    timestamp : Time.Time;
    likedBy : [Principal];
    authorName : ?Text;
    authorProfilePicture : ?Blob;
    isLikedByCurrentUser : Bool;
  };

  type OldUserRelationship = {
    follower : Principal;
    following : Principal;
    timestamp : Time.Time;
  };

  type OldUserProfile = {
    username : Text;
    name : ?Text;
    bio : ?Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    displayName : Text;
    followersCount : Nat;
    followingCount : Nat;
    postsCount : Nat;
    isFollowedByCurrentUser : Bool;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    posts : Map.Map<Nat, OldPost>;
    comments : Map.Map<Nat, OldComment>;
    relationships : Map.Map<Text, OldUserRelationship>;
  };

  public func run(old : OldActor) : {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    posts : Map.Map<Nat, OldPost>;
    comments : Map.Map<Nat, OldComment>;
    relationships : Map.Map<Text, OldUserRelationship>;
  } {
    old;
  };
};
