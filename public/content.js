/* eslint-disable no-undef */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "insertCommentToEditor") {
    const editor = document.querySelector("div.ql-editor[contenteditable='true']");

    if (editor) {
      const p = document.createElement("p");
      p.textContent = request.comment;
      editor.appendChild(p);
      // Kích hoạt sự kiện input để hệ thống biết nội dung đã thay đổi
      editor.dispatchEvent(new Event("input", { bubbles: true }));
      console.log("Đã chèn nhận xét:", request.comment);
    } else {
      console.warn("Không tìm thấy thẻ .ql-editor");
    }
  }
});
