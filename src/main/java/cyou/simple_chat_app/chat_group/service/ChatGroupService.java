package cyou.simple_chat_app.chat_group.service;

import cyou.simple_chat_app.chat_group.entity.ChatGroup;

import java.util.List;

public interface ChatGroupService {
    List<ChatGroup> findAll();

    ChatGroup persist(ChatGroup group);
}
