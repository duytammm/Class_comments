import React from "react";
import "./../popup/popup.css";

export default function EvaluationSelector({
  selected,
  setSelected,
  handleRun,
}) {
  const options = ["Yếu", "Trung bình", "Khá", "Giỏi", "Xuất sắc"];
  return (
    <>
      <h3 style={{ marginTop: 20 }}>Chọn mức đánh giá</h3>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="popup-select"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <button onClick={handleRun} className="popup-button evaluate">
        Tích đánh giá
      </button>
    </>
  );
}
