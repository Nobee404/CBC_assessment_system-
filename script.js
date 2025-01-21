document.addEventListener('DOMContentLoaded', function () {
  const subjects = ['ENGLISH', 'KISWAHILI', 'MATH'];
  const resultsTable = document.querySelector('#results-table');
  const subjectDropdown = document.getElementById('subject');
  const schoolNameInput = document.getElementById('school-name');
  const gradeInput = document.getElementById('grade');
  const termInput = document.getElementById('term');
  const yearInput = document.getElementById('year');
  const rubricInput = document.getElementById('rubric');

  populateSubjectDropdown();

  document.getElementById('add-subject-button').addEventListener('click', () => {
    const newSubject = prompt('Enter the new subject name:').trim().toUpperCase();

    if (newSubject) {
      if (!subjects.includes(newSubject)) {
        subjects.push(newSubject);
        populateSubjectDropdown();
        addSubjectColumn(newSubject);
        alert(`${newSubject} has been added successfully.`);
      } else {
        alert(`${newSubject} already exists.`);
      }
    } else {
      alert('Invalid subject name. Please try again.');
    }
  });

  function populateSubjectDropdown() {
    subjectDropdown.innerHTML = '';
    subjects.forEach((subject) => {
      const option = document.createElement('option');
      option.value = subject;
      option.textContent = subject;
      subjectDropdown.appendChild(option);
    });
  }

  function addSubjectColumn(subject) {
    const headerRow = resultsTable.rows[2];
    const totalIndex = headerRow.cells.length - 1;

    const newHeaderCell = document.createElement('th');
    newHeaderCell.textContent = subject;
    headerRow.insertBefore(newHeaderCell, headerRow.cells[totalIndex]);

    const newRubricHeaderCell = document.createElement('th');
    newRubricHeaderCell.textContent = `Rubric (${subject})`;
    headerRow.insertBefore(newRubricHeaderCell, headerRow.cells[totalIndex]);

    Array.from(resultsTable.rows).slice(3).forEach((row) => {
      const newCell = document.createElement('td');
      newCell.textContent = 0;
      row.insertBefore(newCell, row.cells[totalIndex]);

      const newRubricCell = document.createElement('td');
      newRubricCell.textContent = '';
      row.insertBefore(newRubricCell, row.cells[totalIndex]);
    });
  }

  document.getElementById('assessment-form').addEventListener('submit', (event) => {
    event.preventDefault();

    const schoolName = schoolNameInput.value.trim();
    const grade = gradeInput.value.trim();
    const term = termInput.value;
    const year = yearInput.value;
    const learnerName = document.getElementById('learner-name').value.trim();
    const subject = subjectDropdown.value;
    const score = parseInt(document.getElementById('score').value);
    const rubric = rubricInput.value.trim();

    if (!schoolName || !grade || !term || !year || !learnerName || !subject || isNaN(score) || !rubric) {
      alert('Please fill out all fields correctly.');
      return;
    }

    document.getElementById('school-name-header').textContent = schoolName;
    document.getElementById('grade-term-year-header').textContent = `${grade}, ${term}, ${year}`;

    let learnerRow = Array.from(resultsTable.rows).find(
      (row) => row.cells[1]?.textContent === learnerName
    );

    if (!learnerRow) {
      learnerRow = resultsTable.insertRow();
      learnerRow.innerHTML = `
        <td>0</td>
        <td>${learnerName}</td>
        ${subjects.map(() => '<td>0</td><td></td>').join('')}
        <td>0</td>
      `;
    }

    const subjectIndex = subjects.indexOf(subject) * 2 + 2;
    learnerRow.cells[subjectIndex].textContent = score;
    learnerRow.cells[subjectIndex + 1].textContent = rubric;

    const totalScore = Array.from(learnerRow.cells)
      .slice(2, -1)
      .filter((_, i) => i % 2 === 0)
      .reduce((sum, cell) => sum + parseInt(cell.textContent || 0), 0);
    learnerRow.cells[learnerRow.cells.length - 1].textContent = totalScore;

    updateRankings();

    alert(`Score for ${learnerName} in ${subject} has been recorded.`);
  });

  function updateRankings() {
    const rows = Array.from(resultsTable.rows).slice(3);
    rows.sort((a, b) => {
      const totalA = parseInt(a.cells[a.cells.length - 1].textContent || 0);
      const totalB = parseInt(b.cells[b.cells.length - 1].textContent || 0);
      return totalB - totalA;
    });

    rows.forEach((row, index) => {
      row.cells[0].textContent = index + 1;
      resultsTable.tBodies[0].appendChild(row);
    });
  }

  document.getElementById('download-excel').addEventListener('click', () => {
    const wb = XLSX.utils.table_to_book(resultsTable, { sheet: 'Results', cellStyles: true });
    XLSX.writeFile(wb, 'Results.xlsx');
  });

  document.getElementById('download-pdf').addEventListener('click', () => {
    const doc = new jsPDF();
    doc.autoTable({ html: '#results-table' });
    doc.save('results.pdf');
  });

  document.getElementById('print').addEventListener('click', () => {
    window.print();
  });
});
