package cyou.simple_chat_app.chat.chat_group.entity;


import cyou.simple_chat_app.audit.AuditEntity;
import cyou.simple_chat_app.chat.chat_group.entity.enums.GroupState;
import cyou.simple_chat_app.chat.chat_group.entity.enums.GroupType;
import cyou.simple_chat_app.chat.chat_group_member.entity.ChatGroupMember;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ChatGroup extends AuditEntity {

    private String name, number, purpose;

    @Enumerated(EnumType.STRING)
    private GroupState groupState;

    @Enumerated(EnumType.STRING)
    private GroupType groupType;

    @OneToMany(mappedBy = "chatGroup", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    private List<ChatGroupMember> chatGroupMembers;
}
