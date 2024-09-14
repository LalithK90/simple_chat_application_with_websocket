package cyou.simple_chat_app.chat.chat_group.dto;

import cyou.simple_chat_app.chat.chat_group.entity.enums.GroupType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ChatGroupDto {
    private String name;
    private GroupType groupType;
    private int count;
}
