/* eslint-disable no-undef */
const GEMINI_API_KEY = "AIzaSyCmAY28YwVB3lzN_G08nC2I1BqL018dPt0";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "generateComment") {
    (async () => {
      try {
        const result = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: request.prompt }] }],
            }),
          }
        );

        const data = await result.json();
        const message = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (message) {
          sendResponse({ comment: message });

          // Gửi sang content script để chèn vào .ql-editor
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: "insertCommentToEditor",
              comment: message,
            });
          });
        } else {
          sendResponse({ comment: null });
          console.warn("Gemini không trả về nội dung.");
        }
      } catch (error) {
        console.error("Gemini API error:", error);
        sendResponse({ comment: null });
      }
    })();

    return true;
  }
});
