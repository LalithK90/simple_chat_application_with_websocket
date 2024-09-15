package cyou.simple_chat_app.chat.chat_group.dto;

import org.springframework.util.MultiValueMap;

public record ChatGroupDetailDTO(String number, String name, String purpose, String groupType) {
}
