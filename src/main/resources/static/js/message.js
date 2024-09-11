let stompClient = null;
let currentUser = null;
let choseUser = null;
let secretKey = null;
let activeUsers = [];

getData();

function getData() {
    let url = $("#messageUrl").val();
    $.ajax({
        url: url,
        type: 'GET',
        success: function (data) {
            secretKey = data
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error('Error fetching session key:', textStatus, errorThrown);
        }
    });
}

// Connect to WebSocket
function connect() {
    let socket = new SockJS('/chat');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {

        // Subscribe to user's private messages
        stompClient.subscribe('/user/queue/messages', function (message) {
            addCommonChatMessage(JSON.parse(message.body));
        });

        // Subscribe to group messages
        stompClient.subscribe('/topic/group', function (message) {
            addCommonChatMessage(JSON.parse(message.body));
        });

        // Subscribe to the active users list
        stompClient.subscribe('/topic/activeUsers', function (message) {
            JSON.parse(message.body).forEach(a => {
                activeUsers.push(a)
            })
            updateUser()
        });
    }, function (error) {
        console.error('STOMP connection error:', error);
    });
}

function updateUser() {
    let filterArray = activeUsers.filter(user => user !== currentUser);
    filterArray = [...new Set(filterArray)];
    $("#activeUsers").empty();
    for (let user of filterArray) {
        $('#activeUsers').append(`<div class="scroll-item p-2 m-2 rounded bg-opacity-50" onclick="selectUser(this)"><i class="fas fa-user mx-1 mx-2"></i><span>${user}</span></div>`);
    }

}

function selectUser(element) {
    document.querySelectorAll('.scroll-item')
        .forEach(item => {
            item.classList.remove('bg-primary');
        });
    element.classList.add('bg-primary');
    choseUser = element.textContent || element.innerText;
    $('#selectedUser').html('<span> <i class="fas fa-comments mx-1"></i> Chatting with: <em> <i class="fas fa-user mx-1"></i>' + choseUser + '</em></span>');
}

