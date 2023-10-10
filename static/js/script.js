//VARIABLE PREDEFINED
let story_data = { "Summary": "", "Rationale": "", "Story": ""};
let storySave = 1;
let timeline_data = {};
let timelineSave = 1;
let currentRowId = null;
let timelineNextId = 1;

let standardDataPaths = {};
let standardsData = {};

  


//////////////////////////TextAreas Show/ Hide//////////////////////////
document.getElementById('toggleStoryText').addEventListener('change', function() {
  var textArea = document.getElementById('storyTextArea');
  if(this.checked) {
      textArea.style.display = 'block'; // show text area
  } else {
      textArea.style.display = 'none'; // hide text area
  }
});

document.getElementById('toggleTimelineText').addEventListener('change', function() {
  var textArea = document.getElementById('timelineTextArea');
  if(this.checked) {
      textArea.style.display = 'block'; // show text area
  } else {
      textArea.style.display = 'none'; // hide text area
  }
});


///////////////////////////STORY//////////////////////////
//story text area update
function updateStoryDisplay() {
  document.getElementById('storyTextArea').textContent = JSON.stringify(story_data, null, 2);
}

function updateTimelineDisplay() {
  document.getElementById('timelineTextArea').textContent = JSON.stringify(timeline_data, null, 2);
}


//story story_data variable update
document.getElementById("storyTableBody").addEventListener('input', function (e) {
  if (e.target && e.target.nodeName === "TD") {
      const row = e.target.closest('tr');
      const key = row.getAttribute('data-key');
      story_data[key] = e.target.textContent;
      updateStoryDisplay();
  }
});

 
//story history save
$('#story-history-button').click(function() {
  let headingVar = "storyHeading" + storySave;
  let collapseVar = "storyCollapse" + storySave;
  
  let formattedStoryData = '';
  
  // Assuming story_data is a single object
  for (let key in story_data) {
    if (story_data.hasOwnProperty(key)) { // Check if the key exists in the object
      formattedStoryData += `<strong>${key}:</strong> ${story_data[key]}<br/>`;
    }
  }
  
  let html_data = `
    <div class="accordion-item">
      <h2 class="accordion-header" id="${headingVar}">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseVar}" aria-expanded="false" aria-controls="${collapseVar}">
          Accordion Item #${storySave}
        </button>
      </h2>
      <div id="${collapseVar}" class="accordion-collapse collapse" aria-labelledby="${headingVar}" data-bs-parent="#accordionStory">
        <div class="accordion-body">
          ${formattedStoryData}
        </div>
      </div>
    </div>
  `;
  
  document.getElementById("accordionStory").innerHTML += html_data;
  storySave++;
});

//story import code
document.addEventListener("DOMContentLoaded", function() {

  document.getElementById('importStory').addEventListener('change', handleFileImport);

  function handleFileImport(event) {
      if (event.target.files.length > 0) {
          const file = event.target.files[0];
          const reader = new FileReader();

          reader.onload = function(e) {
              story_data = JSON.parse(e.target.result);
              console.log("Data Imported:", story_data);
              updateStoryDisplay();

              // Updated data import code
              document.querySelectorAll("[data-key]").forEach(function(row) {
                  const key = row.getAttribute('data-key');
                  row.querySelector('td').textContent = story_data[key];
              });
          };

          reader.onerror = function(err) {
              console.error("Error reading file:", err);
          };

          reader.readAsText(file);
      }
  }
});


///////////////////////////TIMELINE//////////////////////////

//timeline standards populate
function populateStandardsDropdown(standards) {
  console.log("Populating Standards: ", standards);
  const dropdown = document.getElementById('standardsDropdown');
  dropdown.innerHTML = "";
  standards.forEach((standard, index) => {
      const option = document.createElement('option');
      option.value = standard;
      option.textContent = standard;
      dropdown.appendChild(option);
  });
}

