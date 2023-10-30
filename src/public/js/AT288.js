var recentTag;
var scnr;
var port;
var readableStreamClosed;

async function openSerialPort(doc) {
    port = await navigator.serial.requestPort();

    await port.open({ baudRate: 115200 }).then(() => {
        doc.getElementById("ScannerStatus").classlist.add("bg-green-500");
        });
    const textDecoder = new TextDecoderStream();
    readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();


    while (true) {
        const { value, done } = await reader.read();
        if (done) {
            reader.releaseLock();
            break;
        }
        // console.log(value);
        // On recieve data from serial port
        // doc.getElementById("recentTag").innerHTML = value;
        recieved_data = value.replace(">", "").split("\n")
        recieved_data.forEach(element => {
            if (element.length == 30 && element.startsWith("T")) {
                recentTag = element;
                console.log(recentTag);
            }
        }
        );
    }
}

async function connectScanner() {
    port = await navigator.serial.requestPort();

    await port.open({ baudRate: 115200 }).then(() => {
        console.log("Scanner Connected");
        document.getElementById("scannerStatus").classList.remove("bg-custom-fail");
        document.getElementById("scannerStatus").classList.remove("bg-custom-error");
        document.getElementById("scannerStatus").classList.add("bg-custom-success");
    }).catch((err) => {
        console.log(err);
        console.log("Could not connect to scanner.")
        document.getElementById('scannerStatus').classList.remove('bg-custom-success');
        document.getElementById('scannerStatus').classList.remove('bg-custom-fail');
        document.getElementById('scannerStatus').classList.add('bg-custom-error');
    });
    const textDecoder = new TextDecoderStream();
    readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();

    
    scnr = reader;
    return reader;
}

async function disconnectScanner() {

    const textEncoder = new TextEncoderStream();
    const writer = textEncoder.writable.getWriter();
    const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
    
    scnr.cancel();
    await readableStreamClosed.catch(() => { /* Ignore the error */ });
    
    writer.close();
    await writableStreamClosed;
    
    await port.close();

    scnr = null;
    document.getElementById("scannerStatus").classList.remove("bg-custom-success");
    document.getElementById("scannerStatus").classList.remove("bg-custom-error");
    document.getElementById("scannerStatus").classList.add("bg-custom-fail");
    console.log("Scanner Disconnected");
}

async function readSingleTag() {
    if (!scnr) {
        scnr = await connectScanner();
    }
    console.log("READING TAG");
    let foundTag = false;
    let recieved_value = null;
    const { value, done } = await scnr.read();
    while (!foundTag) {
        const { value, done } = await scnr.read();
        if (done) {
            scnr.releaseLock();
            break;
        }
        recieved_value = value;
        console.log(value);
        // On recieve data from serial port
        // doc.getElementById("recentTag").innerHTML = value;
        recieved_data = value.replace(">", "").split("\n")
        recieved_data.forEach(element => {
            if (element.length == 30 && element.startsWith("T")) {
                recentTag = element;
                console.log(recentTag);
                foundTag = true;
            }
        });
    }
    return recentTag;
}

async function assignTag(elementID, btnID) {
    console.log("Assigning Tag");
    document.getElementById(btnID).disabled = true;
    tag = await readSingleTag();
    document.getElementById(elementID).value = tag;
    document.getElementById(btnID).disabled = false;
    console.log("TAG ID: ", tag);
}