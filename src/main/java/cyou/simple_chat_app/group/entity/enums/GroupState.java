package cyou.simple_chat_app.group.entity.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum GroupState {
    SUSS("Suspended"),
    ACC("Active"),
    DIC("Deactivate");

    private final String groupState;
}
