export interface CropInfo {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Calculates the crop rectangle for an image to cover a frame,
 * considering user-defined zoom (scale) and pan (offset).
 * 
 * @param imageWidth Natural width of the image
 * @param imageHeight Natural height of the image
 * @param frameWidth Width of the frame
 * @param frameHeight Height of the frame
 * @param scale User zoom level (1 = cover fit)
 * @param offsetX User pan X (0 = centered)
 * @param offsetY User pan Y (0 = centered)
 */
export const calculateCrop = (
    imageWidth: number,
    imageHeight: number,
    frameWidth: number,
    frameHeight: number,
    scale: number = 1,
    offsetX: number = 0,
    offsetY: number = 0
): CropInfo => {
    // 1. Determine the "Cover" dimensions
    // The size the image needs to be to exactly cover the frame
    const imageRatio = imageWidth / imageHeight;
    const frameRatio = frameWidth / frameHeight;

    let coverWidth, coverHeight;

    // If image is wider than frame (relative to aspect ratio), height is the constraint
    if (imageRatio > frameRatio) {
        coverHeight = imageHeight;
        coverWidth = imageHeight * frameRatio;
    } else {
        // Image is taller than frame, width is the constraint
        coverWidth = imageWidth;
        coverHeight = imageWidth / frameRatio;
    }

    // 2. Apply User Zoom (Scale)
    // Scale < 1 zooms OUT (showing more image), Scale > 1 zooms IN (showing less image)
    // Wait, usually UI sliders work: 1 = fit, >1 = zoom in.
    // If we zoom in, the crop rectangle gets SMALLER.
    // So effective crop size = coverSize / scale.
    
    const cropWidth = coverWidth / scale;
    const cropHeight = coverHeight / scale;

    // 3. Center the crop rectangle on the image
    let x = (imageWidth - cropWidth) / 2;
    let y = (imageHeight - cropHeight) / 2;

    // 4. Apply User Pan (Offset)
    // Offset is usually in pixels relative to the frame or the image?
    // Let's assume offset is relative to the *image source* pixels for simplicity of the crop rect.
    // But usually UI drag is in frame pixels.
    // Let's assume the caller maps frame pixel drag to image pixel offset.
    // For now, let's treat offsetX/Y as direct modifiers to the crop x/y.
    
    x -= offsetX;
    y -= offsetY;

    // 5. Clamp to bounds (optional, but good UX to prevent whitespace)
    // We only clamp if we want to force "cover" (no whitespace).
    // If user zooms out too much (scale < 1), whitespace is inevitable if we stick to cover ratio.
    // But usually "crop" implies we stay within image bounds.
    
    // Clamp X
    if (x < 0) x = 0;
    if (x + cropWidth > imageWidth) x = imageWidth - cropWidth;
    
    // Clamp Y
    if (y < 0) y = 0;
    if (y + cropHeight > imageHeight) y = imageHeight - cropHeight;

    return {
        x,
        y,
        width: cropWidth,
        height: cropHeight
    };
};
