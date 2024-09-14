package cyou.simple_chat_app.chat.chat_group.controller;


import cyou.simple_chat_app.chat.chat_group.dto.ChatGroupDto;
import cyou.simple_chat_app.chat.chat_group.dto.ChatGroupMemberDto;
import cyou.simple_chat_app.chat.chat_group.entity.ChatGroup;
import cyou.simple_chat_app.chat.chat_group.entity.enums.GroupState;
import cyou.simple_chat_app.chat.chat_group.service.ChatGroupService;
import cyou.simple_chat_app.chat.chat_group_member.entity.ChatGroupMember;
import cyou.simple_chat_app.chat.chat_group_member.entity.enums.MemberStatus;
import cyou.simple_chat_app.chat.chat_group_member.entity.enums.MemberType;
import cyou.simple_chat_app.chat.chat_group_member.service.ChatGroupMemberService;
import cyou.simple_chat_app.chat.common.controller.ChatController;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.MvcUriComponentsBuilder;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/chat/groups")
@AllArgsConstructor
public class ChatGroupController {
    private final ChatGroupService chatGroupService;
    private final ChatGroupMemberService chatGroupMemberService;

    @GetMapping("/page")
    public String getGroup(Model model) {
        model.addAttribute("messageUrl", MvcUriComponentsBuilder.fromMethodName(ChatController.class, "secretKey").toUriString());
        model.addAttribute("currentUser", SecurityContextHolder.getContext().getAuthentication().getName());

        model.addAttribute("getGroupsUrl", MvcUriComponentsBuilder.fromMethodName(ChatGroupController.class, "getPaginatedGroups", "", "", "", "").toUriString());
        model.addAttribute("createGroupUrl", MvcUriComponentsBuilder.fromMethodName(ChatGroupController.class, "createGroup", "").toUriString());

        return "message/messageGroup";
    }

    //    save group
    @PostMapping
    @ResponseBody
    public ResponseEntity<Boolean> createGroup(@RequestBody ChatGroup group) {
        if (group.getId() == null) {
            ChatGroupMember chatGroupMember = new ChatGroupMember();
            chatGroupMember.setChatGroup(group);
            chatGroupMember.setMemberStatus(MemberStatus.ACT);
            chatGroupMember.setMemberType(MemberType.AD);
            chatGroupMember.setUsername(SecurityContextHolder.getContext().getAuthentication().getName());
            group.setChatGroupMembers(List.of(chatGroupMember));
        }
        chatGroupService.persist(group);
        return new ResponseEntity<>(Boolean.TRUE, HttpStatus.CREATED);
    }

    // Get paginated and filtered groups
    @GetMapping
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getPaginatedGroups(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "5") int size, @RequestParam(required = false) String search, @RequestParam(required = false, defaultValue = "1") int draw) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ChatGroup> groupPage;

        if (search != null && !search.isEmpty()) {
            groupPage = chatGroupService.findByNameContainingIgnoreCase(search, pageable);
        } else {
            groupPage = chatGroupService.findAll(pageable);
        }

        List<ChatGroupDto> groupDtos = groupPage.getContent().stream().map(group -> new ChatGroupDto(group.getName(), group.getNumber(), group.getChatGroupMembers().size())).collect(Collectors.toList());


        Map<String, Object> response = new HashMap<>();
        response.put("draw", draw);
        response.put("recordsTotal", groupPage.getTotalElements());
        response.put("recordsFiltered", groupPage.getTotalElements());
        response.put("data", groupDtos);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/join/{groupNumber}")
    @ResponseBody
    public ResponseEntity<String> joinGroup(@PathVariable String groupNumber, Principal principal) {

        var username = principal.getName();
        ChatGroup group = chatGroupService.findByNumber(groupNumber);
        var groupMembers = group.getChatGroupMembers();
        boolean alreadyMember = groupMembers.stream().anyMatch(member -> member.getUsername().equals(username));

        if (alreadyMember) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("You are already a member of this group. Group Number: " + groupNumber);
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
    @ResponseBody
    public ResponseEntity<Page<ChatGroupMemberDto>> getPaginatedGroupMembers(@PathVariable Long groupId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size, @RequestParam(required = false) String search) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ChatGroupMember> memberPage;

        if (search != null && !search.isEmpty()) {
            memberPage = chatGroupMemberService.findByChatGroupIdAndUserNameContaining(groupId, search, pageable);
        } else {
            memberPage = chatGroupMemberService.findByChatGroupId(groupId, pageable);
        }

        // Map to DTO
        Page<ChatGroupMemberDto> memberDtoPage = memberPage.map(member -> new ChatGroupMemberDto(member.getUsername(), member.getChatGroup().getName()));

        return ResponseEntity.ok(memberDtoPage);
    }
}
