package cyou.simple_chat_app.user.dao;

import cyou.simple_chat_app.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserDao extends JpaRepository<User, Long> {
    User findByUsername(String name);
}
