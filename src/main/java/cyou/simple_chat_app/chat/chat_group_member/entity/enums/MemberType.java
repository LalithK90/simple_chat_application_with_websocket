package cyou.simple_chat_app.chat.chat_group_member.entity.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum MemberType {
    MEM("Member"),
    MO("Moderator"),
    AD("Admin");

    private final String memberType;
}
