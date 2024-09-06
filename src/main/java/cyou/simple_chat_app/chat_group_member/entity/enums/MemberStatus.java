package cyou.simple_chat_app.chat_group_member.entity.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum MemberStatus {
    PEN("Pending"),
    ACT("Active"),
    DEL("Delete User"),
    SUS("Suspended User");

    private final String memberStatus;
}
