package cyou.simple_chat_app.group.service.impl;

import cyou.simple_chat_app.group.service.ChatGroupService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@AllArgsConstructor
public class ChatGroupServiceImpl implements ChatGroupService {
    // Mapping between group names and members
    private final Map<String, Set<String>> groups = new ConcurrentHashMap<>();

    public void addGroupMember(String groupName, String username) {
        groups.computeIfAbsent(groupName, k -> ConcurrentHashMap.newKeySet()).add(username);
    }

    public void removeGroupMember(String groupName, String username) {
        if (groups.containsKey(groupName)) {
            groups.get(groupName).remove(username);
            if (groups.get(groupName).isEmpty()) {
                groups.remove(groupName);
            }
        }
    }

    public Set<String> getGroupMembers(String groupName) {
        return groups.getOrDefault(groupName, ConcurrentHashMap.newKeySet());
    }

}
