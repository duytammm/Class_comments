/* eslint-disable no-undef */
import React, { useState, useEffect } from "react";
import "./../popup/popup.css";

const options = ["Yếu", "Trung bình", "Khá", "Giỏi", "Xuất sắc"];

export default function Popup() {
  const [selected, setSelected] = useState(options[0]);
  const [customInput, setCustomInput] = useState("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("");

  const [lessonsData, setLessonsData] = useState({});
  const [subject, setSubject] = useState("");
  const [course, setCourse] = useState("");
  const [session, setSession] = useState("");
  const [lessonContent, setLessonContent] = useState([]);

  useEffect(() => {
    fetch(chrome.runtime.getURL("lessons.json"))
      .then((res) => res.json())
      .then((data) => setLessonsData(data))
      .catch((err) => {
        console.error("Không thể load lessons.json:", err);
        setStatus("Lỗi khi tải nội dung bài học.");
      });
  }, []);

  const injectLessonContentToPage = (contentArr) => {
    const content = contentArr.join("\n");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (content) => {
          const editor = document.querySelector(
            "div.ql-editor[contenteditable='true']"
          );
          if (editor) {
            editor.innerHTML = content
              .split("\n")
              .map((line) => `<p>${line}</p>`)
              .join("");
            editor.dispatchEvent(new Event("input", { bubbles: true }));
          }
        },
        args: [content],
      });
    });
  };

  const handleLoadLessonFromFile = () => {
    if (!subject || !course || !session) {
      setStatus("Vui lòng chọn đủ Môn học, Khóa học và Buổi học.");
      return;
    }

    const lesson = lessonsData?.[subject]?.[course]?.[session];
    if (lesson) {
      const contentArray = Array.isArray(lesson) ? lesson : lesson.split("\n");
      setLessonContent(contentArray);
      injectLessonContentToPage(contentArray);
      setStatus("Đã tìm và điền nội dung bài học!");
    } else {
      setLessonContent([]);
      setStatus("Không tìm thấy nội dung cho lựa chọn này.");
    }
  };

  const handleRun = () => {
    setStatus(" Đang tích nhận xét...");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (selectedLevel) => {
          const levelMap = {
            Yếu: 0,
            "Trung bình": 1,
            Khá: 2,
            Giỏi: 3,
            "Xuất sắc": 4,
          };
          const index = levelMap[selectedLevel];
          if (index === undefined) return;
          const rows = document.querySelectorAll('div[class^="jss"]');
          rows.forEach((row) => {
            const radios = row.querySelectorAll('input[type="radio"]');
            if (radios.length > index) {
              radios[index].click();
            }
          });
        },
        args: [selected],
      });
      setTimeout(() => setStatus("Đã tích xong!"), 1000);
    });
  };

  const handleGenerate = () => {
    if (!customInput.trim()) {
      setStatus("Vui lòng nhập nội dung yêu cầu trước.");
      return;
    }

    setStatus("Đang tạo nhận xét...");

    const prompt = `Hãy viết một đoạn ngắn nhận xét dựa trên nội dung sau: "${customInput}".`;
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

    chrome.runtime.sendMessage(
      { action: "generateComment", prompt, apiKey },
      (response) => {
        if (chrome.runtime.lastError) {
          setStatus("Lỗi: " + chrome.runtime.lastError.message);
          return;
        }

        if (response?.comment) {
          const comment = response.comment.trim();
          setComment(comment);
          setStatus("Đã tạo nhận xét!");
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              func: (comment) => {
                const editor = document.querySelector(
                  "div.ql-editor[contenteditable='true']"
                );
                if (editor) {
                  editor.innerHTML = comment
                    .split("\n")
                    .map((line) => `<p>${line}</p>`)
                    .join("");
                  editor.dispatchEvent(new Event("input", { bubbles: true }));
                } else {
                  alert("Không tìm thấy vùng nhập liệu (.ql-editor)");
                }
              },
              args: [comment],
            });
          });
        } else {
          setStatus("GPT không trả về nội dung nhận xét.");
        }
      }
    );
  };

  const courseOptions = subject
    ? Object.keys(lessonsData?.[subject] || {})
    : [];
  const sessionOptions =
    subject && course
      ? Object.keys(lessonsData?.[subject]?.[course] || {})
      : [];

  return (
    <div className="popup-container">
      <h3>Chọn nội dung bài học</h3>

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
        <option value="">-- Chọn Môn học --</option>
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
        <option value="">-- Chọn Khóa học --</option>
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
        <option value="">-- Chọn Buổi học --</option>
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
        Lấy & Điền nội dung bài học
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
        Tích nhận xét
      </button>

      <textarea
        value={customInput}
        onChange={(e) => setCustomInput(e.target.value)}
        placeholder="Nhập nội dung để viết nhận xét, yêu cầu có tên học sinh, xưng thầy hoặc cô..."
        className="popup-textarea"
      />

      <button onClick={handleGenerate} className="popup-button generate">
        Điền nhận xét
      </button>

      {comment && <div className="popup-comment-box">{comment}</div>}

      {status && <p className="popup-status">{status}</p>}
    </div>
  );
}
