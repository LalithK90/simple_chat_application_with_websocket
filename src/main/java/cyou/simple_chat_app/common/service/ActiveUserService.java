package cyou.simple_chat_app.common.service;

import lombok.Getter;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Getter
@Service
public class ActiveUserService {

    // Returns the current set of active users
    // A thread-safe set to store active users
    private final Set<String> activeUsers = ConcurrentHashMap.newKeySet();

    // Adds a user to the set of active users
    public void addUser(String username) {
            activeUsers.add(username);
    }

    // Removes a user from the set of active users
    public void removeUser(String username) {
        activeUsers.remove(username);
    }

}

