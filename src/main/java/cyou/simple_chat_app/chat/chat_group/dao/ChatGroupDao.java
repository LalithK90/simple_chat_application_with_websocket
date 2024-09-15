package cyou.simple_chat_app.chat.chat_group.dao;

import cyou.simple_chat_app.chat.chat_group.entity.ChatGroup;
import cyou.simple_chat_app.chat.chat_group.entity.enums.GroupState;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ChatGroupDao extends JpaRepository<ChatGroup, Long> {
    ChatGroup findByNumber(String groupNumber);

    Page<ChatGroup> findByNameContainingIgnoreCase(String name, Pageable pageable);

    // Custom query to improve performance and fetch group and member count
    @Query("SELECT g FROM ChatGroup g LEFT JOIN FETCH g.chatGroupMembers WHERE g.name LIKE %:name%")
    Page<ChatGroup> searchGroupsWithMembers(@Param("name") String name, Pageable pageable);

    Page<ChatGroup> findByGroupState(GroupState groupState, Pageable pageable);

    Page<ChatGroup> findByGroupStateAndNameContainingIgnoreCase(GroupState groupState, String search, Pageable pageable);
}
