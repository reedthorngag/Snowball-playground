

document.addEventListener('keyup',(event) => {
    if (event.key === 'Escape') {
        if (loginVisable) hidelogin();
        else if (signupVisable) hidesignup();
    }
});

if (document.cookie.includes('auth=')) {
    let auth = atob(document.cookie.split('auth=')[1].split('; ')[0]);
    console.log(auth)
} else {
    console.log('not logged in!')
}


