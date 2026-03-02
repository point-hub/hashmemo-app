<script setup lang="ts">
import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker?url';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { PageViewport, PDFPageProxy } from 'pdfjs-dist/types/web/interfaces';
import { markRaw, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';

import dancingScriptUrl from '@/assets/fonts/DancingScript.ttf?url';
import type { IPdfFile, ISignature, ISignatureState, IUser } from '@/types/pdf-signer';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const DEFAULT_SIGNATURE_SIZE = { width: 70, height: 45 };
const DEFAULT_INITIAL_SCALE = 0.8;
const DEFAULT_MIN_SCALE = 0.6;
const DEFAULT_MAX_SCALE = 2.4;
const PAGE_GAP = 0;

// -------------------- props / emits --------------------
const props = withDefaults(
  defineProps<{
    pdfFile?: IPdfFile
    currentUser?: IUser | null
    signaturesJson?: string
    draggingUser: IUser | null
    hash?: string
    preview?: boolean
    certId?: string
  }>(),
  { currentUser: null, signaturesJson: '', preview: false },
);

const emit = defineEmits<{
  (e: 'signature:created', sig: ISignature): void
  (e: 'signature:updated', sig: ISignature): void
  (e: 'signature:signed', sig: ISignature): void
  (e: 'update:signaturesJson', value: string): void
  (e: 'pdf:export', result: IPdfFile): void
}>();

// -------------------- refs --------------------
const canvas = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);
const pdfDoc = shallowRef<pdfjsLib.PDFDocumentProxy | null>(null);
const pdfBytes = ref<Uint8Array | null>(null);
const scale = ref(DEFAULT_INITIAL_SCALE);

const isDraggingSignature = ref(false);
const draggingSignature = ref<ISignature | null>(null);

const pageLayouts = ref<{ page: number; start: number; height: number }[]>([]);

const state = defineModel<ISignatureState>({
  default: () => ({
    signatures: [],
    activeSignature: null,
    currentUser: { _id: '', name: '', initial: '' },
    pageSize: { width: 0, height: 0 },
  }),
});

// const state = reactive<ISignatureState>({
//   signatures: [],
//   activeSignature: null,
//   currentUser: { _id: '', name: '', initial: '' },
//   pageSize: { width: 0, height: 0 },
// });

// -------------------- helpers --------------------
const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

const computeScale = (pageWidth: number) => {
  const w = containerRef.value?.clientWidth;
  if (!w) return DEFAULT_INITIAL_SCALE;
  return Math.min(DEFAULT_MAX_SCALE, Math.max(DEFAULT_MIN_SCALE, w / pageWidth));
};

const updateSignaturesJson = () => {
  emit('update:signaturesJson', JSON.stringify(state.value.signatures, null, 2));
};

const clearSignatures = () => {
  state.value.signatures.splice(0);
  state.value.activeSignature = null;
};

// -------------------- watchers --------------------
watch(
  () => props.currentUser,
  (u) => {
    if (!u) return;
    state.value.currentUser.user_id = u.user_id;
    state.value.currentUser.name = u.name;
    state.value.currentUser.initial_name = u.initial_name;
  },
  { immediate: true },
);

watch(
  () => props.pdfFile,
  async (newFile) => {
    if (!newFile?.bytes || (newFile.bytes instanceof Uint8Array && newFile.bytes.length === 0)) {
      return;
    }

    try {
      const sourceBytes = new Uint8Array(newFile.bytes);
      const workerBytes = new Uint8Array(sourceBytes);
      pdfBytes.value = sourceBytes;
      pdfDoc.value = markRaw(
        await pdfjsLib.getDocument({
          data: workerBytes,
        }).promise,
      );
      await renderPdf();
      // clearSignatures();
    } catch (err) {
      console.error('Failed to load PDF:', err);
      pdfDoc.value = null;
    }
  },
  { immediate: true },
);

watch(
  () => props.signaturesJson,
  (v) => {
    if (isDraggingSignature.value) return;
    if (!v?.trim()) return clearSignatures();
    state.value.signatures = JSON.parse(v);
  },
  { immediate: true },
);

