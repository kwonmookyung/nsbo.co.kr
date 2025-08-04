// scripts.js

document.addEventListener("DOMContentLoaded", () => {
  fetch('./data/question.json')
    .then(response => {
      if (!response.ok) throw new Error("질문 데이터를 불러오는 데 실패했습니다.");
      return response.json();
    })
    .then(data => {
      renderSurvey(data);
    })
    .catch(error => {
      console.error("에러:", error);
    });
});

function renderSurvey(questions) {
  const container = document.getElementById('survey-container');

  questions.forEach((q, idx) => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('question-block');

    const questionTitle = document.createElement('p');
    questionTitle.textContent = `${idx + 1}. ${q.question}`;
    wrapper.appendChild(questionTitle);

    // 보기 생성 (radio)
    q.options.forEach((opt, i) => {
      const label = document.createElement('label');
      label.style.display = 'block';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `question_${idx}`;
      input.value = opt;

      label.appendChild(input);
      label.append(` ${opt}`);
      wrapper.appendChild(label);
    });

    container.appendChild(wrapper);
  });

  // 제출 버튼
  const submitBtn = document.createElement('button');
  submitBtn.textContent = '제출하기';
  submitBtn.classList.add('submit-btn');
  submitBtn.addEventListener('click', handleSubmit);
  container.appendChild(submitBtn);
}

function handleSubmit() {
  const responses = {};
  const questionBlocks = document.querySelectorAll('.question-block');

  questionBlocks.forEach((block, idx) => {
    const selected = block.querySelector(`input[name="question_${idx}"]:checked`);
    responses[`Q${idx + 1}`] = selected ? selected.value : null;
  });

  console.log("설문 응답 결과:", responses);

  // 예시로 결과 페이지로 이동 (나중에 Firebase 저장 등 추가 가능)
  localStorage.setItem("surveyAnswers", JSON.stringify(responses));
  window.location.href = 'result.html';
}
