const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

// Firebase Admin 초기화
admin.initializeApp();
const db = admin.firestore();

// Gmail 설정 (보내는 주소와 앱 비밀번호 입력)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "YOUR_EMAIL@gmail.com",         // Gmail 주소
    pass: "YOUR_APP_PASSWORD",            // 앱 비밀번호 (2단계 인증 사용 시)
  },
});

// Cloud Function: Firestore 'inquiries' 문서가 추가되면 이메일 발송
exports.sendInquiryEmail = functions.firestore
  .document("inquiries/{docId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();

    const mailOptions = {
      from: `"착한소상공인마켓 문의 알림" <YOUR_EMAIL@gmail.com>`,
      to: "YOUR_RECEIVE_EMAIL@gmail.com", // 실제로 받을 이메일 주소
      subject: `[문의] ${data.name} 님의 메시지`,
      text: `
        이름: ${data.name}
        이메일: ${data.email}
        내용: ${data.message}
        시간: ${data.createdAt.toDate()}
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("문의 이메일 전송 성공");
    } catch (error) {
      console.error("이메일 전송 실패:", error);
    }
  });
