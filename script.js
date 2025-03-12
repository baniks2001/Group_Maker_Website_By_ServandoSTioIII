document.getElementById('shuffleBtn').addEventListener('click', shuffleNames);
document.getElementById('resetBtn').addEventListener('click', reset);
document.getElementById('saveBtn').addEventListener('click', saveGroups);

let names = [];
let groups = [];
let groupLeaders = []; // Array to store group leaders

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

// Toggle leader input section
document.getElementById('addLeaderCheckbox').addEventListener('change', (e) => {
  const leaderInputSection = document.getElementById('leaderInputSection');
  if (e.target.checked) {
    leaderInputSection.classList.remove('d-none');
  } else {
    leaderInputSection.classList.add('d-none');
  }
});

async function shuffleNames() {
  const groupSize = parseInt(document.getElementById('groupSize').value);
  if (isNaN(groupSize) || groupSize <= 0) {
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

  // Play heartbeat sound
  const heartbeatSound = document.getElementById('heartbeatSound');
  heartbeatSound.play();

  // Show shuffling animation for 10 seconds
  const shufflingDuration = 10000; // 10 seconds
  const startTime = Date.now();

  const groupsTableBody = document.getElementById('groupsTableBody');
  groupsTableBody.innerHTML = ''; // Clear previous results

  // Display shuffling animation
  while (Date.now() - startTime < shufflingDuration) {
    const shuffledNames = shuffleArray([...names]); // Shuffle a copy of the names
    groupsTableBody.innerHTML = ''; // Clear previous animation frame

    // Display shuffled names in the table
    for (let i = 0; i < shuffledNames.length; i += groupSize) {
      const group = shuffledNames.slice(i, i + groupSize);
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>Group ${i / groupSize + 1}</td>
        <td>Shuffling...</td>
        <td>${group.join(', ')}</td>
      `;
      groupsTableBody.appendChild(row);
    }

    // Wait for a short time before the next animation frame
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Stop heartbeat sound
  heartbeatSound.pause();
  heartbeatSound.currentTime = 0;

  // Final shuffle and display groups
  for (let i = 0; i < 5; i++) {
    names = shuffleArray(names);
  }

  // Divide into groups and select a leader for each group if enabled
  groups = [];
  groupLeaders = []; // Reset group leaders
  const addLeader = document.getElementById('addLeaderCheckbox').checked;
  const leaderTitle = document.getElementById('leaderTitle').value;
  const numLeaders = parseInt(document.getElementById('numLeaders').value);

  for (let i = 0; i < names.length; i += groupSize) {
    const group = names.slice(i, i + groupSize);
    groups.push(group);

    if (addLeader) {
      const leaders = [];
      const remainingMembers = [...group]; // Copy of group to avoid modifying the original
      for (let j = 0; j < numLeaders && j < group.length; j++) {
        const leaderIndex = Math.floor(Math.random() * remainingMembers.length);
        const leader = remainingMembers.splice(leaderIndex, 1)[0]; // Remove leader from members
        leaders.push(leader);
      }
      groupLeaders.push(leaders.join(', '));
    } else {
      groupLeaders.push(''); // No leader
    }
  }

  displayGroups();
}

// Helper function to shuffle an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

function displayGroups() {
  const groupsTableBody = document.getElementById('groupsTableBody');
  groupsTableBody.innerHTML = ''; // Clear previous results

  // Add rows for each group
  const addLeader = document.getElementById('addLeaderCheckbox').checked;
  const leaderTitle = document.getElementById('leaderTitle').value;

  groups.forEach((group, index) => {
    const row = document.createElement('tr');
    const leaderCell = addLeader ? `<td>${groupLeaders[index]}</td>` : '';
    row.innerHTML = `
      <td>Group ${index + 1}</td>
      ${leaderCell}
      <td>${group.join(', ')}</td>
    `;
    groupsTableBody.appendChild(row);
  });

  // Hide or show the leader column in the table header
  const tableHeader = document.querySelector('#groupsContainer thead tr');
  tableHeader.innerHTML = `
    <th>Group</th>
    ${addLeader ? `<th>${leaderTitle}</th>` : ''}
    <th>Members</th>
  `;
}

function reset() {
  names = [];
  groups = [];
  groupLeaders = [];
  document.getElementById('groupsTableBody').innerHTML = '';
  document.getElementById('fileInput').value = '';
  document.getElementById('nameInput').value = '';
  document.getElementById('addLeaderCheckbox').checked = false;
  document.getElementById('leaderInputSection').classList.add('d-none');
  document.querySelector('#groupsContainer thead tr').innerHTML = `
    <th>Group</th>
    <th>Leader</th>
    <th>Members</th>
  `;
}

function saveGroups() {
  if (groups.length === 0) {
    alert('No groups to save.');
    return;
  }

  try {
    // Create a new PDF instance
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add a title to the PDF
    doc.setFontSize(18);
    doc.text("Shuffled Groups", 10, 10);

    // Prepare data for the table
    const addLeader = document.getElementById('addLeaderCheckbox').checked;
    const tableData = groups.map((group, index) => {
      return [`Group ${index + 1}`, addLeader ? groupLeaders[index] : '', group.join(', ')];
    });

    // Add the table to the PDF
    doc.autoTable({
      startY: 20, // Start below the title
      head: [['Group', addLeader ? 'Leader' : '', 'Members']], // Table header
      body: tableData, // Table body
      theme: 'grid', // Add borders to cells
      styles: {
        fontSize: 12,
        cellPadding: 5,
        valign: 'middle',
        halign: 'left',
      },
      headStyles: {
        fillColor: '#007bff', // Blue header
        textColor: '#ffffff', // White text
      },
      alternateRowStyles: {
        fillColor: '#f1f1f1', // Light gray for alternate rows
      },
    });

    // Save the PDF
    doc.save("shuffled_groups.pdf");
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  }
}

// Handle file upload
document.getElementById('fileInput').addEventListener('change', function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const content = e.target.result;
      names = content.split('\n').map(name => name.trim()).filter(name => name);
      alert('Names uploaded successfully!');
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Failed to read file. Please ensure it is a valid text file.');
    }
  };
  reader.onerror = function () {
    alert('Error reading file. Please try again.');
  };
  reader.readAsText(file);
});
