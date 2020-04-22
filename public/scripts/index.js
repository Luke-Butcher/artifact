const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
window.onload = function() {
    if (sessionStorage.getItem("username") == null && localStorage.getItem("username") == null){
        showModal(loginModal)
    }
};
window.onclick = function(event) {
    if (event.target === loadModal) {
        closeLoadModal()
    }};
const loadModal = document.getElementById("loadModal");
const saveButton = document.getElementById('saveButton');
const loadButton = document.getElementById('loadButton');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const minuteForm = document.getElementById('minuteForm');

saveButton.addEventListener('click', async () => {
    let minuteFormData = new FormData(minuteForm);
    minuteFormData.append('timestamp', new Date().toJSON());
    let data = JSON.stringify(Object.fromEntries(minuteFormData));
    const response = await fetch('saveMinutes', {
        method: 'POST',
        body: data,
        headers:{
            'Content-Type': 'application/json'
        }
    }).then(res => res.json())
        .catch(error => console.error('Error:', error))
        .then(() => alert("success!!"));
});
loadButton.addEventListener('click', () => {
    showModal(loadModal);
    buildLoadModalOptions()
});
loginForm.addEventListener('submit', async () => {
    event.preventDefault();
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    let remember = document.getElementById('remember').checked;
    let data = {username:username,password:password}
    const response = await fetch('login', {
        method: 'POST',
        body: JSON.stringify(data),
        headers:{
            'Content-Type': 'application/json'
        }
    }).then(res => res.json() )
        .catch(error => console.error('Error:', error))
        .then(response => {
            if (response.userExists === true){
                if (remember === true){
                    window.localStorage.setItem('username', response.username);
                }else {
                    window.sessionStorage.setItem('username', response.username);
                }
                //this needs better userfeed back so they know why it closed
                alert("success!!");
                closeModal(loginModal)
            } else if (response.userExists === false ){

                //else tell them that is the wrong username or password
                alert("incorrect username or password")
            }
        })
});
signupForm.addEventListener('submit', async () => {
    event.preventDefault();
    let username = document.getElementById('signupUsername').value;
    let password = document.getElementById('signupPassword').value;
    let createdOn = new Date().toJSON();
    let data = {username:username,password:password,createdOn:createdOn}
    const response = await fetch('signup', {
        method: 'POST',
        body: JSON.stringify(data),
        headers:{
            'Content-Type': 'application/json'
        }
    }).then(res => res.json() )
        .catch(error => console.error('Error:', error))
        .then(response => {
            if (response.userExists === true){
                alert("Your username is not unique! please try again")

            } else if (response.userExists === false  ){
                window.sessionStorage.setItem('username', username);
                //this needs better userfeed back so they know why it closed
                alert("success!!");
                closeModal(signupModal)
            } else if (response.error.length > 0){
                alert("sorry something went wrong")
            }
            //else tell them that is the wrong username or password
        })});


async function buildLoadModalOptions() {
    let username;
    if(sessionStorage.getItem("username")!= null){
        username = sessionStorage.getItem("username")
    } else {
        username=localStorage.getItem("username")
    }
    const response = await fetch('loadSelectableMinutes', {
        method: 'POST',
        body: JSON.stringify({username:username}),
        headers:{
            'Content-Type': 'application/json'
        }
    }).then(res => res.json() )
        .catch(error => console.error('Error:', error))
        .then(response =>{
            const minuteList = document.getElementById("minuteList");
            for (let i in response.result){
                let date = response.result[i].createdOn;
                let data = response.result[i].committee;
                let el = makeClickableListItem(date, data, response.result[i]);
                minuteList.appendChild(el);
            }
        })};
function makeClickableListItem(date, data, json) {
    const node = document.createElement("LI");
    let textnode = document.createTextNode(date + "    " + data);
    node.appendChild(textnode);
    node.addEventListener('click', () => {
        let inputs = Array.prototype.slice.call(document.querySelectorAll('form input'));

        Object.keys(json).map(function (dataItem) {
            inputs.map(function (inputItem) {
                return (inputItem.name === dataItem) ? (inputItem.value = json[dataItem]) : false;
            });
        });

        closeLoadModal()});
    return node;
}
function showModal(modal) {
    modal.style.display = 'block';
    document.getElementById('page-mask').style.display = 'block';
}
function closeModal(modal){
    modal.style.display = "none";
    document.getElementById('page-mask').style.display='none';

}
function closeLoadModal(){
    closeModal(loadModal)
    let root = document.getElementById("minuteList");
    while( root.firstChild ){
        root.removeChild( root.firstChild );
    }
}