// -------------------- PDF rendering --------------------
const renderPdf = async () => {
  if (!pdfDoc.value || !canvas.value) return;

  const pageCount = pdfDoc.value.numPages;
  let maxWidth = 0;
  let totalHeight = 0;
  let offset = 0;

  const layouts: typeof pageLayouts.value = [];
  const pages: { page: PDFPageProxy, viewport: PageViewport }[] = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdfDoc.value.getPage(i);
    const viewport = page.getViewport({ scale: 1 });

    layouts.push({
      page: i,
      start: offset,
      height: viewport.height,
    });

    pages.push({ page, viewport });

    maxWidth = Math.max(maxWidth, viewport.width);
    totalHeight += viewport.height;

    if (i < pageCount) totalHeight += PAGE_GAP;
    offset += viewport.height + PAGE_GAP;
  }

  pageLayouts.value = layouts;
  state.value.pageSize.width = maxWidth;
  state.value.pageSize.height = totalHeight;

  scale.value = computeScale(maxWidth);

  const ctx = canvas.value.getContext('2d')!;
  canvas.value.width = maxWidth * scale.value;
  canvas.value.height = totalHeight * scale.value;
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);

  let y = 0;
  for (let i = 0; i < pages.length; i++) {
    const pageItem = pages[i];
    if (!pageItem) continue;

    const { page } = pageItem;
    const vp = page.getViewport({ scale: scale.value });

    ctx.save();
    ctx.translate(0, y);
    await page.render({ canvasContext: ctx, viewport: vp, canvas: canvas.value }).promise;
    ctx.restore();

    y += vp.height;
    if (i < pages.length - 1) {
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, y, canvas.value.width, PAGE_GAP);
      y += PAGE_GAP;
    }
  }
};

// -------------------- add signature --------------------
const addSignatureAt = (x: number, y: number) => {
  const layout = pageLayouts.value.find(
    (l) => y >= l.start && y < l.start + l.height,
  );
  if (!layout) return;

  const candidate: ISignature = {
    id: crypto.randomUUID(),
    x: clamp(x, 0, state.value.pageSize.width - DEFAULT_SIGNATURE_SIZE.width),
    y: clamp(
      y,
      layout.start,
      layout.start + layout.height - DEFAULT_SIGNATURE_SIZE.height,
    ),
    width: DEFAULT_SIGNATURE_SIZE.width,
    height: DEFAULT_SIGNATURE_SIZE.height,
    page: layout.page,
    user_id: props.draggingUser!.user_id,
    name: props.draggingUser!.name,
    role: props.draggingUser!.role,
    initial_name: props.draggingUser!.initial_name,
    email: props.draggingUser!.email,
    signed: false,
  };

  const overlapped = state.value.signatures.some(sig =>
    isOverlapping(candidate, sig),
  );

  if (overlapped) {
    return;
  }

  state.value.signatures.push(candidate);
  state.value.activeSignature = candidate;
  emit('signature:created', candidate);
  updateSignaturesJson();
};

// -------------------- drag & drop --------------------
const onDrop = (e: DragEvent) => {
  if (!canvas.value) return;
  const r = canvas.value.getBoundingClientRect();
  const x = (e.clientX - r.left) / scale.value;
  const y = (e.clientY - r.top) / scale.value;
  addSignatureAt(x - 35, y - 22.5);
};

// -------------------- move signature --------------------
let dragStartX = 0;
let dragStartY = 0;
let sigStartX = 0;
let sigStartY = 0;

const isOverlapping = (
  a: ISignature,
  b: ISignature,
) => {
  if (a.id === b.id) return false;
  if (a.page !== b.page) return false;

  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
};

const startSignatureDrag = (sig: ISignature, e: MouseEvent) => {
  if (sig.signed) return;
  if (props.preview) return;
  
  isDraggingSignature.value = true;
  draggingSignature.value = sig;
  state.value.activeSignature = sig;

  dragStartX = e.clientX;
  dragStartY = e.clientY;
  sigStartX = sig.x;
  sigStartY = sig.y;

  document.body.style.cursor = 'move';
};

const moveSignature = (e: MouseEvent) => {
  if (!draggingSignature.value) return;

  const dx = (e.clientX - dragStartX) / scale.value;
  const dy = (e.clientY - dragStartY) / scale.value;

  const sig = draggingSignature.value;
  const layout = pageLayouts.value.find(l => l.page === sig.page);
  if (!layout) return;

  // ---- X axis first ----
  const nextX = clamp(
    sigStartX + dx,
    0,
    state.value.pageSize.width - sig.width,
  );

  const xCandidate: ISignature = {
    ...sig,
    x: nextX,
    y: sig.y,
  };

  const xBlocked = state.value.signatures.some(other =>
    isOverlapping(xCandidate, other),
  );

  if (!xBlocked) {
    sig.x = nextX;
  }

  // ---- Y axis second ----
  const nextY = clamp(
    sigStartY + dy,
    layout.start,
    layout.start + layout.height - sig.height,
  );

  const yCandidate: ISignature = {
    ...sig,
    x: sig.x,
    y: nextY,
  };

  const yBlocked = state.value.signatures.some(other =>
    isOverlapping(yCandidate, other),
  );

  if (!yBlocked) {
    sig.y = nextY;
  }
};

