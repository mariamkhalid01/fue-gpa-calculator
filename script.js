// Degree key mapping (numerical grade to grade points)
const gradePoints = [
    { min: 90.0, max: 100.0, points: 4.0 },
    { min: 85.0, max: 90.0, points: 3.7 },
    { min: 80.0, max: 85.0, points: 3.3 },
    { min: 75.0, max: 80.0, points: 3.0 },
    { min: 70.0, max: 75.0, points: 2.7 },
    { min: 65.0, max: 70.0, points: 2.3 },
    { min: 60.0, max: 65.0, points: 2.0 },
    { min: 55.0, max: 60.0, points: 1.7 },
    { min: 53.0, max: 55.0, points: 1.3 },
    { min: 50.0, max: 53.0, points: 1.0 },
    { min: 0.0, max: 50.0, points: 0.0 }
];

// Function to truncate a number to 3 decimal places (no rounding)
function truncateTo3Decimals(num) {
    return Math.floor(num * 1000) / 1000;
}

// Function to format a number to 3 decimal places (adding trailing zeros if needed)
function formatTo3Decimals(num) {
    const truncated = truncateTo3Decimals(num);
    return truncated.toFixed(3);
}

// Function to convert numerical grade to grade points
function getGradePoints(grade) {
    for (let range of gradePoints) {
        if (grade >= range.min && grade <= range.max) {
            return range.points;
        }
    }
    return 0.0; // Default to 0 if grade is invalid
}

// Generate input fields for subjects
function generateSubjectInputs() {
    const numSubjects = parseInt(document.getElementById('num-subjects').value);
    if (isNaN(numSubjects) || numSubjects < 1) {
        document.getElementById('subjects-input').innerHTML = '<p class="error">Please enter a valid number of subjects (at least 1).</p>';
        document.getElementById('calc-semester-btn').style.display = 'none';
        return;
    }

    let html = '';
    for (let i = 1; i <= numSubjects; i++) {
        html += `
            <div class="subject-row">
                <input type="number" id="grade-${i}" min="0" max="100" step="0.1" placeholder="Subject ${i} Grade (0-100)">
            </div>
        `;
    }
    document.getElementById('subjects-input').innerHTML = html;
    document.getElementById('calc-semester-btn').style.display = 'block';
    document.getElementById('semester-result').innerHTML = '';
}

// Calculate Semester GPA (truncate to 3 decimal places)
function calculateSemesterGPA() {
    const numSubjects = parseInt(document.getElementById('num-subjects').value);
    let totalPoints = 0;
    let tableRows = '';

    for (let i = 1; i <= numSubjects; i++) {
        const gradeInput = document.getElementById(`grade-${i}`);
        const grade = parseFloat(gradeInput.value);

        // Input validation
        if (isNaN(grade) || grade < 0 || grade > 100) {
            gradeInput.focus();
            document.getElementById('semester-result').innerHTML = `<p class="error">Please enter a valid grade (0-100) for Subject ${i}.</p>`;
            return;
        }

        const points = getGradePoints(grade);
        totalPoints += points;

        // Add row to summary table
        tableRows += `
            <tr>
                <td>Subject ${i}</td>
                <td>${grade.toFixed(1)}</td>
                <td>${points}</td>
            </tr>
        `;
    }

    const semesterGPA = totalPoints / numSubjects;
    const semesterGPADisplay = formatTo3Decimals(semesterGPA);
    const resultHTML = `
        <h3>Semester GPA: ${semesterGPADisplay}</h3>
        <table>
            <tr>
                <th>Subject</th>
                <th>Grade</th>
                <th>Points</th>
            </tr>
            ${tableRows}
            <tr>
                <td colspan="2"><strong>Total Points</strong></td>
                <td><strong>${totalPoints}</strong></td>
            </tr>
        </table>
    `;
    const resultElement = document.getElementById('semester-result');
    resultElement.innerHTML = resultHTML;
    resultElement.classList.add('animate__fadeIn');
}

