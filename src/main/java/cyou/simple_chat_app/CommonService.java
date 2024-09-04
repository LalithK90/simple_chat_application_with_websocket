package cyou.simple_chat_app;


import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.lang.reflect.Field;

@Service
@Slf4j
public class CommonService {

    public void printAttributesInObject(Object obj) {
        System.out.println("================================================");
        Class<?> objClass = obj.getClass();
        Field[] fields = objClass.getDeclaredFields();

        for (Field field : fields) {
            field.setAccessible(true);
            String name = field.getName();
            Object value;
            try {
                value = field.get(obj);
            } catch (IllegalAccessException e) {
                value = null;
            }
            log.info("{} = {}", name, value);
        }
        System.out.println("================================================");

    }

    public String generateUniqCode(int length) {
        // Define the length of the random string
        if (length < 0) {
            length = 6;
        }
        // Define the characters to use in the random string
        String characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

        // Generate CustomAuditListener random string of the specified length
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            int index = (int) (Math.random() * characters.length());
            sb.append(characters.charAt(index));
        }

        return sb.toString();
    }
}
