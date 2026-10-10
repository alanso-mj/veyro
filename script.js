// Interface preview only: these controls switch between design screens.
// Real question logic and scoring will be added in a later step.
const screens = document.querySelectorAll('.screen');
function showScreen(id) {
  screens.forEach(screen => screen.classList.toggle('active', screen.id === id));
  window.scrollTo({top: 0, behavior: 'smooth'});
}
document.querySelectorAll('[data-screen]').forEach(button => {
  button.addEventListener('click', event => {
    event.preventDefault();
    showScreen(button.dataset.screen);
  });
});
document.querySelectorAll('.answer').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.answer').forEach(answer => answer.classList.remove('selected'));
    button.classList.add('selected');
  });
});
