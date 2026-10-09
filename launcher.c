#define UNICODE
#define _UNICODE
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <shellapi.h>
#include <shlobj.h>

#define IDR_HTML_APP 201

// Recursively ensure destination directory exists
static void EnsureFolder(const wchar_t* path) {
    wchar_t temp[MAX_PATH];
    wcsncpy(temp, path, MAX_PATH);
    temp[MAX_PATH - 1] = L'\0';

    for (wchar_t* p = temp + 1; *p; p++) {
        if (*p == L'\\' || *p == L'/') {
            wchar_t sep = *p;
            *p = L'\0';
            CreateDirectoryW(temp, NULL);
            *p = sep;
        }
    }
    CreateDirectoryW(temp, NULL);
}

// Extract embedded offline HTML aim trainer app to user's Local AppData
static BOOL ExtractEmbeddedApp(HINSTANCE hInstance, const wchar_t* targetPath) {
    HRSRC hRes = FindResourceW(hInstance, MAKEINTRESOURCEW(IDR_HTML_APP), RT_RCDATA);
    if (!hRes) return FALSE;

    HGLOBAL hMem = LoadResource(hInstance, hRes);
    if (!hMem) return FALSE;

    DWORD size = SizeofResource(hInstance, hRes);
    const void* data = LockResource(hMem);
    if (!data || size == 0) return FALSE;

    // Check if target file already exists and has identical size to avoid redundant writes
    HANDLE hCheck = CreateFileW(targetPath, GENERIC_READ, FILE_SHARE_READ, NULL, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
    if (hCheck != INVALID_HANDLE_VALUE) {
        DWORD curSize = GetFileSize(hCheck, NULL);
        CloseHandle(hCheck);
        if (curSize == size) {
            return TRUE;
        }
    }

    HANDLE hOut = CreateFileW(targetPath, GENERIC_WRITE, 0, NULL, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
    if (hOut == INVALID_HANDLE_VALUE) return FALSE;

    DWORD written = 0;
    BOOL res = WriteFile(hOut, data, size, &written, NULL);
    CloseHandle(hOut);

    return res && (written == size);
}

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    // 1. Resolve Local AppData directory
    wchar_t localAppData[MAX_PATH];
    if (FAILED(SHGetFolderPathW(NULL, CSIDL_LOCAL_APPDATA, NULL, 0, localAppData))) {
        if (!GetEnvironmentVariableW(L"LOCALAPPDATA", localAppData, MAX_PATH)) {
            GetEnvironmentVariableW(L"TEMP", localAppData, MAX_PATH);
        }
    }

    // 2. Prepare isolated application directories
    wchar_t appFolder[MAX_PATH];
    wchar_t userFolder[MAX_PATH];
    wchar_t htmlFilePath[MAX_PATH];

    wsprintfW(appFolder, L"%s\\RobloxRivalsRange\\app", localAppData);
    wsprintfW(userFolder, L"%s\\RobloxRivalsRange\\profile", localAppData);
    wsprintfW(htmlFilePath, L"%s\\RobloxRivalsRange\\app\\RANGE_Aim_Trainer.html", localAppData);

    EnsureFolder(appFolder);
    EnsureFolder(userFolder);

    // 3. Extract the complete offline aim trainer
    ExtractEmbeddedApp(hInstance, htmlFilePath);

    // 4. Candidate application host paths (Prioritize Microsoft Edge - built into every Windows 10/11)
    wchar_t progFiles[MAX_PATH];
    wchar_t progFiles86[MAX_PATH];
    GetEnvironmentVariableW(L"ProgramFiles", progFiles, MAX_PATH);
    GetEnvironmentVariableW(L"ProgramFiles(x86)", progFiles86, MAX_PATH);

    wchar_t edge86[MAX_PATH];
    wchar_t edge64[MAX_PATH];
    wchar_t edgeUser[MAX_PATH];
    wchar_t chrome64[MAX_PATH];
    wchar_t chrome86[MAX_PATH];
    wchar_t brave[MAX_PATH];

    wsprintfW(edge86, L"%s\\Microsoft\\Edge\\Application\\msedge.exe", progFiles86);
    wsprintfW(edge64, L"%s\\Microsoft\\Edge\\Application\\msedge.exe", progFiles);
    wsprintfW(edgeUser, L"%s\\Microsoft\\Edge\\Application\\msedge.exe", localAppData);
    wsprintfW(chrome64, L"%s\\Google\\Chrome\\Application\\chrome.exe", progFiles);
    wsprintfW(chrome86, L"%s\\Google\\Chrome\\Application\\chrome.exe", progFiles86);
    wsprintfW(brave, L"%s\\BraveSoftware\\Brave-Browser\\Application\\brave.exe", progFiles);

    const wchar_t* hostExe = NULL;
    if (GetFileAttributesW(edge86) != INVALID_FILE_ATTRIBUTES) hostExe = edge86;
    else if (GetFileAttributesW(edge64) != INVALID_FILE_ATTRIBUTES) hostExe = edge64;
    else if (GetFileAttributesW(edgeUser) != INVALID_FILE_ATTRIBUTES) hostExe = edgeUser;
    else if (GetFileAttributesW(chrome64) != INVALID_FILE_ATTRIBUTES) hostExe = chrome64;
    else if (GetFileAttributesW(chrome86) != INVALID_FILE_ATTRIBUTES) hostExe = chrome86;
    else if (GetFileAttributesW(brave) != INVALID_FILE_ATTRIBUTES) hostExe = brave;

    if (hostExe != NULL) {
        // Launch in isolated native app window (0 browser tabs, 0 address bars, 0 extensions)
        wchar_t cmd[4096];
        wsprintfW(cmd,
            L"\"%s\" --app=\"file:///%s\" --user-data-dir=\"%s\" --window-size=1600,980 --app-id=RobloxRivalsRange --disable-features=Translate,OptimizationHints,MediaRouter --no-first-run --no-default-browser-check",
            hostExe, htmlFilePath, userFolder);

        STARTUPINFOW si;
        PROCESS_INFORMATION pi;
        ZeroMemory(&si, sizeof(si));
        si.cb = sizeof(si);
        ZeroMemory(&pi, sizeof(pi));

        if (CreateProcessW(NULL, cmd, NULL, NULL, FALSE, 0, NULL, NULL, &si, &pi)) {
            CloseHandle(pi.hProcess);
            CloseHandle(pi.hThread);
            return 0;
        }
    }

    // Direct fallback: Open local HTML file directly
    ShellExecuteW(NULL, L"open", htmlFilePath, NULL, NULL, SW_SHOWNORMAL);
    return 0;
}
