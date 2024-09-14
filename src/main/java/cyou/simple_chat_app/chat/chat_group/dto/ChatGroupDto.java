package cyou.simple_chat_app.chat.chat_group.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ChatGroupDto {
    private String name,number;
    private int memberCount;
}
