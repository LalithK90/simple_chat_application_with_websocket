let stompClient = null;
let currentUser = null;
let choseUser = null;
let secretKey = null;
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
        console.log('Connected: ' + frame);

        // Subscribe to user's private messages
        stompClient.subscribe('/user/queue/messages', function (message) {
            showMessage(JSON.parse(message.body));
        });

        // Subscribe to group messages
        stompClient.subscribe('/topic/group', function (message) {
            showMessage(JSON.parse(message.body));
        });

        // Subscribe to the active users list
        stompClient.subscribe('/topic/activeUsers', function (message) {
            updateActiveUsers(JSON.parse(message.body));
        });
    });
}

// Update the active users list
function updateActiveUsers(users) {
    $('#activeUsers').empty();
    users.forEach(function (user) {
        if (user !== currentUser) {
            $('#activeUsers').append('<li class="list-group-item"> <i class="fas fa-user mx-2"></i><span onclick="selectUser(this)">' + user + '</span></li>');
        }
    });
}

function selectUser(element) {
    choseUser = element.textContent || element.innerText;
    document.getElementById('selectedUser').textContent = 'Chatting with: ' + choseUser;
}

// Send a message
function sendMessage() {
    let messageContent = $('#messageInput').val();
    messageContent = encryptMessage(messageContent);

    if (messageContent.trim() !== '' && choseUser) {
        let message = {
            sender: currentUser,
            content: messageContent,
            timestamp: new Date()
        };
        stompClient.send("/app/chat.private." + choseUser, {}, JSON.stringify(message));
        $('#messageInput').val('');
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

// Display a received message
function showMessage(message) {
    let decryptedContent = decryptMessage(message.content);
    console.log(decryptedContent)
    let messageElement = '<div><strong>' + message.sender + ':</strong> ' + decryptedContent + ' at ' + dateTimeConvert(message.timestamp) + '</div>';
    $('#chatArea').append(messageElement);
    $('#chatArea').scrollTop($('#chatArea')[0].scrollHeight);
    choseUser = message.sender;
}

function encryptMessage(message) {
    return CryptoJS.AES.encrypt(message, secretKey).toString();
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

function decryptMessage(encryptedMessage) {
    let bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
}

function dateTimeConvert(isoDateString) {

// Create a new Date object
    const date = new Date(isoDateString);

// Extract components
    const year = date.getFullYear();
    const month = date.toLocaleString('default', {month: 'long'}); // Full month name
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

// Format the date into a readable format
    return `${month} ${day}, ${year} ${hours}:${minutes}:${seconds}`;
}

$(document).ready(function () {
    connect();
    currentUser = $("#currentUser").val();

    $('#sendButton').click(function () {
        sendMessage();
    });

    $('#messageInput').keypress(function (e) {
        if (e.which === 13) { // Enter key pressed
            sendMessage();
        }
    });
});


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

updateOrAddRecord(2, 'Lalitj sdfdsffds')

function updateOrAddRecord(id, name) {
    // Open a connection to the IndexedDB database
    const request = indexedDB.open('myDatabase', 2);

    request.onupgradeneeded = function (event) {
        const db = event.target.result;
        console.log(!db.objectStoreNames.contains('myObjectStore'))
        // Create an object store with the name 'myObjectStore' if it doesn't exist
        if (!db.objectStoreNames.contains('myObjectStore')) {
            db.createObjectStore('myObjectStore', {keyPath: 'id'});
        }
    };

    request.onsuccess = function (event) {
        const db = event.target.result;

        // Start a transaction to access the object store
        const transaction = db.transaction('myObjectStore', 'readwrite');
        const objectStore = transaction.objectStore('myObjectStore');

        // Define the record to be added or updated
        const record = {id: id, name: name};

        // Use the `put` method to add or update the record
        const putRequest = objectStore.put(record);

        const getRequest = objectStore.get(1);
        getRequest.onsuccess = function () {
            console.log(getRequest.result);
        };

        putRequest.onsuccess = function () {
            console.log('Record added or updated successfully.');
        };

        putRequest.onerror = function () {
            console.error('Error adding or updating record:', putRequest.error);
        };

        // Close the transaction when done
        transaction.oncomplete = function () {
            console.log('Transaction completed.');
        };
    };

    request.onerror = function (event) {
        console.error('Database error:', event.target.errorCode);
    };
}


function deleteObjectStore(event) {
    const db = event.target.result;

    // Start a transaction to delete an object store
    const transaction = db.transaction(['myObjectStore'], 'readwrite');
    const objectStore = transaction.objectStore('myObjectStore');
    // Delete all data from the object store
    const clearRequest = objectStore.clear();

    clearRequest.onsuccess = function () {
        console.log('All data deleted from object store');
    };
}

