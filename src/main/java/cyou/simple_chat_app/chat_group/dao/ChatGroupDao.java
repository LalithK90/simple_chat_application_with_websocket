package cyou.simple_chat_app.chat_group.dao;

import cyou.simple_chat_app.chat_group.entity.ChatGroup;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatGroupDao extends JpaRepository<ChatGroup, Long> {
}
