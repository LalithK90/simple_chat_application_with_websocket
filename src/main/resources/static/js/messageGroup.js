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

    loadGroups()
});

function loadGroups() {
    let getGroupsUrl = $("#getGroupsUrl").val()
    $('#groupTable').DataTable({
        destroy: true,
        processing: true,
        serverSide: true,
        ajax: {
            url: getBaseUrl(getGroupsUrl),
            "data": function (d) {
                let page = Math.floor(d.start / d.length);  // Calculate page
                let size = d.length;  // Page size
                let search = d.search.value;  // Search value

                return {
                    "page": page,
                    "size": size,
                    "search": search,
                    "draw": d.draw  // Draw count
                };
            },
            "error": function (xhr, error, code) {
                console.log("Error:", error);
                console.log("XHR:", xhr);
            }
        },
        columns: [
            {data: 'name'},
            {
                "data": "memberCount",
                "render": function (data) {
                    return `<i class="fas fa-users"></i> ${data}`;
                }
            },
            {data: 'purpose'},
            {data: 'groupType'},
            {data: 'groupState'},
            {
                "data": "number",
                "render": function (data, type, row) {
                    return `
                            <div class="row justify-content-around">
                                <button class='btn-join btn btn-sm btn-outline-info mx-1'  data-gnum='${data}' title='Join'> <i class='fas fa-user-plus'></i>Join / <i class='fas fa-eye'></i> See</button>
                            </div>`
                }
            }
        ],
        paging: true,
        searching: true,
        pageLength: 10,
        lengthMenu: [5, 10, 25, 50, 100]
    });

    let datableRow = $('#groupTable tbody')
    // Event listener for "Join" button
    datableRow.on('click', 'button.btn-join', function () {
        let groupNumber = $(this).data('gnum');
        let $row = $(this).closest('tr');

        let groupName = $row.find('td:nth-child(1)').text(); // First column (Group Name)
        let membersCount = $row.find('td:nth-child(2)').text(); // Second column (# Members)
        let groupPurpose = $row.find('td:nth-child(3)').text(); // Third column (Purpose)
        let groupType = $row.find('td:nth-child(4)').text(); // Fourth column (Type)
        let groupState = $row.find('td:nth-child(5)').text();// Fifth column (State)

        // Build the alert content
        let alertContent = `
    <div class="container">
        <div class="row">
            <div class="col-md-4">
                <ul class="list-unstyled">
                    <li><strong>Group Name:</strong> ${groupName}</li>
                </ul>
            </div>
            <div class="col-md-4">
                <ul class="list-unstyled">
                    <li><strong>Members Count:</strong> ${membersCount}</li>
                </ul>
            </div>
            <div class="col-md-4">
                <ul class="list-unstyled">
                    <li><strong>Purpose:</strong> ${groupPurpose}</li>
                </ul>
            </div>
        </div>
        <div class="row">
            <div class="col-md-4">
                <ul class="list-unstyled">
                    <li><strong>Type:</strong> ${groupType}</li>
                </ul>
            </div>
            <div class="col-md-4">
                <ul class="list-unstyled">
                    <li><strong>State:</strong> ${groupState}</li>
                </ul>
            </div>
             <div class="col-md-4 justify-content-around">
                <button onclick="groupJoinRequest('${groupNumber}')" class="btn btn-outline-primary align-end">
                    <i class="fas fa-plus mx-1"></i> Join
                </button>
                <button onclick="groupExitRequest('${groupNumber}')" class="btn btn-outline-danger align-end">
                    <i class="fas fa-bin mx-1"></i> Exit
                </button>
             </div>
        </div>
    </div>
`;
        // Update the alert with the group details
        let groupDetail = $("#groupDetail")
        groupDetail.html(alertContent).removeClass('d-none'); // Show alert and add content

        // Optionally, you can scroll to the alert section if it's not in view
        $('html, body').animate({
            scrollTop: groupDetail.offset().top
        }, 500);

        $("#groupDetailModal").modal('show');
        loadGroupMembers(groupNumber)
    });

}

function getBaseUrl(url) {
    // Split the URL at the "?" character
    return url.split('?')[0];
}

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
    if (chatGroup.name.length > 0 && chatGroup.purpose.length > 0 && chatGroup.groupType.length > 0) {
        $.ajax({
            url: $("#createGroupUrl").val(),
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(chatGroup),
            success: function (data) {
                console.log(data)
                $("#createGroupModal").modal('hide');
                loadGroups()
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

function loadGroupMembers(groupNumber) {
    $("#groupId").val(groupNumber)
    let getGroupMembersUrl = $("#getGroupMembersUrl").val();
    $('#memberTable').DataTable({
        processing: true,
        serverSide: true,
        destroy: true, // Reinitialize DataTable when changing groups
        ajax: {
            url: getBaseUrl(getGroupMembersUrl) + groupNumber,
            "data": function (d) {
                let page = Math.floor(d.start / d.length);  // Calculate page
                let size = d.length;  // Page size
                let search = d.search.value;  // Search value

                return {
                    "page": page,
                    "size": size,
                    "search": search,
                    "draw": d.draw  // Draw count
                };
            },
            "error": function (xhr, error, code) {
                console.log("Error:", error);
                console.log("XHR:", xhr);
            }
        },
        columns: [
            {data: 'username'},
            {data: 'userEmail'}
        ],
        paging: true,
        searching: true,
        pageLength: 10,
        lengthMenu: [5, 10, 25, 50, 100]
    });
}

function groupJoinRequest(groupNumber) {
    let url = $("#joinGroupUrl").val()
    swal({
        title: "Are you sure?",
        text: "Do you want to join this group ?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
        .then((willJoin) => {
            if (willJoin) {
                $.ajax({
                    url: getBaseUrl(url) + groupNumber, type: 'GET', success: function (data) {
                        console.log(data)
                        swal(`Poof! ${data}!`, {
                            icon: "success",
                        });
                    }, error: function (jqXHR, textStatus, errorThrown) {
                        console.error('Error fetching session key:', textStatus, errorThrown);
                    }
                });

            } else {
                swal("Your still member of the group!");
            }
        });
}

function groupExitRequest(groupNumber) {
    let url = $("#exitGroupUrl").val()
    swal({
        title: "Are you sure?",
        text: "Do you want to exit this group ?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
        .then((willJoin) => {
            if (willJoin) {
                $.ajax({
                    url: getBaseUrl(url) + groupNumber, type: 'GET', success: function (data) {
                        swal(`Poof! ${data}!`, {
                            icon: "success",
                        });
                        location.reload();
                    }, error: function (jqXHR, textStatus, errorThrown) {
                        console.error('Error fetching session key:', textStatus, errorThrown);
                    }
                });

            } else {
                swal("Your still member of the group!");
            }
        });
}
