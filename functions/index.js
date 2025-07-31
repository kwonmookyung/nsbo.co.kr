const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

// Firebase Admin SDK 초기화
initializeApp();
const db = getFirestore();

// 서울 리전에 Cloud Function 생성
exports.logInquiry = onDocumentCreated(
  {
    document: "inquiries/{docId}",
    region: "asia-northeast3", // ✅ 서울 리전 지정
  },
  (event) => {
    const data = event.data.data();

    console.log("📨 새로운 문의가 등록되었습니다:");
    console.log(`이름: ${data.name}`);
    console.log(`이메일: ${data.email}`);
    console.log(`내용: ${data.message}`);
    console.log(`시간: ${data.createdAt}`);
  }
);