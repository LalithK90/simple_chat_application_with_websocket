package cyou.simple_chat_app;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class MainController {

    @GetMapping("/login")
    public String login() {
        return "login/login";
    }

    @GetMapping("/home")
    public String home() {
        return "redirect:/chat";
    }

    @GetMapping("/favicon.ico")
    @ResponseBody
    public void homeI() {
    }
}