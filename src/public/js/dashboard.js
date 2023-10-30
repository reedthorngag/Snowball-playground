var recentTag;
var scnr;
var port;
var readableStreamClosed;
var scannerStatus = false;
function scannerStatusNo() {
  document.getElementById("scannerStatus").classList.remove("animate-opacity-pulse");
  document.getElementById("scannerStatus").classList.remove("border-custom-yes");
  document.getElementById("scannerStatus").classList.add("border-custom-no");
  document.getElementById("scannerConnect").classList.add("text-custom-2");
  document.getElementById("scannerConnect").classList.remove("text-custom-3");
  document.getElementById("scannerConnect").classList.remove("pointer-events-none");
  document.getElementById("scannerDisconnect").classList.remove("text-custom-2");
  document.getElementById("scannerDisconnect").classList.add("text-custom-3");
  document.getElementById("scannerDisconnect").classList.add("pointer-events-none");
}
async function scannerStatusYes() {
  document.getElementById("scannerStatus").classList.remove("animate-opacity-pulse");
  document.getElementById("scannerStatus").classList.remove("border-custom-no");
  document.getElementById("scannerStatus").classList.add("border-custom-yes");
  document.getElementById("scannerConnect").classList.remove("text-custom-2");
  document.getElementById("scannerConnect").classList.add("text-custom-3");
  document.getElementById("scannerConnect").classList.add("pointer-events-none");
  document.getElementById("scannerDisconnect").classList.add("text-custom-2");
  document.getElementById("scannerDisconnect").classList.remove("text-custom-3");
  document.getElementById("scannerDisconnect").classList.remove("pointer-events-none");
}
function scannerStatusError() {
  document.getElementById("scannerStatus").classList.add("animate-opacity-pulse-5");
  if (scannerStatus == false) {
    document.getElementById("scannerStatus").classList.remove("border-custom-yes");
    document.getElementById("scannerStatus").classList.add("border-custom-no");
    document.getElementById("scannerConnect").classList.add("text-custom-2");
    document.getElementById("scannerConnect").classList.remove("text-custom-3");
    document.getElementById("scannerDisconnect").classList.remove("text-custom-2");
    document.getElementById("scannerDisconnect").classList.add("text-custom-3");
  } else if (scannerStatus == true) {
    document.getElementById("scannerStatus").classList.remove("border-custom-no");
    document.getElementById("scannerStatus").classList.add("border-custom-yes");
    document.getElementById("scannerConnect").classList.remove("text-custom-2");
    document.getElementById("scannerConnect").classList.add("text-custom-3");
    document.getElementById("scannerDisconnect").classList.add("text-custom-2");
    document.getElementById("scannerDisconnect").classList.remove("text-custom-3");
  }
  setTimeout(function () {
    document.getElementById("scannerStatus").classList.remove("animate-opacity-pulse-5");
  }, 2500);
}
async function scannerConnect(doc) {
  console.log("Connecting to scanner...");
  port = await navigator.serial.requestPort();
  await port
    .open({ baudRate: 115200 })
    .then(() => {
      console.log("Scanner connected...");
      scannerStatusYes();
      scannerStatus = true;
    })
    .catch((err) => {
      console.log("Failed to connect to scanner...");
      scannerStatusError();
    });
  const textDecoder = new TextDecoderStream();
  readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
  const reader = textDecoder.readable.getReader();
  scnr = reader;
  await startScanning(doc);
  return reader;
}
async function scannerDisconnect() {
  //need to add a check to see if scanner actually disconnected and if not, present error
  const textEncoder = new TextEncoderStream();
  const writer = textEncoder.writable.getWriter();
  const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);

  scnr.cancel();
  await readableStreamClosed.catch(() => {
    /* Ignore the maybe */
  });
  writer.close();
  await writableStreamClosed;
  await port.close();
  scnr = null;
  console.log("Scanner disconnected...");
  scannerStatusNo();
  scannerStatus = false;
}

async function startScanning(doc) {
  console.log("scanning...");

  while (true) {
    const { value, done } = await scnr.read();
    if (done) {
      scnr.releaseLock();
      break;
    }
    recieved_data = value.replace(">", "").split("\n");
    recieved_data.forEach((element) => {
      if (element.length == 30 && element.startsWith("T")) {
        // on recieved tag
        recievedTag(element, doc);
      }
    });
  }
}