// Reset Semester GPA Section
function resetSemester() {
    document.getElementById('num-subjects').value = '';
    document.getElementById('subjects-input').innerHTML = '';
    document.getElementById('semester-result').innerHTML = '';
    document.getElementById('calc-semester-btn').style.display = 'none';
}

// Generate input fields for semesters (for CGPA)
function generateSemesterInputs() {
    const numSemesters = parseInt(document.getElementById('num-semesters').value);
    if (isNaN(numSemesters) || numSemesters < 0) {
        document.getElementById('semesters-input').innerHTML = '<p class="error">Please enter a valid number of semesters (0 or more).</p>';
        document.getElementById('calc-cgpa-btn').style.display = 'none';
        return;
    }

    let html = '';
    for (let i = 1; i <= numSemesters; i++) {
        html += `
            <div class="semester-row">
                <input type="number" id="semester-gpa-${i}" min="0" max="4" step="0.01" placeholder="Semester ${i} GPA (0-4.0)">
            </div>
        `;
    }
    document.getElementById('semesters-input').innerHTML = html;
    document.getElementById('calc-cgpa-btn').style.display = 'block';
    document.getElementById('cgpa-result').innerHTML = '';
}

// Calculate CGPA (exclude current semester unless included)
function calculateCGPA() {
    const numSemesters = parseInt(document.getElementById('num-semesters').value);
    const includeCurrent = document.getElementById('include-current').checked;
    const currentSemesterGPA = parseFloat(document.getElementById('semester-result').querySelector('h3')?.textContent?.split(': ')[1]);

    // Validate previous semesters
    let totalGPA = 0;
    let tableRows = '';
    for (let i = 1; i <= numSemesters; i++) {
        const gpaInput = document.getElementById(`semester-gpa-${i}`);
        const gpa = parseFloat(gpaInput.value);

        if (isNaN(gpa) || gpa < 0 || gpa > 4) {
            gpaInput.focus();
            document.getElementById('cgpa-result').innerHTML = `<p class="error">Please enter a valid GPA (0-4.0) for Semester ${i}.</p>`;
            return;
        }

        totalGPA += gpa;
        tableRows += `
            <tr>
                <td>Semester ${i}</td>
                <td>${formatTo3Decimals(gpa)}</td>
            </tr>
        `;
    }

    let totalSemesters = numSemesters;
    if (includeCurrent) {
        if (isNaN(currentSemesterGPA)) {
            document.getElementById('cgpa-result').innerHTML = `<p class="error">Please calculate the current semester GPA first.</p>`;
            return;
        }
        totalGPA += currentSemesterGPA;
        totalSemesters += 1;
        tableRows += `
            <tr>
                <td>Current Semester</td>
                <td>${formatTo3Decimals(currentSemesterGPA)}</td>
            </tr>
        `;
    }

    if (totalSemesters === 0) {
        document.getElementById('cgpa-result').innerHTML = `<p class="error">Please include at least one semester to calculate CGPA.</p>`;
        return;
    }

    const cgpa = totalGPA / totalSemesters;
    const cgpaDisplay = formatTo3Decimals(cgpa);
    const resultHTML = `
        <h3>Your CGPA: ${cgpaDisplay}</h3>
        <table>
            <tr>
                <th>Semester</th>
                <th>GPA</th>
            </tr>
            ${tableRows}
            <tr>
                <td><strong>Total</strong></td>
                <td><strong>${totalGPA}</strong></td>
            </tr>
        </table>
    `;
    const resultElement = document.getElementById('cgpa-result');
    resultElement.innerHTML = resultHTML;
    resultElement.classList.add('animate__fadeIn');
}

// Reset CGPA Section
function resetCGPA() {
    document.getElementById('num-semesters').value = '';
    document.getElementById('include-current').checked = true;
    document.getElementById('semesters-input').innerHTML = '';
    document.getElementById('cgpa-result').innerHTML = '';
    document.getElementById('calc-cgpa-btn').style.display = 'none';
}