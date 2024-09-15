package cyou.simple_chat_app.chat.chat_group.service;

import cyou.simple_chat_app.chat.chat_group.entity.ChatGroup;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ChatGroupService {
    Page<ChatGroup> findAllActive(Pageable pageable);

    void persist(ChatGroup group);

    ChatGroup findByNumber(String groupNumber);

    Page<ChatGroup> findByNameContainingIgnoreCase(String search, Pageable pageable);

    ChatGroup findById(Long groupId);

    void delete(ChatGroup group);
}
