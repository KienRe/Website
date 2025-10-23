+++
title = "Creating a Steam Upload Tool in Unreal Engine"
date = 2024-12-01
description = "Building a custom Slate UI tool in Unreal Engine to streamline Steam build uploads"
template = "blog-page.html"

[extra]
reading_time = 10
excerpt = "Uploading builds to Steam typically involves running SteamCMD from the command line with various parameters. For teams working in Unreal Engine, having a custom editor tool that streamlines this process can save time and reduce errors. This post walks through creating a Slate-based UI widget that integrates directly into the Unreal Editor, making Steam uploads a one-click operation."
+++

Uploading builds to Steam typically involves running SteamCMD from the command line with various parameters. For teams working in Unreal Engine, having a **custom editor tool** that streamlines this process can save time and reduce errors. This post walks through creating a **Slate-based UI widget** that integrates directly into the Unreal Editor, making Steam uploads a one-click operation.

---

## Why Build This Tool?

The typical Steam upload workflow involves:

- Opening a command prompt or terminal
- Navigating to the SteamCMD directory
- Running commands with proper credentials and VDF file paths
- Managing sensitive passwords in plaintext

By integrating this into the Unreal Editor, we can provide a **user-friendly interface** with validation, file browsing, and secure credential handling via environment variables.

---

## Step 1: Create the Slate Widget

We'll use Unreal's **Slate framework** to build a custom UI window. The widget includes:

- Text fields for Steam username, VDF path, and SteamCMD path
- Read-only password field (reads from environment variable)
- Browse buttons for file selection
- Upload button with validation
- Status display for feedback

Here's the header file (`SteamUpload.h`):

```cpp
#pragma once

#include "CoreMinimal.h"
#include "Widgets/SCompoundWidget.h"

class SEditableTextBox;

class SSteamUploadWidget : public SCompoundWidget
{
public:
    SLATE_BEGIN_ARGS(SSteamUploadWidget) {}
    SLATE_END_ARGS()

    void Construct(const FArguments& InArgs);

private:
    TSharedPtr<SEditableTextBox> UsernameTextBox;
    TSharedPtr<SEditableTextBox> PasswordTextBox;
    TSharedPtr<SEditableTextBox> VDFPathTextBox;
    TSharedPtr<SEditableTextBox> SteamCMDPathTextBox;
    TSharedPtr<STextBlock> StatusTextBlock;

    FReply OnUploadClicked();
    FReply OnBrowseVDFClicked();
    FReply OnBrowseSteamCMDClicked();
    
    void UpdateStatus(const FString& Message, const FLinearColor& Color);
    bool ValidateInputs(FString& OutErrorMessage);
};

class FSteamUpload
{
public:
    static void OpenSteamUploadWidget();
    static void Run(const FString& Username, const FString& Password, 
                    const FString& VDFPath, const FString& SteamCMDPath);
};
```

---

## Step 2: Implement the Upload Logic

The core upload function uses `FPlatformProcess::CreateProc` to launch SteamCMD with the appropriate parameters:

```cpp
void FSteamUpload::Run(const FString& Username, const FString& Password, 
                       const FString& VDFPath, const FString& SteamCMDPath)
{
    // Format: steamcmd.exe +login <username> <password> +run_app_build <vdf_path>
    FString Arguments = FString::Printf(
        TEXT("+login %s %s +run_app_build \"%s\""), 
        *Username, *Password, *VDFPath
    );
    
    UE_LOG(LogTemp, Log, TEXT("Launching SteamCMD: %s %s"), 
           *SteamCMDPath, *Arguments);

    FString CommandLine = FString::Printf(TEXT("/c \"%s %s\""), 
                                           *SteamCMDPath, *Arguments);
    FPlatformProcess::CreateProc(
        TEXT("cmd.exe"),
        *CommandLine,
        true,   // bLaunchDetached
        false,  // bLaunchHidden
        false,  // bLaunchReallyHidden
        nullptr,
        0,
        nullptr,
        nullptr
    );
}
```

The password is read from the `STEAM_PASSWORD` environment variable to avoid storing credentials in the project:

```cpp
FString Password = FPlatformMisc::GetEnvironmentVariable(TEXT("STEAM_PASSWORD"));
```

---

## Step 3: Add Validation

Before launching SteamCMD, validate all inputs to provide clear error messages:

```cpp
bool SSteamUploadWidget::ValidateInputs(FString& OutErrorMessage)
{
    if (UsernameTextBox->GetText().IsEmpty())
    {
        OutErrorMessage = TEXT("Error: Steam username is required");
        return false;
    }

    FString Password = FPlatformMisc::GetEnvironmentVariable(TEXT("STEAM_PASSWORD"));
    if (Password.IsEmpty())
    {
        OutErrorMessage = TEXT("Error: STEAM_PASSWORD environment variable is not set");
        return false;
    }

    FString VDFPath = VDFPathTextBox->GetText().ToString();
    if (!FPaths::FileExists(VDFPath))
    {
        OutErrorMessage = TEXT("Error: VDF file does not exist");
        return false;
    }

    FString SteamCMDPath = SteamCMDPathTextBox->GetText().ToString();
    if (!FPaths::FileExists(SteamCMDPath))
    {
        OutErrorMessage = TEXT("Error: SteamCMD executable does not exist");
        return false;
    }

    return true;
}
```

