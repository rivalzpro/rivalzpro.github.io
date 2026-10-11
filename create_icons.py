#!/usr/bin/env python3
import zlib
import struct
import math

def write_png(filename, width, height, pixels):
    # pixels is a bytearray of RGBA: (r, g, b, a) for each pixel
    # PNG signature: 89 50 4E 47 0D 0A 1A 0A
    sig = b'\x89PNG\r\n\x1a\n'

    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = struct.pack('>I', zlib.crc32(b'IHDR' + ihdr_data))
    ihdr = struct.pack('>I', len(ihdr_data)) + b'IHDR' + ihdr_data + ihdr_crc

    # IDAT: Scanlines with filter byte 0
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # filter type 0 (None)
        start = y * width * 4
        raw_data.extend(pixels[start:start + width * 4])

    compressed = zlib.compress(bytes(raw_data), 9)
    idat_crc = struct.pack('>I', zlib.crc32(b'IDAT' + compressed))
    idat = struct.pack('>I', len(compressed)) + b'IDAT' + compressed + idat_crc

    # IEND
    iend_crc = struct.pack('>I', zlib.crc32(b'IEND'))
    iend = struct.pack('>I', 0) + b'IEND' + iend_crc

    with open(filename, 'wb') as f:
        f.write(sig + ihdr + idat + iend)

def generate_tactical_icon(filename, size, is_maskable=False):
    pixels = bytearray(size * size * 4)
    cx, cy = size / 2.0, size / 2.0
    r_outer = size * (0.36 if is_maskable else 0.42)
    r_inner = r_outer * 0.48
    line_w = max(2, int(size * 0.04))

    for y in range(size):
        for x in range(size):
            dx = x - cx
            dy = y - cy
            dist = math.hypot(dx, dy)
            idx = (y * size + x) * 4

            # Dark obsidian background
            pixels[idx] = 6     # R
            pixels[idx + 1] = 9   # G
            pixels[idx + 2] = 17  # B
            pixels[idx + 3] = 255 # A

            # Outer glow circle
            if abs(dist - r_outer) < line_w:
                pixels[idx] = 56
                pixels[idx + 1] = 189
                pixels[idx + 2] = 248
                pixels[idx + 3] = 255
            # Inner circle
            elif abs(dist - r_inner) < line_w:
                pixels[idx] = 56
                pixels[idx + 1] = 189
                pixels[idx + 2] = 248
                pixels[idx + 3] = 255
            # Center bullseye dot
            elif dist < size * 0.08:
                pixels[idx] = 255
                pixels[idx + 1] = 91
                pixels[idx + 2] = 62
                pixels[idx + 3] = 255

            # Crosshairs lines (top, bottom, left, right)
            if (abs(dx) < line_w // 2 and r_inner < abs(dy) < r_outer * 1.25) or \
               (abs(dy) < line_w // 2 and r_inner < abs(dx) < r_outer * 1.25):
                pixels[idx] = 56
                pixels[idx + 1] = 189
                pixels[idx + 2] = 248
                pixels[idx + 3] = 255

    write_png(filename, size, size, pixels)

generate_tactical_icon('public/icon-192.png', 192)
generate_tactical_icon('public/icon-512.png', 512)
generate_tactical_icon('public/icon-maskable-512.png', 512, is_maskable=True)
generate_tactical_icon('public/apple-touch-icon.png', 180)
print('Generated PWA icon PNGs successfully')
