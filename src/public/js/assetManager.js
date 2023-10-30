let test_assets = [
    {
        "ID": "003",
        "type": "Shirt",
        "size": "L",
        "status": "On Loan",
        "loan_history": "N/A",
        "assigned_tags": "N/A"
    },
    {
        "ID": "006",
        "type": "Short",
        "size": "S",
        "status": "On Hold",
        "loan_history": "N/A",
        "assigned_tags": "N/A"
    },
    {
        "ID": "123",
        "type": "Hoodie",
        "size": "XL",
        "status": "Available",
        "loan_history": "N/A",
        "assigned_tags": "N/A"
    }
];

function displayTable(asset_data) {
    let table = document.getElementById("assetsTable");
    table.innerHTML = `<tr><th>Asset ID</th><th>Type</th><th>Size</th><th>Status</th><th>Previous Loans</th><th>Assigned Tags</th></tr>`;
    asset_data.forEach(asset => {
        table.innerHTML += `<tr><td>${asset.ID}</td><td>${asset.type}</td><td>${asset.size}</td><td>${asset.status}</td><td>${asset.loan_history}</td><td>${asset.assigned_tags}</td></tr>`;
    });
};


function createAsset() {
    let type = document.getElementById('assetType').value;
    let size = document.getElementById('assetSize').value;
    let id = document.getElementById('displayTagID').value;
    console.log(`Asset Info:\nType: ${type}\nSize: ${size}\nID: ${id}`);
    addAssetToDB(type, size, id);
}

function getCookieValue(name) {
    return document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || '';
}

function addAssetToDB(type, size, tag_id) {
    // Post Request to API to add asset to database with paramateres type, size, tag_id, users organization
    
    let req = new XMLHttpRequest();
    req.open("POST", `/api/org/${window.sessionStorage.getItem("domain")}/assets`, true);
    req.setRequestHeader("Content-Type", "application/json");
    //Use Google SID cookie Token for authentication
    req.setRequestHeader("Authorization", "Bearer " + getCookieValue("connect.sid"));
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            console.log(req.responseText);
            //SUCCESS
            refreshTable(getAssets());
        }
        else {
            alert("Error: " + req.responseText);
        }
    }
    req.send(JSON.stringify({
        "type": type,
        "size": size,
        "tag_id": tag_id
    }));
}



function getAssets() {
    // save an API Call to database to get all assets of the users organization to a variable called orgAssets
    let orgAssets;

    let req = new XMLHttpRequest();
    req.open("GET", `/api/org/${window.sessionStorage.getItem("domain")}/assets`, true);
    req.setRequestHeader("Content-Type", "application/json");
    //Use Google SID cookie Token for authentication
    req.setRequestHeader("Authorization", "Bearer " + getCookieValue("connect.sid"));
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            console.log(req.responseText);
            //SUCCESS
            orgAssets = JSON.parse(req.responseText);
        }
        else {
            alert("Error: " + req.responseText);
        }
    }
    // req.send();
    console.log(orgAssets);

    refreshTable(orgAssets)
    return orgAssets;
}

window.addEventListener("load", event => {
    refreshTable(getAssets());
});