---

## Step 4: Integrate into Editor Menu

To make the tool easily accessible, add it to a custom editor menu. First, create the command in your editor commands class:

```cpp
// In your editor commands header
class FCustomEditorCommands : public TCommands<FCustomEditorCommands>
{
public:
    TSharedPtr<FUICommandInfo> UploadToSteamCommand;
    
    virtual void RegisterCommands() override
    {
        UI_COMMAND(UploadToSteamCommand, "Upload to Steam", 
                   "Uploads a build to steam.", 
                   EUserInterfaceActionType::Button, FInputChord());
    }
};
```

Then wire it up in your menu class:

```cpp
void FRetroMenu::MapCommandsToActions()
{
    Commands = MakeShareable(new FUICommandList);
    Commands->MapAction(
        FCustomEditorCommands::Get().UploadToSteamCommand, 
        FExecuteAction::CreateStatic(FSteamUpload::OpenSteamUploadWidget)
    );
}

void FRetroMenu::CreateSubmenu()
{
    UToolMenus* ToolMenus = UToolMenus::Get();
    UToolMenu* MainMenuBar = ToolMenus->ExtendMenu("LevelEditor.MainMenu");
    
    UToolMenu* RetroMenu = MainMenuBar->AddSubMenu(
        "MainMenu", NAME_None, "Retro", 
        FText::FromString("Retro"), 
        FText::FromString("RetroMenu")
    );
    
    FToolMenuSection& SteamSection = RetroMenu->AddSection(
        "Steam", FText::FromString("Steam")
    );
    SteamSection.AddMenuEntryWithCommandList(
        FCustomEditorCommands::Get().UploadToSteamCommand, Commands
    );
}
```

---

## Step 5: Initialize in Your Editor Module

Finally, create the menu when your editor module starts up:

```cpp
class FRetroEditorModule : public IModuleInterface
{
public:
    virtual void StartupModule() override
    {
        // Initialize custom menu
        RetroMenu = FRetroMenu::CreateMenu();
    }
    
    virtual void ShutdownModule() override
    {
        RetroMenu.Reset();
    }

private:
    TSharedPtr<FRetroMenu> RetroMenu;
};
```

---

## Understanding VDF Files

VDF (Valve Data File) files are configuration files that tell SteamCMD **what to upload** and **where to publish it**. You'll need two types of VDF files:

### App Build Configuration

The main configuration file defines your app ID, build description, and which branch to publish to:

```ini
"appbuild"
{
    "appid"       "4115780"
    "desc"        "Retro Dev Build"
    "buildoutput" "output"
    "setlive"     "development"
    "preview"     "0"
    "local"       ""

    "depots"
    {
        "4115781" "depot_4115781.vdf"
    }
}
```

- `appid`: Your Steam app ID
- `desc`: Description for this build (shows in Steam admin)
- `setlive`: Which branch to publish to (`development`, `public`, etc.)
- `depots`: List of depot configuration files to include

### Depot Configuration

The depot file specifies which files to upload and where they're located:

```ini
"DepotBuildConfig"
{
    "DepotID" "4115781"
    "ContentRoot" "..\..\Saved\StagedBuilds\Windows"
    "FileMapping"
    {
        "LocalPath" "*"
        "DepotPath" "."
        "recursive" "1"
    }
    "FileExclusion" "*.pdb"
}
```

- `DepotID`: Your depot ID (created in Steamworks)
- `ContentRoot`: Path to your packaged build directory
- `FileMapping`: Maps local files to Steam depot structure
- `FileExclusion`: Pattern for files to skip (like debug symbols)

### Multiple Branches

Create separate app build files for different branches (development, staging, public). The only difference is typically the `setlive` value:

```ini
// app_dev.vdf
"setlive" "development"

// app_release.vdf
"setlive" "public"
```

Store these VDF files in a `Tools/Steam` directory in your project. The relative paths in `ContentRoot` should point to your packaged build output.

---

## Setting Up Environment Variables

To use the tool, set the `STEAM_PASSWORD` environment variable before launching the editor:

**Windows:**
```cmd
setx STEAM_PASSWORD "your_password_here"
```

**Linux/Mac:**
```bash
export STEAM_PASSWORD="your_password_here"
```

---

## Key Features

- **Secure credential handling:** Passwords never stored in project files or source control
- **File browser integration:** Native OS file dialogs for selecting VDF and SteamCMD paths
- **Input validation:** Clear error messages for missing or invalid configurations
- **Default paths:** Pre-configured paths for common project structures
- **Status feedback:** Visual indicators for upload progress and errors
- **Detached process:** SteamCMD runs in its own window, keeping the editor responsive

---

## Conclusion

This Steam upload tool demonstrates how **Slate UI** can create professional, integrated workflows within the Unreal Editor. By combining **editor commands**, **custom menus**, and **process management**, you can streamline repetitive tasks and reduce the chance of upload errors.

This approach works well for:

- Build automation workflows
- Distribution pipelines requiring multiple upload targets
- Teams that need consistent upload procedures
- Projects with frequent Steam build iterations

The same pattern can be extended to handle other external tools like **console devkits**, **itch.io uploads**, or **custom CDN deployments**.