package cyou.simple_chat_app.group.entity;




import cyou.simple_chat_app.chat_group_member.entity.ChatGroupMember;
import cyou.simple_chat_app.group.entity.enums.GroupState;
import cyou.simple_chat_app.group.entity.enums.GroupType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ChatGroup {
    private Long id;
    private String name;

    @Enumerated(EnumType.STRING)
    private GroupState groupState;

    @Enumerated(EnumType.STRING)
    private GroupType groupType;

    private Set<ChatGroupMember> chatGroupMembers;
}
