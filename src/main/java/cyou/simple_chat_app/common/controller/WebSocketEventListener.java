package cyou.simple_chat_app.common.controller;



import cyou.simple_chat_app.common.service.ActiveUserService;
import lombok.AllArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Objects;

@Component
@AllArgsConstructor
public class WebSocketEventListener {

    private final ActiveUserService activeUserService;
    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        String username = Objects.requireNonNull(event.getUser()).getName();
        // Assume username is stored in the Principal object
        activeUserService.addUser(username);
        broadcastActiveUsers();
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        String username = Objects.requireNonNull(event.getUser()).getName();
        activeUserService.removeUser(username);
        broadcastActiveUsers();
    }

    private void broadcastActiveUsers() {
        messagingTemplate.convertAndSend("/topic/activeUsers", activeUserService.getActiveUsers());
    }
}
