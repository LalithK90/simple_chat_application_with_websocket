package cyou.simple_chat_app.chat.chat_group_member.entity;


import cyou.simple_chat_app.audit.AuditEntity;
import cyou.simple_chat_app.chat.chat_group.entity.ChatGroup;
import cyou.simple_chat_app.chat.chat_group_member.entity.enums.MemberStatus;
import cyou.simple_chat_app.chat.chat_group_member.entity.enums.MemberType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ChatGroupMember extends AuditEntity {

    private String username, number;

    @Enumerated(EnumType.STRING)
    private MemberType memberType;

    @Enumerated(EnumType.STRING)
    private MemberStatus memberStatus;

    @ManyToOne
    private ChatGroup chatGroup;
}
