package cyou.simple_chat_app.chat.common.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class GroupMessageDTO {
    private String sender,content,groupNumber,number,parentNumber;
    private LocalDateTime timestamp;
}
