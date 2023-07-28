
let loginVisable = false;
let signupVisable = false;

function showlogin() {
    loginVisable = true;
    document.getElementById('login-overlay').style.display = 'block';
    document.getElementById('login').style.display = 'block';
    document.getElementById('login').style.top = '20vh';
    document.getElementById('login').style.opacity = 1;
    document.getElementById('login-overlay').style.opacity = 1;
}

function hidelogin() {
    loginVisable = false;
    document.getElementById('login').style.top = '25vh';
    document.getElementById('login').style.opacity = 0;
    document.getElementById('login-overlay').style.opacity = 0;
    setTimeout(()=>{
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('login').style.display = 'none';
    }, 150);
}

function showsignup() {
    signupVisable = true;
    document.getElementById('signup-overlay').style.display = 'block';
    document.getElementById('signup').style.display = 'block';
    document.getElementById('signup').style.top = '20vh';
    document.getElementById('signup').style.opacity = 1;
    document.getElementById('signup-overlay').style.opacity = 1;
}

function hidesignup() {
    signupVisable = false;
    document.getElementById('signup').style.top = '25vh';
    document.getElementById('signup').style.opacity = 0;
    document.getElementById('signup-overlay').style.opacity = 0;
    setTimeout(()=>{
        document.getElementById('signup-overlay').style.display = 'none';
        document.getElementById('signup').style.display = 'none';
    }, 150);
}

function submitLogin(form) {
    
    form['0'].classList.remove('input-error');
    form['1'].classList.remove('input-error');

    let failed = false;
    if (!form['0'].value) {
        form['0'].classList.add('input-error');
        failed = true;
    }
    if (!form['1'].value) {
        form['1'].classList.add('input-error');
        failed = true;
    }
    if (failed) {
        loginError('Please fill out all fields!');
        return;
    }

    const req = new XMLHttpRequest();
    req.open('POST','/api/login');
    req.setRequestHeader('Content-type','application/json');
    req.onload = () => {
        const data = JSON.parse(req.responseText)
        switch (data.status) {
            case 'success':
                document.cookie = 'auth='+data.token+'; max-age='+(60*60*24*5)/* 5 days */+'; path=/; Samesite=Strict';
                window.location.reload();
                break;
            case 'invalid_credentials':
                loginError('Incorrect username or password!');
                break;
            default:
                loginError('Unexpected server response! try again.')
        }
    };
    req.onerror = () => {
        switch (req.status) {
            case 404:
                loginError('Not connected! check your internet.');
            default: console.log("Error, unknown status: "+req.status);
                break;
        }
    };
    req.send('{"email":"'+form['0'].value+'","password":"'+form['1'].value+'"}');
}

function loginError(string) {
    document.getElementById('login-error').style.display = 'block';
    document.getElementById('login-error').textContent = string;
}

function signupError(string) {
    document.getElementById('signup-error').style.display = 'block';
    document.getElementById('signup-error').textContent = string;
}

function connectionError(string) {
    document.getElementById('error-box-text').innerText = string;
    document.getElementById('error-overlay').display = 'block';
    document.getElementById('error-box').display = 'block';
    document.getElementById('error-overlay').style.opacity = 1;
    document.getElementById('error-overlay').style.opacity = 1;
    const req = new XMLHttpRequest();
    req.open('/api/ping','GET');
    req.onload = () => {
        if (!req.status===200) {
            setTimeout(req.send.bind(req),2000);
            return;
        }
        
        document.getElementById('error-overlay').style.opacity = 1;
        document.getElementById('error-overlay').style.opacity = 1;

        setTimeout(()=>{
            document.getElementById('error-overlay').display = 'block';
            document.getElementById('error-box').display = 'block';
        },200);
    }
    req.onerror = () => {
        setTimeout(req.send.bind(req),2000);
    }
}

