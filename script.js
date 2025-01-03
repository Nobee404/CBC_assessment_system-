document.addEventListener('DOMContentLoaded', function () {
  const subjects = ['ENGLISH', 'KISWAHILI', 'MATH'];
  const resultsTable = document.querySelector('#results-table');
  const subjectDropdown = document.getElementById('subject');
  const schoolNameInput = document.getElementById('school-name');
  const gradeInput = document.getElementById('grade');
  const termInput = document.getElementById('term');
  const yearInput = document.getElementById('year');

  // Populate initial subjects in the dropdown
  populateSubjectDropdown();

  // Add functionality for adding new subjects
  document.getElementById('add-subject-button').addEventListener('click', () => {
    const newSubject = prompt('Enter the new subject name:').trim().toUpperCase();

    if (newSubject) {
      if (!subjects.includes(newSubject)) {
        subjects.push(newSubject);
        populateSubjectDropdown(); // Refresh the dropdown
        addSubjectColumn(newSubject); // Add the new subject as a column
        alert(`${newSubject} has been added successfully.`);
      } else {
        alert(`${newSubject} already exists.`);
      }
    } else {
      alert('Invalid subject name. Please try again.');
    }
  });

  // Function to populate the subject dropdown
  function populateSubjectDropdown() {
    subjectDropdown.innerHTML = '';

    // Add subjects to the dropdown
    subjects.forEach((subject) => {
      const option = document.createElement('option');
      option.value = subject;
      option.textContent = subject;
      subjectDropdown.appendChild(option);
    });
  }

  // Function to add a new subject column
  function addSubjectColumn(subject) {
    const headerRow = resultsTable.rows[2];
    const newHeaderCell = document.createElement('th');
    newHeaderCell.textContent = subject;
    newHeaderCell.style.textAlign = 'center'; // Center align header
    headerRow.insertBefore(newHeaderCell, headerRow.cells[headerRow.cells.length - 1]);

    Array.from(resultsTable.rows)
      .slice(3) // Skip header rows
      .forEach((row) => {
        const newCell = document.createElement('td');
        newCell.textContent = 0;
        newCell.style.textAlign = 'center'; // Center align cells
        row.insertBefore(newCell, row.cells[row.cells.length - 1]);
      });
  }

  // Add form submission handling
  document.getElementById('assessment-form').addEventListener('submit', (event) => {
    event.preventDefault();

    const schoolName = schoolNameInput.value.trim();
    const grade = gradeInput.value.trim();
    const term = termInput.value;
    const year = yearInput.value;
    const learnerName = document.getElementById('learner-name').value.trim();
    const subject = subjectDropdown.value;
    const score = parseInt(document.getElementById('score').value);

    if (!schoolName || !grade || !term || !year || !learnerName || !subject || isNaN(score)) {
      alert('Please fill out all fields correctly.');
      return;
    }

    // Add school and grade information to the table header
    document.getElementById('school-name-header').textContent = schoolName;
    document.getElementById('grade-term-year-header').textContent = `${grade}, ${term}, ${year}`;

    // Check if the learner already exists
    let learnerRow = Array.from(resultsTable.rows).find(
      (row) => row.cells[1]?.textContent === learnerName
    );

    if (learnerRow) {
      const existingScore = learnerRow.cells[subjects.indexOf(subject) + 2].textContent;
      if (existingScore !== '0') {
        const userResponse = window.confirm(
          `Score for ${subject} is already entered for ${learnerName}. Do you want to update it?`
        );
        if (!userResponse) {
          alert(`The score for ${learnerName} in ${subject} was not updated.`);
          return;
        }
      }
    } else {
      // Add a new row for the learner
      learnerRow = resultsTable.insertRow();
      learnerRow.innerHTML = `
        <td style="text-align: center;">0</td> <!-- Rank -->
        <td style="text-align: center;">${learnerName}</td>
        ${subjects.map(() => '<td style="text-align: center;">0</td>').join('')}
        <td style="text-align: center;">0</td> <!-- Total -->
      `;
    }

    // Update the score for the selected subject
    const subjectIndex = subjects.indexOf(subject) + 2; // Account for Rank and Name columns
    learnerRow.cells[subjectIndex].textContent = score;

    // Update the total score
    const totalScore = Array.from(learnerRow.cells)
      .slice(2, -1)
      .reduce((sum, cell) => sum + parseInt(cell.textContent || 0), 0);
    learnerRow.cells[learnerRow.cells.length - 1].textContent = totalScore;

    // Update rankings
    updateRankings();

    // Notify user that score has been entered successfully
    alert(`Score for ${learnerName} in ${subject} has been recorded.`);
  });

  // Update rankings dynamically
  function updateRankings() {
    const rows = Array.from(resultsTable.rows).slice(3); // Skip header rows
    rows.sort((a, b) => {
      const totalA = parseInt(a.cells[a.cells.length - 1].textContent || 0);
      const totalB = parseInt(b.cells[b.cells.length - 1].textContent || 0);
      return totalB - totalA; // Sort in descending order
    });

    rows.forEach((row, index) => {
      row.cells[0].textContent = index + 1; // Correctly assign rank
      resultsTable.tBodies[0].appendChild(row); // Reorder rows
    });
  }

  // Download table as Excel
  document.getElementById('download-excel').addEventListener('click', () => {
    const wb = XLSX.utils.table_to_book(resultsTable, {
      sheet: 'Results',
      cellStyles: true,
    });
    const ws = wb.Sheets['Results'];
    Object.keys(ws).forEach((cell) => {
      if (!cell.startsWith('!')) {
        ws[cell].s = {
          alignment: { horizontal: 'center', vertical: 'center' },
        };
      }
    });
    XLSX.writeFile(wb, 'results.xlsx');
  });

  // Print table
  document.getElementById('print').addEventListener('click', () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Results</title>
          <style>
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid black;
              padding: 5px;
              text-align: center;
            }
            th {
              background-color: #f2f2f2;
            }
          </style>
        </head>
        <body>
          <h1>School Assessment Management System</h1>
          ${document.getElementById('results-container').innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  });

  // Add keyboard navigation functionality
  document.getElementById('assessment-form').addEventListener('keydown', (event) => {
    const focusableElements = Array.from(document.querySelectorAll('input, select, button'));
    const currentIndex = focusableElements.indexOf(document.activeElement);

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      // Move to next element
      const nextIndex = Math.min(currentIndex + 1, focusableElements.length - 1);
      focusableElements[nextIndex].focus();
      event.preventDefault();
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      // Move to previous element
      const prevIndex = Math.max(currentIndex - 0, 0);
      focusableElements[prevIndex].focus();
      event.preventDefault();
    }
  });
});
