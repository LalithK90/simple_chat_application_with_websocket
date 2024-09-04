package cyou.simple_chat_app.config;


import cyou.simple_chat_app.CommonService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {

    @Bean
    public CommonService commonService() {
        return new CommonService();
    }

}