function transformMainTimeline(original) {
  let result = [];

  for (let key in original) {
    let item = original[key];
    let transformed = {
      time: item.time,
      event: item.event,
      sheet: item.linkedData && item.linkedData.length > 0 ? item.id.toString() : "None"
    };

    result.push(transformed);
  }

  return result;
}

function generateLinkedDataFiles(original) {
  let files = {};

  for (let key in original) {
    let item = original[key];
    if (item.linkedData && item.linkedData.length > 0) {
      let filename = `linkedData_${item.id}.json`;
      let linkedDataArray = [{ standard: item.standard }, ...item.linkedData];
      files[filename] = linkedDataArray;
    }
  }

  return files;
}

function downloadJSON(data, filename) {
  const jsonData = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function exportTimelineJSON() {
  // Transform main timeline
  const newTimeline = transformMainTimeline(timeline_data);

  // Download main timeline
  downloadJSON(newTimeline, 'timeline.json');

  // Generate and download linkedData files
  const linkedDataFiles = generateLinkedDataFiles(timeline_data);
  for (let filename in linkedDataFiles) {
    downloadJSON(linkedDataFiles[filename], filename);
  }
}

// Existing functions to export individual JSON data
function exportStoryJSON() {
  const storyJSON = JSON.stringify(story_data, null, 2);
  const blob = new Blob([storyJSON], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'story.json';
  a.click();
  URL.revokeObjectURL(a.href);
}


// New function to export both JSON files
function exportAllJSON() {
  exportStoryJSON();
  exportTimelineJSON();
}

// Attach event listener to the "Save All JSON" button
document.getElementById('saveAllJSONButton').addEventListener('click', exportAllJSON);


//timeline history save
$('#timeline-history-button').click(function() {
  let headingVar = "timelineHeading" + timelineSave;
  let collapseVar = "timelineCollapse" + timelineSave;

  let formattedTimelineData = formatTimelineDataForDisplay(timeline_data);

  let html_data = `
    <div class="accordion-item">
      <h2 class="accordion-header" id="${headingVar}">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseVar}" aria-expanded="false" aria-controls="${collapseVar}">
          Accordion Item #${timelineSave}
        </button>
      </h2>
      <div id="${collapseVar}" class="accordion-collapse collapse" aria-labelledby="${headingVar}" data-bs-parent="#accordionTimeline">
        <div class="accordion-body">
          ${formattedTimelineData}
        </div>
      </div>
    </div>
  `;

  document.getElementById("accordionTimeline").innerHTML += html_data;
  timelineSave++;
});

function formatTimelineDataForDisplay(data, indent = 0) {
  let formattedData = '';
  for (let key in data) {
    if (data.hasOwnProperty(key)) {
      if (typeof data[key] === 'object' && data[key] !== null) {
        formattedData += `${" ".repeat(indent)}<strong>${key}:</strong><br/>`;
        formattedData += formatTimelineDataForDisplay(data[key], indent + 2);
      } else {
        formattedData += `${" ".repeat(indent)}<strong>${key}:</strong> ${data[key]}<br/>`;
      }
    }
  }
  return formattedData;
}


//timeline other
document.addEventListener("DOMContentLoaded", function() {
  const linkedDataModal = document.getElementById("editModal");
  const closeLinkedData = document.getElementById("closeLinkedData");

  //add blank row to timeline
  document.getElementById("addBlankRowBtn").addEventListener("click", function() {
    console.log("Adding blank timeline row")

    timeline_data[timelineNextId] = {
      id: timelineNextId,
      time: "",
      event: "",
      standard: null,
      linkedData: []
    };
    
    const newRow = `
      <tr id="row-${timelineNextId}">
        <td data-key="time" contenteditable="true"></td>
        <td data-key="event" contenteditable="true"></td>
        <td>
          <button id="dataItemBtn-${timelineNextId}" onclick="toggleDataItem(${timelineNextId})">Add</button>
        </td>
        <td>
          <button class="btn btn-danger delete-row">Delete</button>
        </td>
      </tr>
    `;
  
    document.getElementById("timelineTableBody").innerHTML += newRow;
    timelineNextId++;
    updateTimelineDisplay();
  });

  //add blank row to pop up table
  window.addLinkedDataRow = function() {
    console.log("Adding blank linked data row")
    let options = "";
    const defaultPaths = standardDataPaths['defaultStandard']?.dataPaths || [];  
    defaultPaths.forEach(path => {
      options += `<option value="${path}">${path}</option>`;
    });
  
    const newRow = `
      <tr>
        <td>
          <select>
            ${options}
          </select>
        </td>
        <td contenteditable="true"></td>
        <td>
          <button class="btn btn-danger" onclick="deleteLinkedDataRow(this)">Delete</button>
        </td>
      </tr>
    `;
  
    document.getElementById("linkedDataTableBody").innerHTML += newRow;
    const tbody = document.getElementById("linkedDataTableBody");
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = newRow;
    tbody.appendChild(tempDiv.firstChild);
  }
  
  // standards file import
  document.getElementById('standardsFileLoadButton').addEventListener('change', function(e) {
    console.log("File change event triggered");
    const files = e.target.files;
    if (!files.length) return;
    
    Array.from(files).forEach((file, fileIndex) => {
      const reader = new FileReader();
      reader.onload = function(e) {
          const contents = e.target.result;
          console.log("File Contents:", contents);

          const [firstLine, ...dataPaths] = contents.split('\n'); // Destructure the content into the first line and the rest
          
          if(firstLine) {
              standardsData[firstLine] = {
                  dataPaths: dataPaths.filter(Boolean) // Remove empty strings from data paths
              };
          }

          // If it's the last file, update the dropdown
          if(file === files[files.length-1]) {
              populateStandardsDropdown(Object.keys(standardsData)); // Just pass the standard names to your function
              console.log("Standards Data:", standardsData);
          }
      };
      reader.readAsText(file);
    });
});

// update timeline text area
  function updateTimelineDisplay() {
    const timelineTextAreaElem = document.getElementById("timelineTextArea");
    if (timelineTextAreaElem) {
      timelineTextAreaElem.value = JSON.stringify(timeline_data, null, 2);
    }
  }

  //change drop down; updates the JSON and text area - we testing
  // document.getElementById("standardsDropdown").addEventListener('change', function() {
  //   saveLinkedDataToJSON();
  //   updateTimelineDisplay();
  // });
  
// delete timeline table row
  document.getElementById("timelineTableBody").addEventListener("click", function(event) {
    if (event.target && event.target.matches(".delete-row")) {
      const rowElement = event.target.closest("tr");
      if (rowElement && rowElement.id) {
        const rowId = parseInt(rowElement.id.split("-")[1]);
        delete timeline_data[rowId];
        rowElement.remove();
        updateTimelineDisplay();
      }
    }
  });
  
// switch between Add and Edit for row
  window.toggleDataItem = function(rowId) {
    const btn = document.getElementById("dataItemBtn-" + rowId);
    if (btn.innerText === "Add" || btn.innerText === "Edit") {
      btn.innerText = "Edit";
      currentRowId = rowId;
      linkedDataModal.style.display = "block"; 
      populateLinkedDataModal(rowId);
    } else {
      btn.innerText = "Add";
      currentRowId = null;
    }
  }

  // update timeline json + text area when value changes
  document.getElementById("timelineTableBody").addEventListener("input", function(event) {
    const cell = event.target.closest("td");
    if (cell && cell.hasAttribute("data-key")) {
      const key = cell.getAttribute("data-key");
      const rowElement = cell.closest("tr");
      if (rowElement && rowElement.id) {
        const rowId = parseInt(rowElement.id.split("-")[1]);
        timeline_data[rowId][key] = cell.textContent;
        updateTimelineDisplay();
      }
    }
  });

  // delete row from timeline json
  window.deleteRow = function(rowId) {
    delete timeline_data[rowId];
    const rowElement = document.getElementById("row-" + rowId);
    if (rowElement) {
      rowElement.remove();
    }
    updateTimelineDisplay();
  }

  // populate pop up table when triggered
  function populateLinkedDataModal(rowId) {
    const obj = timeline_data[rowId];
    let tableContent = "";
    if (obj && obj.linkedData) {
      obj.linkedData.forEach((dataItem, index) => {
        let options = "";
        const paths = standardsData[obj.standard]?.dataPaths || [];
        paths.forEach(path => {
            options += `<option value="${path}"${dataItem.dataPath === path ? ' selected' : ''}>${path}</option>`;
        });
  
        tableContent += `
          <tr>
            <td>
              <select>
                ${options}
              </select>
            </td>
            <td contenteditable="true">${dataItem.exampleData || ''}</td>
            <td>
              <button class="btn btn-danger" onclick="deleteLinkedDataRow(this, ${index})">Delete</button>
            </td>
          </tr>
        `;
      });
    }
    document.getElementById("linkedDataTableBody").innerHTML = tableContent;
  }
  
  // reset linked data when deleted
window.resetLinkedData = function() {
  const obj = timeline_data[currentRowId];
  if (obj) {
    obj.linkedData = [];
    delete obj.standard;
  }
  const btn = document.getElementById("dataItemBtn-" + currentRowId);
  if (btn) {
    btn.innerText = "Add";
  }
  linkedDataModal.style.display = "none";
  updateTimelineDisplay();
}

// close pop up table
closeLinkedData.onclick = function() {
  linkedDataModal.style.display = "none";
  saveLinkedDataToJSON();
  updateTimelineDisplay();
}

// save linked data to JSON
function saveLinkedDataToJSON() {
  const obj = timeline_data[currentRowId];
  const dropdown = document.getElementById('standardsDropdown');
  const selectedStandard = dropdown ? dropdown.value : null;

  obj.linkedData = [];  // Resetting linkedData to an empty array
  const rows = document.querySelectorAll("#linkedDataTableBody tr");
  rows.forEach(row => {
    const cells = row.querySelectorAll("td");
    obj.linkedData.push({
      dataPath: cells[0].textContent,
      exampleData: cells[1].textContent
    });
  });
  
  obj.standard = selectedStandard;  // Setting the standard
}

// IDK TBH
document.getElementById("linkedDataTableBody").addEventListener("blur", function(event) {
  saveLinkedDataToJSON();
  updateTimelineDisplay();
}, true);



// close pop up table when clicked outside
linkedDataModal.addEventListener("click", function(event) {
  if (event.target === linkedDataModal) {
    linkedDataModal.style.display = "none";
  }
});

// delete row from pop up table
window.deleteLinkedDataRow = function(buttonElem, index) {
  buttonElem.parentElement.parentElement.remove();
  timeline_data[currentRowId].linkedData.splice(index, 1);  // Remove the corresponding object from linkedData
  saveLinkedDataToJSON();
  updateTimelineDisplay();
}

// update pop up table when standard changes IDK
document.getElementById("linkedDataTableBody").addEventListener("change", function(event) {
  if (event.target && event.target.matches(".standard-dropdown")) {
    saveLinkedDataToJSON();
    updateTimelineDisplay();
  }
}, true);


// BUG - THIS BOTTOM CODE IS BROKEN
// update pop up table when standard changes
document.getElementById('standardsDropdown').addEventListener('change', function(event) {

  saveLinkedDataToJSON();
  updateTimelineDisplay();

  const selectedStandard = event.target.value;
  const paths = standardsData[selectedStandard]?.dataPaths || [];
  console.log("Selected Standard:", selectedStandard);
  console.log("PAHHHH aths:", paths);

  document.querySelectorAll('#linkedDataTableBody select').forEach(selectElement => {
      selectElement.innerHTML = paths.map(path => `<option value="${path}">${path}</option>`).join('');
  });
});


});



//timeline import code
document.addEventListener("DOMContentLoaded", function() {
  document.getElementById('importFiles').addEventListener('change', handleFilesUpload);
  document.getElementById('processFilesBtn').addEventListener('click', processUploadedFiles);

  let uploadedFiles = [];

  function handleFilesUpload(event) {
    uploadedFiles = event.target.files;
    console.log(`${uploadedFiles.length} files uploaded. Press 'Process Files' to process.`);
  }

  function processUploadedFiles() {
    let linkedDataFiles = [];

    for (let file of uploadedFiles) {
      if (file.name === 'timeline.json') {
        parseTimelineFile(file, data => timeline_data = data);
      } else if (file.name.startsWith('linkedData_')) {
        linkedDataFiles.push(file);
      }
    }

    const timelineDataParsedCheck = setInterval(() => {
      if (timeline_data) {
        clearInterval(timelineDataParsedCheck);
        processLinkedDataFiles(linkedDataFiles, timeline_data);
      }
    }, 100);
  }

  function parseTimelineFile(file, callback) {
    const reader = new FileReader();
    reader.onload = e => {
      const rawData = JSON.parse(e.target.result);
      let structuredData = structureTimelineData(rawData);
      callback(structuredData);
    };
    reader.onerror = err => console.error("Error reading file:", err);
    reader.readAsText(file);
  }

  function processLinkedDataFiles(files, timeline_data) {
    const promises = files.map(file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const linkedData = JSON.parse(e.target.result);
          integrateLinkedDataToTimeline(linkedData, timeline_data, file.name);
          resolve();
        } catch (err) {
          reject(new Error(`Error in parsing/processing linkedData from file ${file.name}: ${err.message}`));
        }
      };
      reader.onerror = err => reject(new Error(`Error reading file ${file.name}: ${err.message}`));
      reader.readAsText(file);
    }));

    Promise.all(promises)
      .then(() => {
        console.log("All linked data files processed.");
        console.log("Final timeline data:", timeline_data);
        renderTimelineTable();
        updateTimelineDisplay(); // Ensure this function is defined in your code
      })
      .catch(err => console.error(err));
  }
  
  function structureTimelineData(rawData) {
    const structuredData = {};
    rawData.forEach((item, index) => {
        currentRowId++;  // Incrementing currentRowId for every item
        timelineNextId = currentRowId + 1;  // Setting timelineNextId to be one more than currentRowId

        structuredData[currentRowId] = {
            id: currentRowId,
            time: item.time,
            event: item.event,
            standard: null,
            linkedData: []
        };
    });
    return structuredData;
}


  function integrateLinkedDataToTimeline(linkedData, timeline_data, fileName) {
    const linkedDataId = parseInt(fileName.split('_')[1], 10);

    const standard = linkedData[0]?.standard || null;
    if (timeline_data[linkedDataId]) {
      timeline_data[linkedDataId].standard = standard;
      timeline_data[linkedDataId].linkedData = linkedData.slice(1);
    } else {
      console.error(`Timeline data for linked data ID ${linkedDataId} not found.`);
    }
  }
});


//timeline variable to table render code (used for import)
function renderTimelineTable() {
  let tableContent = "";
  for (let id in timeline_data) {
    const rowData = timeline_data[id];
    tableContent += `
      <tr id="row-${id}">
        <td data-key="time" contenteditable="true">${rowData.time}</td>
        <td data-key="event" contenteditable="true">${rowData.event}</td>
        <td>
          <button id="dataItemBtn-${id}" onclick="toggleDataItem(${id})">${rowData.linkedData.length > 0 ? 'Edit' : 'Add'}</button>
        </td>
        <td>
          <button class="btn btn-danger delete-row">Delete</button>
        </td>
      </tr>
    `;
  }
  document.getElementById("timelineTableBody").innerHTML = tableContent;
}