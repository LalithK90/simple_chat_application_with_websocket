let stompClient = null;
let currentUser = null;
let choseUser = null;
let secretKey = null;
let activeUsers = [];

getData();

function getData() {
    let url = $("#messageUrl").val();
    $.ajax({
        url: url, type: 'GET', success: function (data) {
            secretKey = data
        }, error: function (jqXHR, textStatus, errorThrown) {
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
