package cyou.simple_chat_app.user.entity;

import cyou.simple_chat_app.audit.AuditEntity;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class User extends AuditEntity {
    private String username;
}
