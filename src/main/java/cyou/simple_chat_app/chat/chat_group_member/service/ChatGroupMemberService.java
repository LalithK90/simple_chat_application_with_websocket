package cyou.simple_chat_app.chat.chat_group_member.service;

import cyou.simple_chat_app.chat.chat_group_member.entity.ChatGroupMember;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ChatGroupMemberService {
    void persist(ChatGroupMember newMember);

    Page<ChatGroupMember> findByChatGroupIdAndUserNameContaining(Long groupId, String search, Pageable pageable);

    Page<ChatGroupMember> findByChatGroupId(Long groupId, Pageable pageable);
}
