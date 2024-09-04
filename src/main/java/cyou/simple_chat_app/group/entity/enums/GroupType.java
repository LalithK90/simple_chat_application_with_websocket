package cyou.simple_chat_app.group.entity.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum GroupType {
    PRIVATE("Private"),
    PUBLIC("Public");

    private final String groupType;
}
