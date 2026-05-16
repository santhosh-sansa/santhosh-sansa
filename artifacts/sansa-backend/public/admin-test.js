const button = document.getElementById('testBtn');
const question = document.getElementById('testQuestion');
const output = document.getElementById('testOutput');

button.addEventListener('click', async () => {
  output.textContent = 'Searching...';
  const response = await fetch('/admin/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: question.value }),
  });
  const data = await response.json();
  output.textContent = JSON.stringify(data, null, 2);
});
