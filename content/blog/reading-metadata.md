+++
title = "Reading Metadata Specifiers in a Packaged Build in Unreal"
date = 2024-12-01
description = "How to access metadata specifiers in packaged Unreal Engine builds using commandlets and non-asset staging"
template = "blog-page.html"

[extra]
reading_time = 8
excerpt = "One common challenge in Unreal Engine development is accessing metadata specifiers (custom function or property metadata) in a packaged build. By default, metadata is mostly accessible in-editor, but if you want this information at runtime or in the shipped game, you need a workflow to export, package, and load metadata automatically."

+++

One common challenge in Unreal Engine development is accessing **metadata specifiers** (custom function or property metadata) in a packaged build. By default, metadata is mostly accessible in-editor, but if you want this information at runtime or in the shipped game, you need a workflow to **export, package, and load metadata automatically**. This post walks through a robust solution using a combination of **commandlets, runtime dependencies, and non-asset directories**.

---

## Understanding Packaging in Unreal

Before diving into the solution, it's helpful to understand the Unreal build process:

1. **UHT (Unreal Header Tool)** runs first during compilation. It generates code based on UCLASS, USTRUCT, UFUNCTION, and other macros. This ensures metadata specifiers and reflection data exist in your code.
2. **UBT (Unreal Build Tool)** then compiles your C++ modules and engine code.
3. **UAT (Unreal Automation Tool)** handles the higher-level build workflow:
   - Builds and compiles the project.
   - Runs cook and package steps (`BuildCookRun`).
   - Stages files into the packaged directory structure.

**Key insight:** When pressing **Package** in the editor, UAT is triggered behind the scenes, but it doesn't automatically know about any custom post-package steps you want. This is why adding metadata export directly in the **Target.cs pre-build step** is useful: it runs after compilation but before UAT stages files, ensuring your metadata is always up-to-date.

---

## Step 1: Export Metadata Using a Commandlet

We created a `UMetadataSubsystem` to handle collecting function metadata and exporting it to JSON. By wrapping the export logic in a **commandlet**, we can run it during the build process.

```cpp
void UMetadataSubsystem::ExportAllMetadata()
{
#if WITH_EDITOR
    TArray<FFunctionMetadata> AllMetadata;

    for (TObjectIterator<UClass> ClassIt; ClassIt; ++ClassIt)
    {
        for (TFieldIterator<UFunction> FuncIt(*ClassIt); FuncIt; ++FuncIt)
        {
            UFunction* Function = *FuncIt;
            if (IsFunctionInModule(Function))
            {
                FFunctionMetadata Metadata(Function);
                if (!Metadata.IsEmpty())
                {
                    AllMetadata.Add(Metadata);
                }
            }
        }
    }

    FString JsonString;
    TArray<TSharedPtr<FJsonValue>> JsonArray;
    for (const FFunctionMetadata& Metadata : AllMetadata)
    {
        JsonArray.Add(MakeShared<FJsonValueObject>(
            FJsonObjectConverter::UStructToJsonObject(Metadata)
        ));
    }
    const TSharedRef<TJsonWriter<>> Writer = TJsonWriterFactory<>::Create(&JsonString);
    FJsonSerializer::Serialize(JsonArray, Writer);

    FFileHelper::SaveStringToFile(JsonString, *GetMetadataFilePath());
#endif
}
```

This generates a JSON file (`Functions.meta.json`) in a predictable project folder (`Content/Metadata`).

---

## Step 2: Automate Metadata Generation During Build

In your `Game.Target.cs`, add a **pre-build step** to run the commandlet before packaging:

```cpp
PreBuildSteps.Add("echo Running ExportMetadataCommandlet...");
PreBuildSteps.Add("\"$(EngineDir)/Binaries/Win64/UnrealEditor-Cmd.exe\" \"$(ProjectFile)\" -run=ExportMetadata -unattended");
```

This ensures that every time you **compile or package**, the metadata JSON is up-to-date **before UAT stages files**.

---

## Step 3: Stage Metadata in Packaged Builds

To include the metadata in the packaged game:

1. Add the directory to **"Additional Non-Asset Directories to Copy"** in Project Settings:

```ini
+DirectoriesToAlwaysStageAsNonUFS=(Path="Metadata")
```

2. The JSON files will now be staged to `Content/Metadata` in the packaged build.
3. At runtime, the `UMetadataSubsystem` can **load the JSON**:

```cpp
void UMetadataSubsystem::LoadMetadata()
{
    const FString FilePath = GetMetadataFilePath();
    if (!FPaths::FileExists(FilePath)) return;

    TArray<FFunctionMetadata> LoadedMetadata;
    FString JsonString;
    FFileHelper::LoadFileToString(JsonString, *FilePath);
    FJsonObjectConverter::JsonArrayStringToUStruct(JsonString, &LoadedMetadata);

    for (const FFunctionMetadata& Metadata : LoadedMetadata)
    {
        FunctionMetadataCache.Add(FName(*Metadata.FunctionName), Metadata);
    }
}
```

---

## Step 4: Avoid Polluting Source Control

Since the JSON files are regenerated on every build, add them to `.p4ignore` or `.gitignore`:

```gitignore
# Ignore generated metadata JSON files
*meta.json
Saved/Metadata/*meta.json
```

---

## Why This Works

- **Pre-build commandlet:** Ensures JSON is generated after compilation but **before UAT stages files**.
- **Non-asset staging:** Ensures the JSON is copied into the packaged game.
- **Runtime loading:** Lets your game access metadata specifiers in packaged builds.
- **Editor-friendly:** Simply pressing **Package** triggers everything automatically.

---

## Conclusion

By combining a **commandlet**, **pre-build steps**, and **non-asset staging**, you can seamlessly expose editor metadata to packaged builds. Understanding the **UHT → UBT → UAT pipeline** was key to ensuring your metadata is always up-to-date and correctly staged.

This workflow is perfect for:

- AI systems that need function metadata.
- Runtime introspection.
- Debugging or gameplay systems requiring metadata at runtime.