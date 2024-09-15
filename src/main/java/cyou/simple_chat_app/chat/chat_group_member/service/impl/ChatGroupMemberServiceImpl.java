package cyou.simple_chat_app.chat.chat_group_member.service.impl;


import cyou.simple_chat_app.chat.chat_group.entity.ChatGroup;
import cyou.simple_chat_app.chat.chat_group.service.ChatGroupService;
import cyou.simple_chat_app.chat.chat_group_member.dao.ChatGroupMemberDao;
import cyou.simple_chat_app.chat.chat_group_member.entity.ChatGroupMember;
import cyou.simple_chat_app.chat.chat_group_member.entity.enums.MemberType;
import cyou.simple_chat_app.chat.chat_group_member.service.ChatGroupMemberService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class ChatGroupMemberServiceImpl implements ChatGroupMemberService {
    private final ChatGroupService chatGroupService;
    private final ChatGroupMemberDao chatGroupMemberDao;

    public void persist(ChatGroupMember newMember) {
        chatGroupMemberDao.save(newMember);
    }


    public Page<ChatGroupMember> findByChatGroupAndUsernameContaining(ChatGroup group, String search, Pageable pageable) {
        return chatGroupMemberDao.findByChatGroupAndUsernameContainingIgnoreCase(group, search, pageable);
    }

    public Page<ChatGroupMember> findByChatGroup(ChatGroup group, Pageable pageable) {
        return chatGroupMemberDao.findByChatGroup(group, pageable);
    }

    public void deleteByGroupAndUsername(String groupNumber, String username) {
        var group = chatGroupService.findByNumber(groupNumber);
        var chatGroupMember = chatGroupMemberDao.findByChatGroupAndUsername(group, username);
        if (chatGroupMember != null) {
            if (chatGroupMember.getMemberType().equals(MemberType.AD)) {
                chatGroupService.delete(group);
            } else {
                chatGroupMemberDao.delete(chatGroupMember);
            }
        }
    }
}
