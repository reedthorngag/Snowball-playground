

document.addEventListener('keyup',(event) => {
    if (event.key === 'Escape') {
        if (loginVisable) hidelogin();
        else if (signupVisable) hidesignup();
    }
});

let userID;

if (document.cookie.includes('auth=')) {
    let auth = JSON.parse(atob(document.cookie.split('auth=')[1].split('; ')[0].split('.')[1]));
    userID = auth.userID
} else {
    console.log('not logged in!')
}


