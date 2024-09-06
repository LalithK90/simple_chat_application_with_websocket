package cyou.simple_chat_app.chat_group.entity;




import cyou.simple_chat_app.audit.AuditEntity;
import cyou.simple_chat_app.chat_group_member.entity.ChatGroupMember;
import cyou.simple_chat_app.chat_group.entity.enums.GroupState;
import cyou.simple_chat_app.chat_group.entity.enums.GroupType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ChatGroup extends AuditEntity {
    private Long id;
    private String name, number, purpose;

    @Enumerated(EnumType.STRING)
    private GroupState groupState;

    @Enumerated(EnumType.STRING)
    private GroupType groupType;

    @OneToMany
    private Set<ChatGroupMember> chatGroupMembers;
}