function recievedTag(tagID, doc) {
  // check to see if tag exists in the database
  tag_exists = false;
  if (tag_exists) {
    doc.getElementById("assetNew").classList.add("hidden");
    doc.getElementById("assetExisting").classList.remove("hidden");
  } else {
    doc.getElementById("assetExisting").classList.add("hidden");
    doc.getElementById("assetNew").classList.remove("hidden");
  }
}
let test_assets = [
  {
    ID: "003",
    type: "Shirt",
    size: "L",
    status: "On Loan",
    loan_history: "N/A",
    assigned_tags: "N/A",
  },
  {
    ID: "006",
    type: "Short",
    size: "S",
    status: "On Hold",
    loan_history: "N/A",
    assigned_tags: "N/A",
  },
  {
    ID: "123",
    type: "Hoodie",
    size: "XL",
    status: "Available",
    loan_history: "N/A",
    assigned_tags: "N/A",
  },
];

function populateStudent() {
  let dropdown = document.getElementById("studentDropdown");
  let students = searchStudents();
  students.forEach((student) => {
    dropdown.innerHTML += `<option value="${student.ID}">${student.FirstName} ${student.LastName}</option>`;
  });
}

function searchStudents() {
  let req = new XMLHttpRequest();

  return new Promise((resolve, reject) => {

    req.open("GET", `/api/${cookieCutter("domains")}/students`, true);
    req.setRequestHeader("Content-Type", "application/json");
    req.onreadystatechange = function () {
      if (req.readyState == 4 && req.status == 200) {
        console.log(req.responseText);
        //SUCCESS
        return resolve(JSON.parse(req.responseText));
      } else if (req.responseText) {
        return reject(req.responseText);
      }
    };
    req.send();
  });
}

function displayTable(asset_data) {
  let table = document.getElementById("assetsTable");
  table.innerHTML = `<tr><th>Asset ID</th><th>Type</th><th>Size</th><th>Status</th><th>Previous Loans</th><th>Assigned Tags</th></tr>`;
  asset_data.forEach((asset) => {
    table.innerHTML += `<tr><td>${asset.ID}</td><td>${asset.type}</td><td>${asset.size}</td><td>${asset.status}</td><td>${asset.loan_history}</td><td>${asset.assigned_tags}</td></tr>`;
  });
}

function refreshTable(asset_data) {
  // get request for asset data
  displayTable(asset_data);
}

function createAsset() {
  let type = document.getElementById("assetType").value;
  let size = document.getElementById("assetSize").value;
  let id = null;
  console.log(`Asset Info:\nType: ${type}\nSize: ${size}\nID: ${id}`);

  addAssetToDB(type, size, id);
}

function cookieCutter(name) {
  return decodeURIComponent(document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)")?.pop() || "")
    .split(":")[1]
    .split('"')[1];
}

function addAssetToDB(type, size, tag_id) {
  // Post Request to API to add asset to database with paramateres type, size, tag_id, users organization
  console.log(`Asset to add to DB: ${type}, ${size}, ${tag_id}`);
  let req = new XMLHttpRequest();
  req.open("POST", `/api/org/${cookieCutter("domains")}/assets`, true);
  req.setRequestHeader("Content-Type", "application/json");
  //Use Google SID cookie Token for authentication
  //req.setRequestHeader("Authorization", "Bearer " + cookieCutter("connect.sid"));
  req.onreadystatechange = function () {
    if (req.readyState == 4 && (req.status == 200 || req.status == 304)) {
      console.log(req.responseText);
      //SUCCESS
      getAssets().then((assets) => {
        displayTable(assets);
      }).catch((err) => {
        console.log(err);
      });
    } else if (req.readyState == 4) {
      req.responseText;
    }
  };
  req.send(
    JSON.stringify({
      type: type,
      size: size,
      tag_id: tag_id,
    })
  );
}

function getAssets() {
  // save an API Call to database to get all assets of the users organization to a variable called orgAssets
  let orgAssets;

  let req = new XMLHttpRequest();

  return new Promise((resolve, reject) => {

    req.open("GET", `/api/org/${cookieCutter("domains")}/assets`, true);
    req.setRequestHeader("Content-Type", "application/json");
    //Use Google SID cookie Token for authentication
    req.onreadystatechange = function () {
      if (req.readyState == 4 && req.status == 200) {
        console.log(req.responseText);
        //SUCCESS
        resolve(JSON.parse(req.responseText));
      } else if (req.readyState == 4) {
        reject(req.responseText);
      }
    };
    req.send();
    //console.log(orgAssets);

    return orgAssets;
  });
}

