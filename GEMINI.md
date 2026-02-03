# Error Fix: Directory Searching in WSL

## Issue
When interacting with a workspace located within a WSL (Windows Subsystem for Linux) distribution from a Windows-based environment, directory searching and file access tools (like `list_dir`, `find_by_name`, `grep_search`) failed when using standard Linux absolute paths (e.g., `/home/user/projects/...`). This was because the agent was running in a Windows context where the root directory (`/`) pointed to the Windows `C:\` drive.

## Error Encountered
`error executing cascade step: CORTEX_STEP_TYPE_LIST_DIRECTORY: directory /home/davidprz/projects/PanaderiaSystemV2 does not exist`

## Fix
To correctly access files and directories in a WSL workspace, use the **UNC (Universal Naming Convention)** path provided in the workspace metadata.

**Correct Path Format:**
`\\wsl.localhost\Ubuntu\home\davidprz\projects\PanaderiaSystemV2`

instead of:
`/home/davidprz/projects/PanaderiaSystemV2`

## Verification
The directory was successfully listed using the UNC path, confirming that all subsequent tool calls should use this format to ensure reliable file operations and directory traversals.
