const socket = io();
let user = '';
let email = '';
let chatBox = document.getElementById('chatbox');

chatBox.addEventListener('keyup', event =>{
    if(event.key === 'Enter'){
        if(chatBox.value.trim().length > 0){
            socket.emit('messagein', {
                message: chatBox.value,
                date: `${new Date().getHours()}:${new Date().getMinutes()}`
            })
            chatBox.value = '';
        }
    }
})

//recibir messages

socket.on('messageout', data => {
    const divLog = document.getElementById('messageLogs')
    let messages = ''

    data.reverse().forEach(message => {
        messages += `<div class='bubble'><i class='bubble-user'>${message.user}</i><p class='bubble-message'>${message.message}<span class='hour'>${message.date}</span></p></div>`
    });

    divLog.innerHTML = messages
})