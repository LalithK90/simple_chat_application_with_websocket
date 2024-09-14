package cyou.simple_chat_app.chat.chat_group_member.dao;

import cyou.simple_chat_app.chat.chat_group.entity.ChatGroup;
import cyou.simple_chat_app.chat.chat_group_member.entity.ChatGroupMember;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatGroupMemberDao extends JpaRepository<ChatGroupMember, Long> {
    Page<ChatGroupMember> findByChatGroupAndUsernameContaining(ChatGroup chatGroup, String username, Pageable pageable);

}
