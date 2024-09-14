package cyou.simple_chat_app.user.service;

import cyou.simple_chat_app.user.dao.UserDao;
import cyou.simple_chat_app.user.entity.User;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class UserService {
private final UserDao userDao;
    public User findByUsername(String name) {
    return userDao.findByUsername(name);
    }
}
