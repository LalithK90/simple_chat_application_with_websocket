package cyou.simple_chat_app.common.controller;

import cyou.simple_chat_app.chat_group.entity.ChatGroup;
import cyou.simple_chat_app.chat_group.entity.enums.GroupState;
import cyou.simple_chat_app.chat_group.service.ChatGroupService;
import cyou.simple_chat_app.common.dto.ChatGroupDTO;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/groups")
@AllArgsConstructor
public class ChatGroupController {
    private final ChatGroupService groupService;

    @GetMapping
    public List<ChatGroupDTO> getGroups() {
        List<ChatGroupDTO> groupDTOS = new ArrayList<>();
        var  groups = groupService.findAll().stream().filter(x->x.getGroupState().equals(GroupState.ACC)).toList();
        if(!groups.isEmpty()){
            groups.forEach(x-> groupDTOS.add(new ChatGroupDTO(x.getNumber(),x.getName(),x.getPurpose())));
        }
        return groupDTOS;
    }

    @PostMapping
    public ResponseEntity<ChatGroup> createGroup(@RequestBody ChatGroup group) {
        ChatGroup createdGroup = groupService.persist(group);
        return ResponseEntity.ok(createdGroup);
    }

//    @PostMapping("/{groupId}/join")
//    public ResponseEntity<String> joinGroup(@PathVariable Long groupId, @RequestBody User user) {
//        // Logic to handle group join requests
//        groupService.addUserToGroup(groupId, user);
//        return ResponseEntity.ok("User added");
//    }
//
//    @DeleteMapping("/{groupId}/remove")
//    public ResponseEntity<String> removeUserFromGroup(@PathVariable Long groupId, @RequestBody User user) {
//        groupService.removeUserFromGroup(groupId, user);
//        return ResponseEntity.ok("User removed");
//    }
}
