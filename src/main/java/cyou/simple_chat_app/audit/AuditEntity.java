package cyou.simple_chat_app.audit;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class AuditEntity implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreatedBy
    @Basic(optional = false)
    @Column(updatable = false, nullable = false)
    private String createdBy;

    @CreatedDate
    @Basic(optional = false)
    @Column(updatable = false, nullable = false)
    private LocalDateTime createdAt;

    @LastModifiedBy
    @Basic(optional = false)
    @Column(nullable = false)
    private String updatedBy;

    @LastModifiedDate
    @Basic(optional = false)
    @Column(nullable = false)
    private LocalDateTime updatedAt;

}
