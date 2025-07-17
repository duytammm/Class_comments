import React from "react";
import "./../popup/popup.css";

export default function LessonSelector({
  lessonsData,
  subject,
  course,
  session,
  lessonContent,
  setSubject,
  setCourse,
  setSession,
  setLessonContent,
  setStatus,
  handleLoadLessonFromFile,
}) {
  const courseOptions = subject
    ? Object.keys(lessonsData?.[subject] || {})
    : [];
  const sessionOptions =
    subject && course
      ? Object.keys(lessonsData?.[subject]?.[course] || {})
      : [];
  return (
    <>
      <h3>Chọn nội dung buổi học</h3>
      <select
        value={subject}
        onChange={(e) => {
          setSubject(e.target.value);
          setCourse("");
          setSession("");
          setLessonContent([]);
          setStatus("");
        }}
        className="popup-select"
      >
        <option>Chọn môn học</option>
        {Object.keys(lessonsData).map((subj) => (
          <option key={subj} value={subj}>
            {subj}
          </option>
        ))}
      </select>
      <select
        value={course}
        onChange={(e) => {
          setCourse(e.target.value);
          setSession("");
          setLessonContent([]);
          setStatus("");
        }}
        disabled={!subject}
        className="popup-select"
      >
        <option value="">Chọn khóa học</option>
        {courseOptions.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select
        value={session}
        onChange={(e) => {
          setSession(e.target.value);
          setLessonContent([]);
          setStatus("");
        }}
        disabled={!course}
        className="popup-select"
      >
        <option>Chọn buổi học</option>
        {sessionOptions.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <button
        onClick={handleLoadLessonFromFile}
        className="popup-button lesson"
      >
        Điền nội dung buổi học
      </button>
      {lessonContent.length > 0 && (
        <div className="popup-lesson-preview">
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            {lessonContent.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
