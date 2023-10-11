// This code is based on CD+Graphics Magic :: HTML5 CD+G Player
// http://cdgmagic.sourceforge.net/html5_cdgplayer/

export function CDGDecoder(canvas) {
    'use strict';
    var VRAM_WIDTH = 300,            // Width (or pitch) of VRAM, in pixels.
        VRAM_HEIGHT = 216,           // Height of VRAM, in pixels.
        VISIBLE_WIDTH = 288,         // Width (or pitch) of visible screen, in pixels.
        VISIBLE_HEIGHT = 192,        // Height of visible screen, in pixels.
        BLOCK_WIDTH = 6,             // Width of one block.
        BLOCK_HEIGHT = 12,           // Height of one block.
        NUM_X_BLOCKS = 50,           // Number of horizontal blocks contained in VRAM.
        NUM_Y_BLOCKS = 18,           // Number of vertical blocks contained in VRAM.
        PALETTE_ENTRIES = 16,        // Number of CLUT palette entries.
        TV_GRAPHICS = 0x09,          // 50x18 (48x16) 16 color TV graphics mode.
        MEMORY_PRESET = 0x01,        // Set all VRAM to palette index.
        BORDER_PRESET = 0x02,        // Set border to palette index.
        LOAD_CLUT_LO = 0x1E,         // Load Color Look Up Table index 0 through 7.
        LOAD_CLUT_HI = 0x1F,         // Load Color Look Up Table index 8 through 15.
        COPY_BLOCK = 0x06,           // Copy 12x6 pixel block to screen.
        XOR_BLOCK = 0x26,            // XOR 12x6 pixel block with existing VRAM values.
        SCROLL_PRESET = 0x14,        // Update scroll offset, copying if 0x20 or 0x10.
        SCROLL_COPY = 0x18,          // Update scroll offset, setting color if 0x20 or 0x10.

        cdgData = null,
        context = canvas.getContext('2d'),
        imageData = context.createImageData(VISIBLE_WIDTH, VISIBLE_HEIGHT),
        useDirtyRect = (navigator.userAgent.search(/webkit/i) >= 0) ? true : false,
        palette = new Array(PALETTE_ENTRIES),
        vram = new Array(NUM_X_BLOCKS * VRAM_HEIGHT),
        borderIndex = 0x00,
        currentPack = 0x00,
        borderDirty = false,
        screenDirty = false,
        dirtyBlocks = new Array(NUM_X_BLOCKS * NUM_Y_BLOCKS);


    this.setCDGData = setCDGData;
    this.getCurrentPack = getCurrentPack;
    this.reset = reset;
    this.render = render;
    this.clearPalette = clearPalette;
    this.clearVRAM = clearVRAM;
    this.decode = decode;




    function setCDGData(data) {
        cdgData = data;
    }

    function reset() {
        // todo: need to be sure to clear the border+screen properly
        // and make sure all data is reset properly
        currentPack = 0x00;
        borderIndex = 0x00;
        borderDirty = true;
        screenDirty = true;
        clearPalette(0x242424);
        clearVRAM(0x00);
        clearDirtyBlocks();
        render();
    }

    function getCurrentPack() {
        return currentPack;
    }

    function render() {
        if (borderDirty === true) {
            borderDirty = false;
            context.fillStyle = paletteToCSS(borderIndex);
            context.fillRect(0, 0, VRAM_WIDTH, VRAM_HEIGHT);
        }
        // If the screen is dirty, then it needs a full update.
        if (screenDirty === true) {
            renderScreenToRGB();
            screenDirty = false;
            clearDirtyBlocks();
            context.putImageData(imageData, BLOCK_WIDTH, BLOCK_HEIGHT);
        } else {

            var updateNeeded = false,
                block = 0;

            for (var yBlock = 1; yBlock <= 16; ++yBlock) {
                block = yBlock * NUM_X_BLOCKS + 1;
                for (var xBlock = 1; xBlock <= 48; ++xBlock) {
                    if (dirtyBlocks[block]) {
                        render_block_to_rgb(xBlock, yBlock);
                        if (useDirtyRect === true) {
                            context.putImageData(
                                imageData, BLOCK_WIDTH, BLOCK_HEIGHT,
                                (xBlock - 1) * BLOCK_WIDTH, (yBlock - 1) * BLOCK_HEIGHT,
                                BLOCK_WIDTH,
                                BLOCK_HEIGHT
                            );
                        } else {
                            updateNeeded = true;
                        }
                        dirtyBlocks[block] = 0x00;
                    }
                    ++block;
                }
            }

            if (updateNeeded === true) {
                context.putImageData(imageData, BLOCK_WIDTH, BLOCK_HEIGHT);
            }
        }
    }

    // Decode to pack position, using cdgData.

    function decode(position) {
        for (var index = currentPack; index < position; index++) {
            var start = index * 24,
                command = cdgData[start] & 0x3F;

            if (command == TV_GRAPHICS) {
                // Slice the file array down to a single pack array.
                var pack = cdgData.slice(start, start + 24),
                    instruction = pack[1] & 0x3F;

                // Perform the instruction action.
                switch (instruction) {
                    case MEMORY_PRESET:
                        proc_MEMORY_PRESET(pack);
                    break;

                    case BORDER_PRESET:
                        proc_BORDER_PRESET(pack);
                    break;

                    case LOAD_CLUT_LO:
                    case LOAD_CLUT_HI:
                        proc_LOAD_CLUT(pack);
                    break;

                    case COPY_BLOCK:
                    case XOR_BLOCK:
                        proc_WRITE_BLOCK(pack);
                    break;

                    case SCROLL_PRESET:
                    case SCROLL_COPY:
                        proc_DO_SCROLL(pack);
                    break;
                }
            }
        }
        currentPack = position;
        render();
    }




    //########## PRIVATE CONVENIENCE FUNCTIONS ##########//

    // Convenience function to return the string "rgb(r,g,b)" CSS style tuple of a palette index.

    function paletteToCSS(index) {
        return "rgb(" + ((palette[index] >> 16) & 0xFF) + "," + ((palette[index] >> 8) & 0xFF) + "," + ((palette[index] >> 0) & 0xFF) + ")";
    }

    // Convenience function to return a line of special packed palette values.

    function fillLineWithPaletteIndex(index) {
        var adjusted_value = index;
        adjusted_value |= (index << 4);
        adjusted_value |= (index << 8);
        adjusted_value |= (index << 12);
        adjusted_value |= (index << 16);
        adjusted_value |= (index << 20);
        return adjusted_value;
    }

    // Reset the state of all blocks to clean.

    function clearDirtyBlocks() {
        for (var block = 0; block < 900; block++) {
            dirtyBlocks[block] = 0x00;
        }
    }

    // Reset all the palette RGB values the specified color. Default is black.

    function clearPalette(color) {
        if (color === undefined) color = 0x00;
        for (var idx = 0; idx < PALETTE_ENTRIES; idx++) {
            palette[idx] = color;
        }
    }

    // Set all the VRAM index values to requested index.

    function clearVRAM(color_index) {
        var total_vram_size = vram.length;
        var packed_line_value = fillLineWithPaletteIndex(color_index);
        for (var pxl = 0; pxl < total_vram_size; pxl++) {
            vram[pxl] = packed_line_value;
        }
        screenDirty = true;
    }

    //########## PRIVATE GRAPHICS RENDERING FUNCTIONS ##########//

    function renderScreenToRGB() {
        var vram_loc = 601,
            rgb_loc = 0x00,
            curr_rgb = 0x00,
            curr_line_indices = 0x00;

        for (var y_pxl = 0; y_pxl < VISIBLE_HEIGHT; ++y_pxl) {
            for (var x_pxl = 0; x_pxl < VISIBLE_WIDTH / 6; ++x_pxl) {
                curr_line_indices = vram[vram_loc++];

                curr_rgb = palette[(curr_line_indices >> 0) & 0x0F];
                imageData.data[rgb_loc++] = (curr_rgb >> 16) & 0xFF;
                imageData.data[rgb_loc++] = (curr_rgb >> 8) & 0xFF;
                imageData.data[rgb_loc++] = (curr_rgb >> 0) & 0xFF;
                imageData.data[rgb_loc++] = 0xFF;

                curr_rgb = palette[(curr_line_indices >> 4) & 0x0F];
                imageData.data[rgb_loc++] = (curr_rgb >> 16) & 0xFF;
                imageData.data[rgb_loc++] = (curr_rgb >> 8) & 0xFF;
                imageData.data[rgb_loc++] = (curr_rgb >> 0) & 0xFF;
                imageData.data[rgb_loc++] = 0xFF;

                curr_rgb = palette[(curr_line_indices >> 8) & 0x0F];
                imageData.data[rgb_loc++] = (curr_rgb >> 16) & 0xFF;
                imageData.data[rgb_loc++] = (curr_rgb >> 8) & 0xFF;
                imageData.data[rgb_loc++] = (curr_rgb >> 0) & 0xFF;
                imageData.data[rgb_loc++] = 0xFF;

                curr_rgb = palette[(curr_line_indices >> 12) & 0x0F];
                imageData.data[rgb_loc++] = (curr_rgb >> 16) & 0xFF;
                imageData.data[rgb_loc++] = (curr_rgb >> 8) & 0xFF;
                imageData.data[rgb_loc++] = (curr_rgb >> 0) & 0xFF;
                imageData.data[rgb_loc++] = 0xFF;

                curr_rgb = palette[(curr_line_indices >> 16) & 0x0F];
                imageData.data[rgb_loc++] = (curr_rgb >> 16) & 0xFF;
                imageData.data[rgb_loc++] = (curr_rgb >> 8) & 0xFF;
                imageData.data[rgb_loc++] = (curr_rgb >> 0) & 0xFF;
                imageData.data[rgb_loc++] = 0xFF;

                curr_rgb = palette[(curr_line_indices >> 20) & 0x0F];
                imageData.data[rgb_loc++] = (curr_rgb >> 16) & 0xFF;
                imageData.data[rgb_loc++] = (curr_rgb >> 8) & 0xFF;
                imageData.data[rgb_loc++] = (curr_rgb >> 0) & 0xFF;
                imageData.data[rgb_loc++] = 0xFF;
            }
            vram_loc += 2;
        }
    }

    function render_block_to_rgb(x_start, y_start) {
        var vram_loc = (y_start * NUM_X_BLOCKS * BLOCK_HEIGHT) + x_start,
            vram_end = vram_loc + (NUM_X_BLOCKS * BLOCK_HEIGHT),
            rgb_inc = (VISIBLE_WIDTH - BLOCK_WIDTH) * 4,
            curr_rgb = 0x00,
            curr_line_indices = 0x00,
            rgb_loc = (y_start - 1) * BLOCK_HEIGHT * VISIBLE_WIDTH;
            rgb_loc += (x_start - 1) * BLOCK_WIDTH;
            rgb_loc *= 4;


        while (vram_loc < vram_end) {
            curr_line_indices = vram[vram_loc];
            curr_rgb = palette[(curr_line_indices >> 0) & 0x0F];
            imageData.data[rgb_loc++] = (curr_rgb >> 16) & 0xFF;
            imageData.data[rgb_loc++] = (curr_rgb >> 8) & 0xFF;
            imageData.data[rgb_loc++] = (curr_rgb >> 0) & 0xFF;
            imageData.data[rgb_loc++] = 0xFF;
            curr_rgb = palette[(curr_line_indices >> 4) & 0x0F];
            imageData.data[rgb_loc++] = (curr_rgb >> 16) & 0xFF;
            imageData.data[rgb_loc++] = (curr_rgb >> 8) & 0xFF;
            imageData.data[rgb_loc++] = (curr_rgb >> 0) & 0xFF;
            imageData.data[rgb_loc++] = 0xFF;
            curr_rgb = palette[(curr_line_indices >> 8) & 0x0F];
            imageData.data[rgb_loc++] = (curr_rgb >> 16) & 0xFF;
            imageData.data[rgb_loc++] = (curr_rgb >> 8) & 0xFF;
            imageData.data[rgb_loc++] = (curr_rgb >> 0) & 0xFF;
            imageData.data[rgb_loc++] = 0xFF;
            curr_rgb = palette[(curr_line_indices >> 12) & 0x0F];
            imageData.data[rgb_loc++] = (curr_rgb >> 16) & 0xFF;
            imageData.data[rgb_loc++] = (curr_rgb >> 8) & 0xFF;
            imageData.data[rgb_loc++] = (curr_rgb >> 0) & 0xFF;
            imageData.data[rgb_loc++] = 0xFF;
            curr_rgb = palette[(curr_line_indices >> 16) & 0x0F];
            imageData.data[rgb_loc++] = (curr_rgb >> 16) & 0xFF;
            imageData.data[rgb_loc++] = (curr_rgb >> 8) & 0xFF;
            imageData.data[rgb_loc++] = (curr_rgb >> 0) & 0xFF;
            imageData.data[rgb_loc++] = 0xFF;
            curr_rgb = palette[(curr_line_indices >> 20) & 0x0F];
            imageData.data[rgb_loc++] = (curr_rgb >> 16) & 0xFF;
            imageData.data[rgb_loc++] = (curr_rgb >> 8) & 0xFF;
            imageData.data[rgb_loc++] = (curr_rgb >> 0) & 0xFF;
            imageData.data[rgb_loc++] = 0xFF;

            vram_loc += NUM_X_BLOCKS;
            rgb_loc += rgb_inc;
        }
    }

    //########## PRIVATE GRAPHICS DECODE FUNCTIONS ##########//

    function proc_BORDER_PRESET(cdgPack) {
        // NOTE: The "border" is actually a DIV element, which can be very expensive to change in some browsers.
        // This somewhat bizarre check ensures that the DIV is only touched if the actual RGB color is different,
        // but the border index variable is always set... A similar check is also performed during palette update.
        var newBorderIndex = cdgPack[4] & 0x3F; // Get the border index from subcode.
        // Check if the new border **RGB** color is different from the old one.
        if (palette[newBorderIndex] != palette[borderIndex]) {
            borderDirty = true;
        }
        borderIndex = newBorderIndex;
    }

    function proc_MEMORY_PRESET(cdgPack) {
        clearVRAM(cdgPack[4] & 0x3F);
    }


    function proc_LOAD_CLUT(cdgPack) {
        // If instruction is 0x1E then 8*0=0, if 0x1F then 8*1=8 for offset.
        var pal_offset = (cdgPack[1] & 0x01) * 8;
        // Step through the eight color indices, setting the RGB values.
        for (var pal_inc = 0; pal_inc < 8; pal_inc++) {
            var index = pal_inc + pal_offset,
                rgb = 0x00000000,
                entry = 0x00000000;
            // Set red.
            entry = (cdgPack[pal_inc * 2 + 4] & 0x3C) >> 2;
            rgb |= (entry * 17) << 16;
            // Set green.
            entry = ((cdgPack[pal_inc * 2 + 4] & 0x03) << 2) | ((cdgPack[pal_inc * 2 + 5] & 0x30) >> 4);
            rgb |= (entry * 17) << 8;
            // Set blue.
            entry = cdgPack[pal_inc * 2 + 5] & 0x0F;
            rgb |= (entry * 17) << 0;
            // Put the full RGB value into the index position, but only if it's different.
            if (rgb != palette[index]) {
                palette[index] = rgb;
                screenDirty = true; // The colors are now different, so we need to update the whole screen.
                if (index == borderIndex) {
                    borderDirty = true;
                } // The border color has changed.
            }
        }
    }

    function proc_WRITE_BLOCK(cdgPack) {
        var active_channels = 0x03,
            subcode_channel = ((cdgPack[4] & 0x30) >> 2) | ((cdgPack[5] & 0x30) >> 4),
            xor_var = cdgPack[1] & 0x20;

        if ((active_channels >> subcode_channel) & 0x01) {
            var x_location = cdgPack[7] & 0x3F,
                y_location = cdgPack[6] & 0x1F;

            // Verify we're not going to overrun the boundaries (i.e. bad data from a scratched disc).
            if ((x_location <= 49) && (y_location <= 17)) {
                var start_pixel = y_location * 600 + x_location,
                    current_indexes = [(cdgPack[4] & 0x0F), (cdgPack[5] & 0x0F)],
                    current_row = 0x00,
                    temp_pxl = 0x00,
                    pix_pos = 0;

                for (var y_inc = 0; y_inc < 12; y_inc++) {
                    pix_pos = y_inc * 50 + start_pixel;
                    current_row = cdgPack[y_inc + 8];
                    temp_pxl = (current_indexes[(current_row >> 5) & 0x01] << 0);
                    temp_pxl |= (current_indexes[(current_row >> 4) & 0x01] << 4);
                    temp_pxl |= (current_indexes[(current_row >> 3) & 0x01] << 8);
                    temp_pxl |= (current_indexes[(current_row >> 2) & 0x01] << 12);
                    temp_pxl |= (current_indexes[(current_row >> 1) & 0x01] << 16);
                    temp_pxl |= (current_indexes[(current_row >> 0) & 0x01] << 20);
                    if (xor_var) {
                        vram[pix_pos] ^= temp_pxl;
                    } else {
                        vram[pix_pos] = temp_pxl;
                    }
                }
                dirtyBlocks[y_location * 50 + x_location] = 0x01;
            }
        }
    }

    function proc_DO_SCROLL(cdgPack) {
        var direction = 0,
            copy_flag = (cdgPack[1] & 0x08) >> 3,
            color = cdgPack[4] & 0x0F;

        // Process horizontal commands.
        if ((direction = ((cdgPack[5] & 0x30) >> 4))) {
            proc_VRAM_HSCROLL(direction, copy_flag, color);
        }
        // Process vertical commands.
        if ((direction = ((cdgPack[6] & 0x30) >> 4))) {
            proc_VRAM_VSCROLL(direction, copy_flag, color);
        }

        screenDirty = true;
    }

    function proc_VRAM_HSCROLL(direction, copy_flag, color) {
        var buffer = 0,
            line_color = fillLineWithPaletteIndex(color),
            x_src = 0,
            y_src = 0,
            y_start = 0;
        if (direction == 0x02) {
            // Step through the lines one at a time...
            for (y_src = 0; y_src < (50 * 216); y_src += 50) {
                y_start = y_src;
                buffer = vram[y_start];
                for (x_src = y_start + 1; x_src < y_start + 50; x_src++) {
                    vram[x_src - 1] = vram[x_src];
                }
                if (copy_flag) {
                    vram[y_start + 49] = buffer;
                } else {
                    vram[y_start + 49] = line_color;
                }
            }
        } else if (direction == 0x01) {
            // Step through the lines on at a time.
            for (y_src = 0; y_src < (50 * 216); y_src += 50) {
                // Copy the last six lines to the buffer.
                y_start = y_src;
                buffer = vram[y_start + 49];
                for (x_src = y_start + 48; x_src >= y_start; x_src--) {
                    vram[x_src + 1] = vram[x_src];
                }
                if (copy_flag) {
                    vram[y_start] = buffer;
                } else {
                    vram[y_start] = line_color;
                }
            }
        }
    }

    function proc_VRAM_VSCROLL(direction, copy_flag, color) {
        var offscreen_size = NUM_X_BLOCKS * BLOCK_HEIGHT,
            buffer = new Array(offscreen_size),
            line_color = fillLineWithPaletteIndex(color),
            src_idx = 0,
            dst_idx = 0;

        if (direction == 0x02) {
            dst_idx = 0; // Buffer destination starts at 0.
            // Copy the top 300x12 pixels into the buffer.
            for (src_idx = 0; src_idx < offscreen_size; src_idx++) {
                buffer[dst_idx++] = vram[src_idx];
            }
            dst_idx = 0; // Destination starts at the first line.
            for (src_idx = offscreen_size; src_idx < (50 * 216); src_idx++) {
                vram[dst_idx++] = vram[src_idx];
            }
            dst_idx = (NUM_X_BLOCKS * 204); // Destination begins at line 204.
            if (copy_flag) {
                for (src_idx = 0; src_idx < offscreen_size; src_idx++) {
                    vram[dst_idx++] = buffer[src_idx];
                }
            } else {
                for (src_idx = 0; src_idx < offscreen_size; src_idx++) {
                    vram[dst_idx++] = line_color;
                }
            }
        } else if (direction == 0x01) {
            dst_idx = 0; // Buffer destination starts at 0.
            // Copy the bottom 300x12 pixels into the buffer.
            for (src_idx = (50 * 204); src_idx < (50 * 216); src_idx++) {
                buffer[dst_idx++] = vram[src_idx];
            }
            for (src_idx = (50 * 204) - 1; src_idx > 0; src_idx--) {
                vram[src_idx + offscreen_size] = vram[src_idx];
            }
            if (copy_flag) {
                for (src_idx = 0; src_idx < offscreen_size; src_idx++) {
                    vram[src_idx] = buffer[src_idx];
                }
            } else {
                for (src_idx = 0; src_idx < offscreen_size; src_idx++) {
                    vram[src_idx] = line_color;
                }
            }
        }
    }

}