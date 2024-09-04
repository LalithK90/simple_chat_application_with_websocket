package cyou.simple_chat_app.chat_group_member.entity;


import cyou.simple_chat_app.chat_group_member.entity.enums.MemberType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ChatGroupMember {
private String username;
    @Enumerated(EnumType.STRING)
    private MemberType memberType;
}
