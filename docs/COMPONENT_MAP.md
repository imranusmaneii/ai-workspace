# Component Map

## Layout Components

```
AppShell
├── Sidebar
│   ├── WorkspaceSelector
│   ├── ChatList
│   │   └── ChatItem
│   ├── SearchBar
│   └── SidebarFooter
│       ├── UserMenu
│       └── ThemeToggle
├── Header
│   ├── MobileMenuToggle
│   ├── ChatTitle
│   ├── ModelSelector
│   └── WorkspaceActions
└── MainContent
    └── (page-specific content)
```

## Auth Pages

```
AuthLayout
├── LoginPage
│   ├── EmailForm
│   ├── GoogleAuthButton
│   └── AuthFooter (link to register)
└── RegisterPage
    ├── EmailForm
    ├── GoogleAuthButton
    └── AuthFooter (link to login)
```

## Chat Interface

```
ChatPage
├── MessageList
│   ├── MessageItem (user)
│   │   └── MessageContent (markdown)
│   └── MessageItem (assistant)
│       ├── MessageContent (markdown + streaming)
│       └── ArtifactRenderer (if artifact)
├── StreamingIndicator
└── Composer
    ├── MessageInput (auto-resize textarea)
    ├── FileUploadButton
    │   └── FilePreview
    ├── AttachButton (documents context)
    └── SendButton
```

## Workspace

```
WorkspacePage
├── WorkspaceHeader
│   ├── WorkspaceName
│   └── WorkspaceActions (rename, delete)
├── DocumentList
│   ├── DocumentItem
│   │   ├── DocumentInfo (name, type, status)
│   │   └── DocumentActions (delete)
│   └── UploadButton
└── MemoryPanel
    ├── MemoryList
    └── AddMemoryForm
```

## Artifact Panel

```
ArtifactPanel
├── ArtifactHeader
│   ├── ArtifactTitle
│   ├── ArtifactType (code, document, etc.)
│   └── CloseButton
├── ArtifactContent
│   ├── CodeBlock (with syntax highlighting)
│   └── MarkdownRenderer
└── ArtifactActions
    ├── CopyButton
    └── InsertIntoChatButton
```

## Settings

```
SettingsPage
├── ProfileSection
│   ├── AvatarUpload
│   ├── NameInput
│   └── EmailDisplay
├── ModelPreferences
│   ├── DefaultProviderSelect
│   └── DefaultModelSelect
└── ThemeSection
    └── DarkModeToggle
```

## Shared / UI Components (shadcn/ui)

```
ui/
├── Button
├── Input
├── Textarea
├── Dialog
├── DropdownMenu
├── Select
├── Toast / Toaster
├── Skeleton
├── Badge
├── Avatar
├── ScrollArea
├── Tooltip
└── Separator
```