function onScan() {
  // check if the asset exists in the database
  asset_exists = false;
  if (asset_exists) {
    document.getElementById("");
  } else {
  }
}

window.addEventListener("load", (event) => {
  getAssets().then((assets) => {
    displayTable(assets);
  }).catch((err) => {
    console.log(err);
  });
});

// js to switch between tabs in the dashboard
function openpane(paneName) {
  switch (paneName) {
    case "scan":
      console.log("Opening scan pane");
      document.getElementById("scanPane").classList.remove("hidden");
      document.getElementById("databasePane").classList.add("hidden");
      document.getElementById("settingsPane").classList.add("hidden");
      document.getElementById("scanButton").classList.add("active");
      document.getElementById("scanButton").classList.remove("inactive");
      document.getElementById("databaseButton").classList.remove("active");
      document.getElementById("databaseButton").classList.add("inactive");
      document.getElementById("settingsButton").classList.remove("active");
      document.getElementById("settingsButton").classList.add("inactive");
      break;
    case "database":
      console.log("Opening database pane");
      document.getElementById("scanPane").classList.add("hidden");
      document.getElementById("databasePane").classList.remove("hidden");
      document.getElementById("settingsPane").classList.add("hidden");
      document.getElementById("scanButton").classList.remove("active");
      document.getElementById("scanButton").classList.add("inactive");
      document.getElementById("databaseButton").classList.add("active");
      document.getElementById("databaseButton").classList.remove("inactive");
      document.getElementById("settingsButton").classList.remove("active");
      document.getElementById("settingsButton").classList.add("inactive");
      break;
    case "settings":
      console.log("Opening settings pane");
      document.getElementById("scanPane").classList.add("hidden");
      document.getElementById("databasePane").classList.add("hidden");
      document.getElementById("settingsPane").classList.remove("hidden");
      document.getElementById("scanButton").classList.remove("active");
      document.getElementById("scanButton").classList.add("inactive");
      document.getElementById("databaseButton").classList.remove("active");
      document.getElementById("databaseButton").classList.add("inactive");
      document.getElementById("settingsButton").classList.add("active");
      document.getElementById("settingsButton").classList.remove("inactive");
      break;
    default:
      console.error("Invalid pane name");
      break;
  }
}
// js to make existing asset controls work
function existingtool(toolName) {
  switch (toolName) {
    case "info":
      console.log("Opening info tool");
      document.getElementById("assetInfo").classList.remove("hidden");
      document.getElementById("assetEdit").classList.add("hidden");
      document.getElementById("assetHistory").classList.add("hidden");
      document.getElementById("assetLoan").classList.add("hidden");
      document.getElementById("assetReturn").classList.add("hidden");
      break;
    case "edit":
      console.log("Opening edit tool");
      document.getElementById("assetInfo").classList.add("hidden");
      document.getElementById("assetEdit").classList.remove("hidden");
      document.getElementById("assetHistory").classList.add("hidden");
      document.getElementById("assetLoan").classList.add("hidden");
      document.getElementById("assetReturn").classList.add("hidden");
      break;
    case "history":
      console.log("Opening history tool");
      document.getElementById("assetInfo").classList.add("hidden");
      document.getElementById("assetEdit").classList.add("hidden");
      document.getElementById("assetHistory").classList.remove("hidden");
      document.getElementById("assetLoan").classList.add("hidden");
      document.getElementById("assetReturn").classList.add("hidden");
      break;
    case "loan":
      console.log("Opening loan tool");
      document.getElementById("assetInfo").classList.add("hidden");
      document.getElementById("assetEdit").classList.add("hidden");
      document.getElementById("assetHistory").classList.add("hidden");
      document.getElementById("assetLoan").classList.remove("hidden");
      document.getElementById("assetReturn").classList.add("hidden");
      break;
    case "return":
      console.log("Opening return tool");
      document.getElementById("assetInfo").classList.add("hidden");
      document.getElementById("assetEdit").classList.add("hidden");
      document.getElementById("assetHistory").classList.add("hidden");
      document.getElementById("assetLoan").classList.add("hidden");
      document.getElementById("assetReturn").classList.remove("hidden");
      break;
    default:
      console.error("Invalid pane name");
      break;
  }
}