function sendMessage(message) {
    let messageContent = encryptMessage(message.content);
    if (messageContent.trim() !== '' && choseUser) {
        message.content = messageContent;
        stompClient.send("/app/chat.private." + message.recipient, {}, JSON.stringify(message));
        $('#messageInput').val('');
        addCommonChatMessage(message)
    } else {
        swal({
            title: "Are you mad?",
            text: "Please select user who is preferred to chat before send message !",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
    }
}

function replyToMessage(button) {
    let sender = button.getAttribute('data-sender');
    let parentMessage = button.getAttribute('data-parent');
    let uniqueCode = button.getAttribute('data-uni');
    let form = document.createElement('form');
    form.id = 'replyForm';
    form.innerHTML = `
        <div class="input-group">
          <input type="hidden" id="messageReceiver" value="${sender}">
          <input type="hidden" id="parentMessage" value="${parentMessage}">
          <input type="hidden" id="uniqueCode" value="${uniqueCode}">
          <input type="text" id="messageReply" class="form-control" placeholder="Type your message..." />
          <button type="button" id="replyButton" class="btn btn-outline-primary">
            <i class="fas fa-paper-plane"></i> Send
          </button>
        </div>
      `;

    // Insert the form right after the button
    button.parentNode.insertBefore(form, button.nextSibling);

    // Add event listener to the reply button
    document.getElementById('replyButton').addEventListener('click', function () {
        let receiver = document.getElementById('messageReceiver').value;
        let messageContent = document.getElementById('messageReply').value;
        let parentMessage = document.getElementById('parentMessage').value;
        let uniqueCode = document.getElementById('uniqueCode').value;

        let message = {
            sender: currentUser,
            content: messageContent,
            recipient: receiver,
            parentNumber: parentMessage,
            timestamp: new Date(),
            uniqueCode: uniqueCode
        };
        sendMessage(message);
        // Remove the replyForm
        form.remove();
    });
}

function renderMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    if (message.sender === currentUser) {
        messageDiv.classList.add('right');
    } else {
        messageDiv.classList.add('left');
    }
    messageDiv.innerHTML = `
      <span class="h5">${decryptMessage(message.content)}</span>
      <span class="text-end"><em>${message.sender === currentUser ? '' : message.sender}:</em> at ${new Date(message.timestamp).toLocaleString()}
      <button data-sender="${message.sender === currentUser ? message.recipient : message.sender}" data-parent="${message.number}" data-uni="${Date.now().toString()}" class="btn btn-sm btn-outline-info bg-opacity-75" onclick="replyToMessage(this)">
                                             <i class="fas fa-reply"></i>
                                          </button> </span>`;
    return messageDiv;
}

function addCommonChatMessage(message) {
    choseUser = message.sender;
    $('#selectedUser').html('<span> <i class="fas fa-comments mx-1"></i> Chatting with: <em> <i class="fas fa-user mx-1"></i>' + choseUser + '</em></span>');

    const messageContainer = document.getElementById('chatArea');

    const messageElement = renderMessage(message);

    if (message.parentNumber) {
        const parentMessageElement = document.querySelector(`.message[data-number="${message.parentNumber}"]`);

        if (parentMessageElement) {
            parentMessageElement.parentNode.insertBefore(messageElement, parentMessageElement.nextSibling);
        } else {
            messageContainer.appendChild(messageElement);
        }
    } else {
        if (message.uniqueCode) {
            const parentMessageElement = document.querySelector(`.message[data-uni="${message.uniqueCode}"]`);
            if (parentMessageElement) {
                parentMessageElement.parentNode.insertBefore(messageElement, parentMessageElement.nextSibling);
            } else {
                messageContainer.appendChild(messageElement);
            }
        } else {
            messageContainer.appendChild(messageElement);
        }
    }
    messageElement.setAttribute('data-number', message.number);
}

function displayMessages(messages) {
    messages.forEach(message => addCommonChatMessage(message));
}

function encryptMessage(message) {
    return CryptoJS.AES.encrypt(message, secretKey).toString();
}

function decryptMessage(encryptedMessage) {
    let bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
}

function sendGroupMessage(groupName, messageContent) {
    if (messageContent.trim() !== '') {
        let encryptedContent = encryptMessage(messageContent, secretKey);
        let message = {
            sender: currentUser,
            content: encryptedContent,
            timestamp: new Date()
        };
        stompClient.send("/app/chat.group." + groupName, {}, JSON.stringify(message));
        $('#messageInput').val('');
    }
}

$(document).ready(function () {
    connect();
    currentUser = $("#currentUser").val();

    $('#sendButton').click(function () {
        let messageContent = $('#messageInput').val();
        let message = {
            sender: currentUser,
            content: messageContent,
            recipient: choseUser,
            timestamp: new Date()
        };
        sendMessage(message);
    });

    $('#messageInput').keypress(function (e) {
        if (e.which === 13) { // Enter key pressed
            let messageContent = $('#messageInput').val();
            let message = {
                sender: currentUser,
                content: messageContent,
                recipient: choseUser,
                timestamp: new Date()
            };
            sendMessage(message);
        }
    });
});

// create group
function createGroup() {
    $("#createGroupModal").modal('show');
}

function createGroupSend() {
    let chatGroup = {
        name: $("#groupName").val(),
        purpose: $("#groupPurpose").val(),
        groupType: $("input[name='groupType']").val()
    }
    if (chatGroup.name || chatGroup.purpose || chatGroup.groupType) {
        $.ajax({
            url: $("#createGroupUrl").val(),
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(chatGroup),
            success: function (data) {
                console.log(data)
                $("#createGroupModal").modal('hide');
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error('Error fetching session key:', textStatus, errorThrown);
            }
        });
    } else {
        swal({
            title: "Are you mad?",
            text: "Please fill all data in the form",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
    }

}