const stopSignatureDrag = () => {
  if (!draggingSignature.value) return;
  draggingSignature.value = null;
  isDraggingSignature.value = false;
  document.body.style.cursor = '';
  updateSignaturesJson();
};

onMounted(() => {
  window.addEventListener('mousemove', moveSignature);
  window.addEventListener('mouseup', stopSignatureDrag);
});

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', moveSignature);
  window.removeEventListener('mouseup', stopSignatureDrag);
});

const exportPdf = async (withCertificate = false) => {
  if (!pdfBytes.value) return;

  try {
    const doc = await PDFDocument.load(pdfBytes.value);
    doc.registerFontkit(fontkit);

    const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await doc.embedFont(StandardFonts.Helvetica);

    let sigFont;
    try {
      const fBytes = await fetch(dancingScriptUrl).then(res => res.arrayBuffer());
      sigFont = await doc.embedFont(fBytes);
    } catch {
      sigFont = await doc.embedFont(StandardFonts.TimesRomanItalic);
    }

    if (withCertificate) {
      const page = doc.getPage(0);
      page.drawText("Hash: " + props.hash, { x: 2, y: page.getHeight() - 15, size: 9, font: helveticaBold, color: rgb(0, 0, 0) });
      page.drawText("Certificate ID:" + props.certId, { x: 2, y: page.getHeight() - 25, size: 9, font: helveticaBold, color: rgb(0, 0, 0) });
    }
    for (const sig of state.value.signatures) {
      if (!sig.signed) continue;

      const page = doc.getPage(sig.page - 1);
      const { height: pHeight } = page.getSize();
      const layout = pageLayouts.value.find(l => l.page === sig.page);
      if (!layout) continue;

      // Coordinate Conversions
      const x = Number(sig.x);
      const pdfYTop = pHeight - (Number(sig.y) - layout.start);
      const sH = Number(40);
      const pdfYBot = pdfYTop - sH;

      const color = rgb(0.12, 0.35, 0.59);
      const bRad = 8;
      const bWid = 40;

      // 1. Draw Rounded Bracket
      const topY = pdfYTop;
      const bottomY = pdfYBot;

      // Draw vertical line
      page.drawLine({
        start: { x: x, y: bottomY + bRad },
        end: { x: x, y: topY - bRad },
        color,
        thickness: 1.5,
      });

      // Top-left quarter circle approximated with lines
      const topCenterX = x + bRad;
      const topCenterY = topY - bRad;
      const topStartAngle = Math.PI; // 180°
      const topEndAngle = Math.PI / 2; // 90°
      const steps = 20; // Number of line segments for approximation
      
      for (let i = 0; i < steps; i++) {
        const angle1 = topStartAngle + (topEndAngle - topStartAngle) * (i / steps);
        const angle2 = topStartAngle + (topEndAngle - topStartAngle) * ((i + 1) / steps);
        const x1 = topCenterX + bRad * Math.cos(angle1);
        const y1 = topCenterY + bRad * Math.sin(angle1);
        const x2 = topCenterX + bRad * Math.cos(angle2);
        const y2 = topCenterY + bRad * Math.sin(angle2);
        page.drawLine({
          start: { x: x1, y: y1 },
          end: { x: x2, y: y2 },
          color,
          thickness: 1.5,
        });
      }

      // Bottom-left quarter circle approximated with lines
      const bottomCenterX = x + bRad;
      const bottomCenterY = bottomY + bRad;
      const bottomStartAngle = Math.PI; // 180°
      const bottomEndAngle = 3 * Math.PI / 2; // 270°
      for (let i = 0; i < steps; i++) {
        const angle1 = bottomStartAngle + (bottomEndAngle - bottomStartAngle) * (i / steps);
        const angle2 = bottomStartAngle + (bottomEndAngle - bottomStartAngle) * ((i + 1) / steps);
        const x1 = bottomCenterX + bRad * Math.cos(angle1);
        const y1 = bottomCenterY + bRad * Math.sin(angle1);
        const x2 = bottomCenterX + bRad * Math.cos(angle2);
        const y2 = bottomCenterY + bRad * Math.sin(angle2);
        page.drawLine({
          start: { x: x1, y: y1 },
          end: { x: x2, y: y2 },
          color,
          thickness: 1.5,
        });
      }

      // Top horizontal line
      page.drawLine({
        start: { x: x + bRad, y: topY },
        end: { x: x + bWid, y: topY },
        color,
        thickness: 1.5,
      });

      // Bottom horizontal line
      page.drawLine({
        start: { x: x + bRad, y: bottomY },
        end: { x: x + bWid, y: bottomY },
        color,
        thickness: 1.5,
      });

      // 2. White-out masks for text cutouts
      const topTxt = 'Signed by:';
      const hashTxt = props.pdfFile?.hash?.substring(0, 16) || '';
      const tW = helveticaBold.widthOfTextAtSize(topTxt, 7);

      // Top mask: Shifted slightly up (y + 1) and taller to ensure the blue line is fully covered
      page.drawRectangle({
        x: x + 8,
        y: pdfYTop - 5, // Slightly lower than the line to cover the stroke width
        width: tW + 4,
        height: 10,
        color: rgb(1, 1, 1),
        opacity: 1,
      });

      if (hashTxt) {
        const hW = helvetica.widthOfTextAtSize(hashTxt, 6);
        page.drawRectangle({
          x: x + 8,
          y: pdfYBot - 4,
          width: hW + 4,
          height: 8,
          color: rgb(1, 1, 1),
        });
      }

      // 3. Draw Text
      page.drawText(topTxt, { x: x + 10, y: pdfYTop - 3, size: 9, font: helveticaBold, color: rgb(0, 0, 0) });
      page.drawText(sig.initial_name || sig.name, { x: x + 15, y: pdfYTop - (sH / 2) - 6, size: 18, font: sigFont, color: rgb(0, 0, 0) });
      if (hashTxt) page.drawText(hashTxt, { x: x + 10, y: pdfYBot - 3, size: 9, font: helvetica, color: rgb(0.3, 0.3, 0.3) });
    }

    emit('pdf:export', { bytes: await doc.save(), name: 'signed.pdf' });
  } catch (err) {
    console.error('Export Error:', err);
  }
};

