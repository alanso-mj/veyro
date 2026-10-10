function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  document.getElementById(screenId).classList.add("active");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function selectOption(button) {
  document.querySelectorAll(".option").forEach(option => {
    option.classList.remove("selected");
  });

  button.classList.add("selected");
}

function nextPreview() {
  showScreen("transition");
}

function shareResult() {
  const message =
    "I'm testing my football knowledge on VEYRO! ⚽ Can you beat my score?";

  if (navigator.share) {
    navigator.share({
      title: "VEYRO Football Quiz",
      text: message,
      url: window.location.href
    }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(
      message + "\n" + window.location.href
    ).then(() => {
      alert("Challenge message copied!");
    }).catch(() => {
      alert(message);
    });
  } else {
    alert(message);
  }
}