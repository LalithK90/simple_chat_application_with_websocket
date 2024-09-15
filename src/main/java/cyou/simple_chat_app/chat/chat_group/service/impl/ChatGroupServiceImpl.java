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


    public Page<ChatGroup> findAllActive(Pageable pageable) {
        return chatGroupDao.findByGroupState( GroupState.ACC,pageable);
    }


    public void persist(ChatGroup group) {
        if (group.getId() == null) {
            group.setGroupState(GroupState.ACC);
            group.setNumber(UUID.randomUUID().toString());
        }
        chatGroupDao.save(group);
    }

    public ChatGroup findByNumber(String groupNumber) {
        return chatGroupDao.findByNumber(groupNumber);
    }


    public Page<ChatGroup> findByNameContainingIgnoreCase(String search, Pageable pageable) {
        return chatGroupDao.findByGroupStateAndNameContainingIgnoreCase(GroupState.ACC,search, pageable);
    }

    public ChatGroup findById(Long groupId) {
        return chatGroupDao.getReferenceById(groupId);
    }

    public void delete(ChatGroup group) {
        chatGroupDao.delete(group);
    }
}