defineExpose({ exportPdf });
</script>

<template>
  <div class="flex flex-col h-full w-full overflow-hidden">
    <div
      ref="containerRef"
      class="flex-1 overflow-auto relative"
      @dragover.prevent
      @drop="onDrop"
    >
      <!-- Canvas for rendering PDF -->
      <canvas ref="canvas" />
      <!-- Signatures -->
      <p 
        class="absolute font-bold"
        :style="{
          left: '5px',
          top: '5px',
        }"
      >
        Hash: {{ hash }}
      </p>
      <p 
        class="absolute font-bold"
        :style="{
          left: '5px',
          top: '25px',
        }"
      >
        Certificate ID: {{ certId }}
      </p>
      <div
        v-for="sig in state.signatures"
        :key="sig.id"
        class="absolute select-none flex items-center p-1"
        :class="{'border-2 border-dashed border-blue-600 bg-blue-100': !sig.signed }"
        :style="{
          left: sig.x * scale + 'px',
          top: sig.y * scale + 'px',
          // width: sig.width * scale + 'px',
          // height: sig.height * scale + 'px',
        }"
        @mousedown.stop="startSignatureDrag(sig, $event)"
      >
        <button
          class="cursor-pointer"
          v-if="!sig.signed"
        >
          <div class="flex flex-col w-28 h-18 items-center justify-between">
            <div class="text-sm font-bold">
              SIGN
            </div>
            <div class="text-xs line-clamp-2 max-w-28 max-h-18 ">
              {{ sig.name }}
            </div>
          </div>
        </button>

        <div v-else class="relative inline-flex flex-col border-l-2 border-y-2 border-slate-800 rounded-l-lg p-2">
          <span class="absolute -top-3 left-2 px-1 text-xs font-bold bg-white text-gray-800 whitespace-nowrap">
            Signed by:
          </span>
          <div class="px-4 text-2xl font-serif text-gray-900" :style="{ fontFamily: 'Dancing Script' }">
            {{ sig.initial_name }}
          </div>
          <span class="absolute -bottom-3 left-2 px-1 text-[10px] bg-white tracking-tighter text-gray-700">
            {{ props.pdfFile?.hash?.substring(0, 16) }}...
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
