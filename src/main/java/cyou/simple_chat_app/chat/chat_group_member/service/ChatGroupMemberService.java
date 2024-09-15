package cyou.simple_chat_app.chat.chat_group_member.service;

import cyou.simple_chat_app.chat.chat_group.entity.ChatGroup;
import cyou.simple_chat_app.chat.chat_group_member.entity.ChatGroupMember;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ChatGroupMemberService {
    void persist(ChatGroupMember newMember);

    Page<ChatGroupMember> findByChatGroupAndUsernameContaining(ChatGroup group, String search, Pageable pageable);

    Page<ChatGroupMember> findByChatGroup(ChatGroup group, Pageable pageable);

    void deleteByGroupAndUsername(String groupNumber, String username);
}
