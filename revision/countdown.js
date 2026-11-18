const form = document.querySelector("#countdown-form");
const date = document.querySelector("#paper-date");
const result = document.querySelector("#countdown-result");
const millisecondsPerDay = 86_400_000;

date.addEventListener("input", () => { result.textContent = ""; });

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const today = new Date();
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const days = (date.valueAsNumber - todayUtc) / millisecondsPerDay;

  if (days < 0) {
    result.textContent = "That date has passed. Choose the date of an upcoming paper.";
  } else if (days === 0) {
    result.textContent = "Your first paper is today.";
  } else if (days === 1) {
    result.textContent = "1 day until your first paper.";
  } else {
    result.textContent = `${days} days until your first paper.`;
  }
});
