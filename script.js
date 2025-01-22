document.addEventListener('DOMContentLoaded', function () {
  const subjects = ['English', 'Kiswahili', 'Math'];
  const resultsTable = document.querySelector('#results-table');
  const subjectDropdown = document.getElementById('subject');

  populateSubjectDropdown();
  loadFromLocalStorage();
  
  document.getElementById('add-subject-button').addEventListener('click', () => {
    const newSubject = prompt('Enter the new subject name:').trim();

    if (newSubject) {
      if (!subjects.includes(newSubject)) {
        subjects.push(newSubject);
        populateSubjectDropdown();
        addSubjectColumn(newSubject);
        alert(`${newSubject} has been added successfully.`);
      } else {
        alert(`${newSubject} already exists.`);
      }
    }
  });

  document.getElementById('assessment-form').addEventListener('submit', (event) => {
    event.preventDefault();
    
    const learnerName = document.getElementById('learner-name').value.trim();
    const subject = subjectDropdown.value;
    const score = parseInt(document.getElementById('score').value);

    if (!learnerName || !subject || isNaN(score)) {
      alert('Please fill out all fields correctly.');
      return;
    }

    let learnerRow = Array.from(resultsTable.rows).find(row => row.cells[1]?.textContent === learnerName);

    if (!learnerRow) {
      learnerRow = resultsTable.insertRow();
      learnerRow.innerHTML = `<td>0</td><td>${learnerName}</td>${subjects.map(() => '<td>0</td>').join('')}<td>0</td>`;
    }

    const subjectIndex = subjects.indexOf(subject) + 2;
    learnerRow.cells[subjectIndex].textContent = score;
    updateTotalAndRanking();

    saveToLocalStorage();
  });

  document.getElementById('print').addEventListener('click', () => {
    window.print();
  });

  function populateSubjectDropdown() {
    subjectDropdown.innerHTML = subjects.map(subject => `<option value="${subject}">${subject}</option>`).join('');
  }

  function addSubjectColumn(subject) {
    const headerRow = resultsTable.rows[0];
    const newHeaderCell = document.createElement('th');
    newHeaderCell.textContent = subject;
    headerRow.insertBefore(newHeaderCell, headerRow.cells[headerRow.cells.length - 1]);

    Array.from(resultsTable.rows).slice(1).forEach(row => {
      const newCell = document.createElement('td');
      newCell.textContent = 0;
      row.insertBefore(newCell, row.cells[row.cells.length - 1]);
    });
  }

  function updateTotalAndRanking() {
    const rows = Array.from(resultsTable.rows).slice(1);
    rows.forEach(row => {
      const total = Array.from(row.cells).slice(2, -1).reduce((sum, cell) => sum + parseInt(cell.textContent), 0);
      row.cells[row.cells.length - 1].textContent = total;
    });
    
    rows.sort((a, b) => parseInt(b.cells[b.cells.length - 1].textContent) - parseInt(a.cells[a.cells.length - 1].textContent));
    rows.forEach((row, index) => {
      row.cells[0].textContent = index + 1;
      resultsTable.tBodies[0].appendChild(row);
    });
  }

  function saveToLocalStorage() {
    const data = Array.from(resultsTable.rows).slice(1).map(row => ({
      name: row.cells[1].textContent,
      scores: Array.from(row.cells).slice(2, -1).map(cell => parseInt(cell.textContent)),
      total: parseInt(row.cells[row.cells.length - 1].textContent),
    }));
    localStorage.setItem('assessmentData', JSON.stringify(data));
  }

  function loadFromLocalStorage() {
    const data = JSON.parse(localStorage.getItem('assessmentData') || '[]');
    data.forEach(({ name, scores, total }) => {
      const row = resultsTable.insertRow();
      row.innerHTML = `<td>0</td><td>${name}</td>${scores.map(score => `<td>${score}</td>`).join('')}<td>${total}</td>`;
    });
    updateTotalAndRanking();
  }
});
