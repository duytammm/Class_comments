import React from "react";
import "./../popup/popup.css";
export default function CommentGenerator({
  customInput,
  setCustomInput,
  handleGenerate,
  comment,
}) {
  return (
    <>
      <textarea
        value={customInput}
        onChange={(e) => setCustomInput(e.target.value)}
        placeholder="Nhập nội dung để viết nhận xét"
        className="popup-textarea"
      />
      <button onClick={handleGenerate} className="popup-button generate">Điền nhận xét</button>
      {comment && <div className="popup-comment-box">{comment}</div>}
    </>
  );
}
