let stompClient = null;
let currentUser = null;
let choseUser = null;
let secretKey = null;
let messageChat = [];
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
            showMessageReceived(JSON.parse(message.body));
            messageChat.push(JSON.parse(message.body))
        });

        // Subscribe to group messages
        stompClient.subscribe('/topic/group', function (message) {
            showMessageReceived(JSON.parse(message.body));
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

// Send a message
function sendMessage(message) {
    let messageContent = encryptMessage(message.content);
    if (messageContent.trim() !== '' && choseUser) {
        message.content = messageContent;
        stompClient.send("/app/chat.private." + message.recipient, {}, JSON.stringify(message));
        $('#messageInput').val('');
        messageChat.push(message)
    } else {
        swal({
            title: "Are you mad?",
            text: "Please select user who is preferred to chat before send message !",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
    }
    console.log(messageChat)
}

// Display a received message
function showMessageReceived(message) {
    let decryptedContent = decryptMessage(message.content);
    let chatArea = $('#chatArea');
    let messageElement = `<div id="${message.number}" class="row"> 
                                    <div class="text-start">
                                        <p id="p_${message.number}">
                                          <strong> 
                                            <span onclick="selectUser(this)">${message.sender}</span>:
                                          </strong> ${decryptedContent} at <em>${dateTimeConvert(message.timestamp)}</em>
                                          <button data-sender="${message.sender}" data-parent="${message.number}" class="btn btn-sm btn-outline-info bg-opacity-75" onclick="replyToMessage(this)">
                                             <i class="fas fa-reply"></i>
                                          </button>
                                        </p>
                                    </div>
                                </div>`;
    if (message.parentNumber) {
        $(`#p_${message.parentNumber}`).append(messageElement)
    } else {
        chatArea.append(messageElement);
        chatArea.scrollTop(chatArea[0].scrollHeight);
    }
    choseUser = message.sender;
    $('#selectedUser').html('<span> <i class="fas fa-comments mx-1"></i> Chatting with: <em> <i class="fas fa-user mx-1"></i>' + choseUser + '</em></span>');
}

function showMessageReplySend(message) {
    let decryptedContent = decryptMessage(message.content);
    let chatArea = $(`#${message.number}`);
    let messageElement = `<div id="${message.number}" class="row"> 
                                    <div class="text-end">
                                        <p>
                                          <strong> 
                                            <span onclick="selectUser(this)">${message.sender}</span>:
                                          </strong> ${decryptedContent} at <em>${dateTimeConvert(message.timestamp)}</em>
                                          <button data-sender="${message.sender}" data-parent="${message.number}" class="btn btn-sm btn-outline-info bg-opacity-75" onclick="replyToMessage(this)">
                                             <i class="fas fa-reply"></i>
                                          </button>
                                        </p>
                                    </div>
                                </div>`;

    chatArea.append(messageElement);
}

function replyToMessage(button) {
    let sender = button.getAttribute('data-sender');
    let parentMessage = button.getAttribute('data-parent');
    let form = document.createElement('form');
    form.id = 'replyForm';
    form.innerHTML = `
        <div class="input-group">
          <input type="hidden" id="messageReceiver" value="${sender}">
          <input type="hidden" id="parentMessage" value="${parentMessage}">
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

        let message = {
            sender: currentUser,
            content: messageContent,
            recipient: receiver,
            parentNumber: parentMessage,
            timestamp: new Date()
        };
        sendMessage(message);
        showMessageReplySend(message)
        // Remove the replyForm
        form.remove();
    });
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

function dateTimeConvert(isoDateString) {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = date.toLocaleString('default', {month: 'short'});
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${month} ${day}, ${year} ${hours}:${minutes}`;
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
        showMessageReplySend(message)
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
            showMessageReplySend(message)
        }
    });
});

// create group
function createGroup() {
    console.log("new group modal")
    $("#createGroupModal").modal('show');
}

$("#createGroupForm").submit(function (e) {
    e.preventDefault()
    $("#createGroupModal").modal('hide');
})

// Save message to session storage
function saveMessageToSession(message) {
    let messages = JSON.parse(sessionStorage.getItem('messages')) || [];
    messages.push(message);
    sessionStorage.setItem('messages', JSON.stringify(messages));
}

// Retrieve messages from session storage
function getMessagesFromSession() {
    return JSON.parse(sessionStorage.getItem('messages')) || [];
}

// Clear messages from session storage
function clearMessagesFromSession() {
    sessionStorage.removeItem('messages');
}


// Open a database
// const request = indexedDB.open('myDatabase', 1);

// request.onupgradeneeded = function (event) {
//     const db = event.target.result;
//     db.createObjectStore('myObjectStore', {keyPath: 'id'});
// };

// request.onsuccess = function (event) {
//     const db = event.target.result;
//
//     // Start a transaction to delete an object store
//     const transaction = db.transaction(['myObjectStore'], 'readwrite');
//     const objectStore = transaction.objectStore('myObjectStore');
//
//     objectStore.add({id: 1, name: 'John Doe'});
//     objectStore.add({id: 2, name: 'John Doe 1'});
//     objectStore.add({id: 3, name: 'John Doe 2'});
//     objectStore.add({id: 4, name: 'John Doe 3'});
//     objectStore.add({id: 5, name: 'John Doe 4'});
//
//     // Retrieve data from the object store
//     const getRequest = objectStore.get(1);
//     getRequest.onsuccess = function () {
//         console.log(getRequest.result);
//     };
//
// };
//
// updateOrAddRecord(2, 'Lalitj sdfdsffds')
//
// function updateOrAddRecord(id, name) {
//     // Open a connection to the IndexedDB database
//     const request = indexedDB.open('myDatabase', 2);
//
//     request.onupgradeneeded = function (event) {
//         const db = event.target.result;
//         console.log(!db.objectStoreNames.contains('myObjectStore'))
//         // Create an object store with the name 'myObjectStore' if it doesn't exist
//         if (!db.objectStoreNames.contains('myObjectStore')) {
//             db.createObjectStore('myObjectStore', {keyPath: 'id'});
//         }
//     };
//
//     request.onsuccess = function (event) {
//         const db = event.target.result;
//
//         // Start a transaction to access the object store
//         const transaction = db.transaction('myObjectStore', 'readwrite');
//         const objectStore = transaction.objectStore('myObjectStore');
//
//         // Define the record to be added or updated
//         const record = {id: id, name: name};
//
//         // Use the `put` method to add or update the record
//         const putRequest = objectStore.put(record);
//
//         const getRequest = objectStore.get(1);
//         getRequest.onsuccess = function () {
//             console.log(getRequest.result);
//         };
//
//         putRequest.onsuccess = function () {
//             console.log('Record added or updated successfully.');
//         };
//
//         putRequest.onerror = function () {
//             console.error('Error adding or updating record:', putRequest.error);
//         };
//
//         // Close the transaction when done
//         transaction.oncomplete = function () {
//             console.log('Transaction completed.');
//         };
//     };
//
//     request.onerror = function (event) {
//         console.error('Database error:', event.target.errorCode);
//     };
// }
//
//
// function deleteObjectStore(event) {
//     const db = event.target.result;
//
//     // Start a transaction to delete an object store
//     const transaction = db.transaction(['myObjectStore'], 'readwrite');
//     const objectStore = transaction.objectStore('myObjectStore');
//     // Delete all data from the object store
//     const clearRequest = objectStore.clear();
//
//     clearRequest.onsuccess = function () {
//         console.log('All data deleted from object store');
//     };
// }

