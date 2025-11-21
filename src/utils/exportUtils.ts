import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import Konva from 'konva';

const SLIDE_WIDTH = 1080;
const SLIDE_HEIGHT = 1080;

export const generateSlides = async (stage: Konva.Stage, slideCount: number): Promise<string[]> => {
  const oldScale = stage.scaleX();
  const oldPos = stage.position();
  const oldSelected = stage.findOne('Transformer')?.visible();
  
  const transformer = stage.findOne('Transformer');
  if (transformer) transformer.hide();
  
  stage.scale({ x: 1, y: 1 });
  stage.position({ x: 0, y: 0 });
  
  const slides: string[] = [];

  try {
      for (let i = 0; i < slideCount; i++) {
        const dataUrl = stage.toDataURL({
          x: i * SLIDE_WIDTH,
          y: 0,
          width: SLIDE_WIDTH,
          height: SLIDE_HEIGHT,
          pixelRatio: 2,
          mimeType: 'image/jpeg',
          quality: 0.9,
        });
        slides.push(dataUrl);
      }
  } finally {
      stage.scale({ x: oldScale, y: oldScale });
      stage.position(oldPos);
      if (transformer && oldSelected !== false) transformer.show();
  }
  return slides;
};

export const exportCanvas = async (stage: Konva.Stage, slideCount: number) => {
  // Ensure fonts are loaded
  await document.fonts.ready;

  const zip = new JSZip();
  const slides = await generateSlides(stage, slideCount);

  slides.forEach((slide, i) => {
      const base64 = slide.split(',')[1];
      zip.file(`slide-${i + 1}.jpg`, base64, { base64: true });
  });

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'carousel-export.zip');
};
