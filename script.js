document.getElementById('shuffleBtn').addEventListener('click', shuffleNames);
document.getElementById('resetBtn').addEventListener('click', reset);
document.getElementById('saveBtn').addEventListener('click', saveGroups);

let names = [];
let groups = [];

// Toggle between file upload and manual input
document.querySelectorAll('input[name="inputMethod"]').forEach((radio) => {
  radio.addEventListener('change', (e) => {
    const fileUploadSection = document.getElementById('fileUploadSection');
    const manualInputSection = document.getElementById('manualInputSection');

    if (e.target.value === 'upload') {
      fileUploadSection.classList.remove('d-none');
      manualInputSection.classList.add('d-none');
    } else {
      fileUploadSection.classList.add('d-none');
      manualInputSection.classList.remove('d-none');
    }
  });
});

function shuffleNames() {
  const groupSize = parseInt(document.getElementById('groupSize').value);
  if (isNaN(groupSize)) {
    alert('Please enter a valid group size.');
    return;
  }

  // Get names based on the selected input method
  const inputMethod = document.querySelector('input[name="inputMethod"]:checked').value;
  if (inputMethod === 'upload' && names.length === 0) {
    alert('Please upload a file or switch to manual input.');
    return;
  } else if (inputMethod === 'manual') {
    const nameInput = document.getElementById('nameInput').value;
    names = nameInput.split('\n').map(name => name.trim()).filter(name => name);
    if (names.length === 0) {
      alert('Please enter at least one name.');
      return;
    }
  }

  // Shuffle the names array
  names = names.sort(() => Math.random() - 0.5);

  // Divide into groups
  groups = [];
  for (let i = 0; i < names.length; i += groupSize) {
    groups.push(names.slice(i, i + groupSize));
  }

  displayGroups();
}

function displayGroups() {
  const groupsContainer = document.getElementById('groupsContainer');
  groupsContainer.innerHTML = '';

  groups.forEach((group, index) => {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'col-md-4 group';
    groupDiv.innerHTML = `<strong>Group ${index + 1}:</strong><br>${group.join('<br>')}`;
    groupsContainer.appendChild(groupDiv);
  });
}

function reset() {
  names = [];
  groups = [];
  document.getElementById('groupsContainer').innerHTML = '';
  document.getElementById('fileInput').value = '';
  document.getElementById('nameInput').value = '';
}

function saveGroups() {
  if (groups.length === 0) {
    alert('No groups to save.');
    return;
  }

  // Create a new PDF instance
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Set initial position for content
  let yPos = 20;

  // Add a title to the PDF
  doc.setFontSize(18);
  doc.text("Shuffled Groups", 10, yPos);
  yPos += 10;

  // Add each group to the PDF
  doc.setFontSize(12);
  groups.forEach((group, index) => {
    const groupText = `Group ${index + 1}: ${group.join(', ')}`;
    doc.text(groupText, 10, yPos);
    yPos += 10; // Move down for the next group
  });

  // Save the PDF
  doc.save("shuffled_groups.pdf");
}

// Handle file upload
document.getElementById('fileInput').addEventListener('change', function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const content = e.target.result;
    names = content.split('\n').map(name => name.trim()).filter(name => name);
    alert('Names uploaded successfully!');
  };
  reader.readAsText(file);
});