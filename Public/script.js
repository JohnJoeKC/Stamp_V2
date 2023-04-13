function checkAnswer(questionNumber, correctAnswer, userAnswer, buttonElement) {
    var questionDiv = document.getElementById("question" + questionNumber);
    var buttons = questionDiv.getElementsByTagName("button");

    for (var i = 0; i < buttons.length; i++) {
        buttons[i].disabled = true;
        if (parseFloat(buttons[i].dataset.answer) === parseFloat(correctAnswer)) {
            buttons[i].classList.add("correct");
        } else {
            buttons[i].classList.add("incorrect");
        }
    }

    if (parseFloat(userAnswer) === parseFloat(correctAnswer)) {
        correctAnswersCount++;
    }
    totalAnswersCount++;
    updateCounter();
}
