package cyou.simple_chat_app.chat.chat_group_member.service.impl;


import cyou.simple_chat_app.chat.chat_group.service.ChatGroupService;
import cyou.simple_chat_app.chat.chat_group_member.dao.ChatGroupMemberDao;
import cyou.simple_chat_app.chat.chat_group_member.entity.ChatGroupMember;
import cyou.simple_chat_app.chat.chat_group_member.service.ChatGroupMemberService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class ChatGroupMemberServiceImpl implements ChatGroupMemberService {
    private final ChatGroupMemberDao chatGroupMemberDao;
    private final ChatGroupService chatGroupService;

    public void persist(ChatGroupMember newMember) {
        chatGroupMemberDao.save(newMember);
    }

    @Override
    public Page<ChatGroupMember> findByChatGroupIdAndUserNameContaining(Long groupId, String search, Pageable pageable) {
       var chatGroup = chatGroupService.findById(groupId);
        return chatGroupMemberDao.findByChatGroupAndUsernameContaining(chatGroup, search, pageable);
    }

    @Override
    public Page<ChatGroupMember> findByChatGroupId(Long groupId, Pageable pageable) {
        return null;
    }
}
