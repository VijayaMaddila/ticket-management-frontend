import React from "react";
import { formatCommentDate } from "./formatDate";

const CommentItem = ({ comment, isOutgoing }) => {
  const displayName = isOutgoing ? "You" : (comment?.user?.name || "User");
  const rawName = comment?.user?.name || "User";
  const initials = rawName
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";
  const role = comment?.user?.role ?? "";
  const text = comment?.comment ?? "";
  const time = formatCommentDate(comment?.createdAt);

  const metaParts = [role, time].filter(Boolean).join(" · ");

  return (
    <div className={`comment-row ${isOutgoing ? "outgoing" : ""}`}>
      <div className="comment-avatar" aria-hidden>
        {initials}
      </div>
      <div className="comment-body">
        <div className="comment-byline">
          <span className="comment-name">{displayName}</span>
          {metaParts && <span className="comment-meta">{metaParts}</span>}
        </div>
        <div className="comment-message">
          {text}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
