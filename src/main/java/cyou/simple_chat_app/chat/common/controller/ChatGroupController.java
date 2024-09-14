package cyou.simple_chat_app.chat.common.controller;


import cyou.simple_chat_app.chat.chat_group.dto.ChatGroupDto;
import cyou.simple_chat_app.chat.chat_group.dto.ChatGroupMemberDto;
import cyou.simple_chat_app.chat.chat_group.entity.ChatGroup;
import cyou.simple_chat_app.chat.chat_group.entity.enums.GroupState;
import cyou.simple_chat_app.chat.chat_group.service.ChatGroupService;
import cyou.simple_chat_app.chat.chat_group_member.entity.ChatGroupMember;
import cyou.simple_chat_app.chat.chat_group_member.entity.enums.MemberStatus;
import cyou.simple_chat_app.chat.chat_group_member.entity.enums.MemberType;
import cyou.simple_chat_app.chat.chat_group_member.service.ChatGroupMemberService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/chatgroups")
@AllArgsConstructor
public class ChatGroupController {
    private final ChatGroupService chatGroupService;
    private final ChatGroupMemberService chatGroupMemberService;

//    save group
    @PostMapping
    public ResponseEntity<ChatGroup> createGroup(@RequestBody ChatGroup group) {
        System.out.println(group.toString());
        ChatGroup createdGroup = chatGroupService.persist(group);
        return ResponseEntity.ok(createdGroup);
    }

    // Get paginated and filtered groups
    @GetMapping
    public ResponseEntity<Page<ChatGroupDto>> getPaginatedGroups(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ChatGroup> groupPage;

        if (search != null && !search.isEmpty()) {
            groupPage = chatGroupService.findByNameContainingIgnoreCase(search, pageable);
        } else {
            groupPage = chatGroupService.findAll(pageable);
        }

        // Map to DTO
        Page<ChatGroupDto> groupDtoPage = groupPage.map(group ->
                new ChatGroupDto(group.getName(), group.getGroupType(), group.getChatGroupMembers().size())
        );

        return ResponseEntity.ok(groupDtoPage);
    }



    @PostMapping("/join/{groupNumber}")
    public ResponseEntity<String> joinGroup(@PathVariable String groupNumber, Principal principal) {

        var username = principal.getName();
        ChatGroup group = chatGroupService.findByNumber(groupNumber);
        var groupMembers = group.getChatGroupMembers();
        boolean alreadyMember = groupMembers.stream()
                .anyMatch(member -> member.getUsername().equals(username));

        if (alreadyMember) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("You are already a member of this group. Group Number: " + groupNumber);
        }

        ChatGroupMember newMember = new ChatGroupMember();
        newMember.setChatGroup(group);
        newMember.setUsername(username);
        if (group.getGroupState().equals(GroupState.ACC)) {
            newMember.setMemberStatus(MemberStatus.ACT);
        } else {
            newMember.setMemberStatus(MemberStatus.PEN);
        }
        if (!groupMembers.isEmpty()) {
            newMember.setMemberType(MemberType.MEM);
        } else {
            newMember.setMemberType(MemberType.AD);
        }

        chatGroupMemberService.persist(newMember);
        return ResponseEntity.ok("Joined the group successfully!");
    }

    @GetMapping("/{groupId}/members")
    public ResponseEntity<Page<ChatGroupMemberDto>> getPaginatedGroupMembers(
            @PathVariable Long groupId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ChatGroupMember> memberPage;

        if (search != null && !search.isEmpty()) {
            memberPage = chatGroupMemberService.findByChatGroupIdAndUserNameContaining(groupId, search, pageable);
        } else {
            memberPage = chatGroupMemberService.findByChatGroupId(groupId, pageable);
        }

        // Map to DTO
        Page<ChatGroupMemberDto> memberDtoPage = memberPage.map(member ->
                new ChatGroupMemberDto(member.getUsername(), member.getChatGroup().getName())
        );

        return ResponseEntity.ok(memberDtoPage);
    }
}
