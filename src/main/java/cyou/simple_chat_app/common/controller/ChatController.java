package cyou.simple_chat_app.common.controller;


import cyou.simple_chat_app.common.dto.MessageDTO;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.method.annotation.MvcUriComponentsBuilder;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.UUID;


@Controller
@AllArgsConstructor
public class ChatController {
    private final SimpMessagingTemplate messagingTemplate;


    @MessageMapping("/chat.private.{username}")
    public void sendPrivateMessage(@DestinationVariable String username, MessageDTO message) {
        message.setNumber(UUID.randomUUID().toString());
        System.out.println(message);
        messagingTemplate.convertAndSendToUser(username, "/queue/messages", message);
    }

    @MessageMapping("/chat.group")
    public void sendGroupMessage(MessageDTO message) {
        messagingTemplate.convertAndSend("/topic/group", message);
    }


    @GetMapping("/chat")
    public String message(Model model) {
        model.addAttribute("messageUrl", MvcUriComponentsBuilder.fromMethodName(ChatController.class, "secretKey").toUriString());
        model.addAttribute("getGroupsUrl", MvcUriComponentsBuilder.fromMethodName(ChatGroupController.class, "getGroups").toUriString());
        model.addAttribute("createGroupUrl", MvcUriComponentsBuilder.fromMethodName(ChatGroupController.class, "createGroup","").toUriString());
        model.addAttribute("currentUser", SecurityContextHolder.getContext().getAuthentication().getName());

        return "message/message";
    }

    @GetMapping("/chat/s")
    @ResponseBody
    private String secretKey() {
        return "N7MtcRGcI1HvPPf8zIstGtkoGEFeiMTeT2YRhK6qAn8=";
    }

    private String generateSecretKey() throws NoSuchAlgorithmException {
        KeyGenerator keyGen = KeyGenerator.getInstance("AES");
        keyGen.init(256); // 256-bit key for strong encryption
        SecretKey secretKey = keyGen.generateKey();
        return Base64.getEncoder().encodeToString(secretKey.getEncoded());
    }
}

