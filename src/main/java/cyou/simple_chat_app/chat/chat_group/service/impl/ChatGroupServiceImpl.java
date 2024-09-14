package cyou.simple_chat_app.chat.chat_group.service.impl;

import cyou.simple_chat_app.chat.chat_group.dao.ChatGroupDao;
import cyou.simple_chat_app.chat.chat_group.entity.ChatGroup;
import cyou.simple_chat_app.chat.chat_group.entity.enums.GroupState;
import cyou.simple_chat_app.chat.chat_group.service.ChatGroupService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@AllArgsConstructor
public class ChatGroupServiceImpl implements ChatGroupService {

    private final ChatGroupDao chatGroupDao;

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


    public Page<ChatGroup> findAll(Pageable pageable) {
        return chatGroupDao.findAll(pageable);
    }

    public ChatGroup persist(ChatGroup group) {
        if (group.getId() == null) {
            group.setGroupState(GroupState.ACC);
            group.setNumber(UUID.randomUUID().toString());
        }
        return chatGroupDao.save(group);
    }

    public ChatGroup findByNumber(String groupNumber) {
        return chatGroupDao.findByNumber(groupNumber);
    }

    @Override
    public Page<ChatGroup> findByNameContainingIgnoreCase(String search, Pageable pageable) {
        return chatGroupDao.findByNameContainingIgnoreCase(search, pageable);
    }

    public ChatGroup findById(Long groupId) {
        return chatGroupDao.getReferenceById(groupId);
    }
}
