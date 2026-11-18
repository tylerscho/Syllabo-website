const form = document.querySelector("#points-form");
const result = document.querySelector("#points-result");

const corePoints = {
  A: { A: 3, B: 3, C: 2, D: 2 },
  B: { A: 3, B: 2, C: 2, D: 1 },
  C: { A: 2, B: 2, C: 1, D: 0 },
  D: { A: 2, B: 1, C: 0, D: 0 },
};

form.addEventListener("input", () => { result.textContent = ""; });

form.addEventListener("submit", (event) => {
  event.preventDefault();
  let subjectPoints = 0;
  for (let subject = 1; subject <= 6; subject += 1) {
    subjectPoints += Number(form.elements[`subject${subject}`].value);
  }

  const tok = form.elements.tok.value;
  const ee = form.elements.ee.value;
  if (tok === "E" || ee === "E") {
    result.textContent = `${subjectPoints} subject points. An E in TOK or the extended essay is a Diploma failing condition, so a combined Diploma total is unavailable.`;
    return;
  }

  const extra = corePoints[tok][ee];
  result.textContent = `${subjectPoints + extra} out of 45 (${subjectPoints} subject points + ${extra} core points).`;
});
