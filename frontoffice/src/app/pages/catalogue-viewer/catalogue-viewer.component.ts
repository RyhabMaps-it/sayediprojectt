import { CommonModule, Location } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { Catalogue } from '../../core/models/catalogue.model';
import { CatalogueService } from '../../core/services/catalogue.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { resolveImageUrl } from '../../core/utils/image-url';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';

/** A spread is what is visible at once: [left, right] in book mode, [page] in single-page mode. */
type Spread = (number | null)[];

interface Flip {
  dir: 'next' | 'prev';
  front: number | null;
  back: number | null;
  target: number;
}

const DOUBLE_PAGE_MIN_WIDTH = 900;
const FLIP_MS = 700;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 1.5;
const CLICK_DELAY_MS = 220; // lets a double-click (zoom) cancel the single-click page turn

@Component({
  selector: 'app-catalogue-viewer',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './catalogue-viewer.component.html',
  styleUrl: './catalogue-viewer.component.scss'
})
export class CatalogueViewerComponent implements OnInit, AfterViewInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private catalogueService = inject(CatalogueService);
  private host = inject(ElementRef<HTMLElement>);

  private stage = viewChild<ElementRef<HTMLElement>>('stage');
  private resizeObserver?: ResizeObserver;

  catalogue = signal<Catalogue | null>(null);
  loading = signal(true);
  progress = signal(0);
  error = signal<'notFound' | 'load' | null>(null);

  numPages = signal(0);
  pageRatio = signal(0.707); // width / height, A4 portrait until page 1 is read
  pageImages = signal<Record<number, string>>({});

  doublePage = signal(typeof window !== 'undefined' && window.innerWidth >= DOUBLE_PAGE_MIN_WIDTH);
  spreadIndex = signal(0);
  flip = signal<Flip | null>(null);
  singleTurn = signal<'next' | 'prev' | null>(null);
  isFullscreen = signal(false);
  showHint = signal(true);

  zoom = signal(1);
  pan = signal({ x: 0, y: 0 });
  dragging = signal(false);
  readonly maxZoom = MAX_ZOOM;
  zoomPercent = computed(() => Math.round(this.zoom() * 100));
  zoomTransform = computed(() => `translate(${this.pan().x}px, ${this.pan().y}px) scale(${this.zoom()})`);
  private hiResImages = signal<Record<number, string>>({});

  spreads = computed<Spread[]>(() => {
    const n = this.numPages();
    if (!n) return [];
    if (!this.doublePage()) {
      return Array.from({ length: n }, (_, i) => [i + 1]);
    }
    // Cover alone on the right, then facing pages, like a printed brochure
    const result: Spread[] = [[null, 1]];
    for (let p = 2; p <= n; p += 2) {
      result.push([p, p + 1 <= n ? p + 1 : null]);
    }
    return result;
  });

  current = computed<Spread>(() => this.spreads()[this.spreadIndex()] ?? []);
  canPrev = computed(() => this.spreadIndex() > 0 && !this.flip());
  canNext = computed(() => this.spreadIndex() < this.spreads().length - 1 && !this.flip());

  /** Pages drawn under the turning leaf while a flip is running. */
  underlay = computed<Spread>(() => {
    const flip = this.flip();
    const spreads = this.spreads();
    if (!flip) return this.current();
    const cur = this.current();
    const target = spreads[flip.target];
    return flip.dir === 'next' ? [cur[0], target[1]] : [target[0], cur[1]];
  });

  visiblePages = computed(() => this.current().filter((p): p is number => p !== null));

  private stageSize = signal({ width: 0, height: 0 });

  /** Largest page that fits the stage, keeping room for the side arrows. */
  pageSize = computed(() => {
    const { width, height } = this.stageSize();
    const ratio = this.pageRatio();
    const pagesAcross = this.doublePage() ? 2 : 1;
    const sideRoom = width > 640 ? 150 : 32; // arrows sit beside the book, or below it on phones
    const maxW = Math.max(120, width - sideRoom) / pagesAcross;
    const maxH = Math.max(160, height - 48);
    const h = Math.min(maxH, maxW / ratio);
    return { width: Math.floor(h * ratio), height: Math.floor(h) };
  });

  fileUrl = computed(() => (this.catalogue() ? resolveImageUrl(this.catalogue()!.fileUrl) : ''));

  private pdf: PDFDocumentProxy | null = null;
  private renderQueue: Promise<void> = Promise.resolve();
  private requested = new Set<number>();
  private objectUrls: string[] = [];
  private flipTimer: ReturnType<typeof setTimeout> | null = null;
  private pointerStartX: number | null = null;
  private suppressClick = false;
  private clickTimer: ReturnType<typeof setTimeout> | null = null;
  private hiResTimer: ReturnType<typeof setTimeout> | null = null;
  private hiResRequested = new Set<number>();
  private pointers = new Map<number, { x: number; y: number }>();
  private pinchStart: { dist: number; zoom: number } | null = null;
  private dragStart: { x: number; y: number; panX: number; panY: number } | null = null;
  private destroyed = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.catalogueService.findAll().subscribe({
      next: (list) => {
        const catalogue = list.find((c) => c.id === id) ?? null;
        if (!catalogue) {
          this.error.set('notFound');
          this.loading.set(false);
          return;
        }
        this.catalogue.set(catalogue);
        this.openPdf(resolveImageUrl(catalogue.fileUrl));
      },
      error: () => {
        this.error.set('load');
        this.loading.set(false);
      }
    });
    setTimeout(() => this.showHint.set(false), 4500);
  }

  ngAfterViewInit(): void {
    const el = this.stage()?.nativeElement;
    if (!el) return;
    const measure = () => this.stageSize.set({ width: el.clientWidth, height: el.clientHeight });
    measure();
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(measure);
      this.resizeObserver.observe(el);
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.resizeObserver?.disconnect();
    if (this.flipTimer) clearTimeout(this.flipTimer);
    if (this.clickTimer) clearTimeout(this.clickTimer);
    if (this.hiResTimer) clearTimeout(this.hiResTimer);
    this.objectUrls.forEach((url) => URL.revokeObjectURL(url));
    this.pdf?.destroy();
  }

  // ---------------------------------------------------------------- navigation

  next(): void {
    if (!this.canNext()) return;
    this.turn('next');
  }

  prev(): void {
    if (!this.canPrev()) return;
    this.turn('prev');
  }

  goToPage(page: number): void {
    const index = this.spreads().findIndex((s) => s.includes(page));
    if (index >= 0 && index !== this.spreadIndex()) {
      this.cancelFlip();
      this.resetZoom();
      this.spreadIndex.set(index);
      this.prefetch();
    }
  }

  onSlider(event: Event): void {
    this.goToPage(Number((event.target as HTMLInputElement).value));
  }

  close(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }

  async toggleFullscreen(): Promise<void> {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await (this.host.nativeElement as HTMLElement).requestFullscreen();
      }
    } catch {
      // fullscreen refused by the browser: nothing to do
    }
  }

  @HostListener('document:fullscreenchange')
  onFullscreenChange(): void {
    this.isFullscreen.set(!!document.fullscreenElement);
  }

  @HostListener('document:keydown', ['$event'])
  onKey(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight' || event.key === 'PageDown') {
      event.preventDefault();
      this.next();
    } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
      event.preventDefault();
      this.prev();
    } else if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      this.zoomIn();
    } else if (event.key === '-' || event.key === '_') {
      event.preventDefault();
      this.zoomOut();
    } else if (event.key === '0') {
      this.resetZoom();
    } else if (event.key === 'Home') {
      this.goToPage(1);
    } else if (event.key === 'End') {
      this.goToPage(this.numPages());
    } else if (event.key === 'Escape' && !document.fullscreenElement) {
      this.close();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    const double = window.innerWidth >= DOUBLE_PAGE_MIN_WIDTH;
    if (double === this.doublePage()) return;
    const firstVisible = this.current().find((p) => p !== null) ?? 1;
    this.cancelFlip();
    this.doublePage.set(double);
    this.spreadIndex.set(Math.max(0, this.spreads().findIndex((s) => s.includes(firstVisible))));
    this.prefetch();
  }

  // ---------------------------------------------------------------- pointer: swipe, drag, pinch

  onPointerDown(event: PointerEvent): void {
    if ((event.target as HTMLElement).closest('button, a, input')) return;
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    // Capture only for drag / pinch: a captured pointer would retarget the click away from the book
    const stage = event.currentTarget as HTMLElement;

    if (this.pointers.size === 2) {
      this.pointers.forEach((_, id) => stage.setPointerCapture?.(id));
      this.pinchStart = { dist: this.pointerDistance(), zoom: this.zoom() };
      this.dragStart = null;
      this.pointerStartX = null;
      this.dragging.set(true);
      return;
    }
    if (this.zoom() > 1) {
      stage.setPointerCapture?.(event.pointerId);
      const { x, y } = this.pan();
      this.dragStart = { x: event.clientX, y: event.clientY, panX: x, panY: y };
      this.dragging.set(true);
    } else {
      this.pointerStartX = event.clientX;
    }
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.pointers.has(event.pointerId)) return;
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (this.pinchStart && this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      const z = (this.pinchStart.zoom * this.pointerDistance()) / this.pinchStart.dist;
      this.zoomTo(z, this.stagePoint((a.x + b.x) / 2, (a.y + b.y) / 2));
      return;
    }
    if (this.dragStart) {
      const dx = event.clientX - this.dragStart.x;
      const dy = event.clientY - this.dragStart.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) this.suppressClick = true;
      this.pan.set(this.clampPan(this.dragStart.panX + dx, this.dragStart.panY + dy, this.zoom()));
    }
  }

  onPointerUp(event: PointerEvent): void {
    this.pointers.delete(event.pointerId);

    if (this.pinchStart) {
      if (this.pointers.size < 2) {
        this.pinchStart = null;
        this.dragging.set(false);
        this.suppressClick = true;
        if (this.zoom() < 1.05) this.resetZoom();
      }
      return;
    }
    if (this.dragStart) {
      this.dragStart = null;
      this.dragging.set(false);
      return;
    }
    if (this.pointerStartX === null) return;
    const delta = event.clientX - this.pointerStartX;
    this.pointerStartX = null;
    if (Math.abs(delta) < 50) return;
    this.suppressClick = true;
    if (delta < 0) this.next();
    else this.prev();
  }

  onWheel(event: WheelEvent): void {
    if (this.loading() || this.error()) return;
    if (event.ctrlKey || event.metaKey) {
      // Ctrl + wheel, and trackpad pinch (reported by browsers as ctrl + wheel)
      event.preventDefault();
      this.zoomTo(this.zoom() * Math.exp(-event.deltaY * 0.01), this.stagePoint(event.clientX, event.clientY));
    } else if (this.zoom() > 1) {
      event.preventDefault();
      const { x, y } = this.pan();
      this.pan.set(this.clampPan(x - event.deltaX, y - event.deltaY, this.zoom()));
    }
  }

  /** Clicking the right half of the book turns forward, the left half turns back. */
  onBookClick(event: MouseEvent): void {
    if (this.suppressClick) {
      this.suppressClick = false;
      return;
    }
    if (this.zoom() > 1) return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const forward = event.clientX - rect.left > rect.width / 2;
    if (this.clickTimer) clearTimeout(this.clickTimer);
    this.clickTimer = setTimeout(() => {
      this.clickTimer = null;
      if (forward) this.next();
      else this.prev();
    }, CLICK_DELAY_MS);
  }

  onStageDblClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('button, a, input')) return;
    if (this.zoom() === 1 && !target.closest('.book')) return;
    if (this.clickTimer) {
      clearTimeout(this.clickTimer);
      this.clickTimer = null;
    }
    if (this.zoom() > 1) this.resetZoom();
    else this.zoomTo(2.2, this.stagePoint(event.clientX, event.clientY));
  }

  // ---------------------------------------------------------------- zoom

  zoomIn(): void {
    this.zoomTo(this.zoom() * ZOOM_STEP);
  }

  zoomOut(): void {
    this.zoomTo(this.zoom() / ZOOM_STEP);
  }

  resetZoom(): void {
    this.zoomTo(1);
  }

  /** Zooms keeping `origin` (a point relative to the stage centre) under the cursor. */
  private zoomTo(value: number, origin?: { x: number; y: number }): void {
    const previous = this.zoom();
    const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
    if (Math.abs(z - previous) < 0.001) return;

    let { x, y } = this.pan();
    if (z === 1) {
      x = 0;
      y = 0;
    } else if (origin) {
      x = origin.x - (origin.x - x) * (z / previous);
      y = origin.y - (origin.y - y) * (z / previous);
    }
    this.zoom.set(z);
    this.pan.set(this.clampPan(x, y, z));
    this.scheduleHiRes();
  }

  private clampPan(x: number, y: number, z: number): { x: number; y: number } {
    const { width, height } = this.stageSize();
    const size = this.pageSize();
    const bookW = size.width * (this.doublePage() ? 2 : 1);
    const maxX = Math.max(0, (bookW * z - width) / 2 + 32);
    const maxY = Math.max(0, (size.height * z - height) / 2 + 32);
    return { x: Math.min(maxX, Math.max(-maxX, x)), y: Math.min(maxY, Math.max(-maxY, y)) };
  }

  private stagePoint(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.stage()?.nativeElement.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: clientX - (rect.left + rect.width / 2), y: clientY - (rect.top + rect.height / 2) };
  }

  private pointerDistance(): number {
    const [a, b] = [...this.pointers.values()];
    return Math.hypot(a.x - b.x, a.y - b.y) || 1;
  }

  /** Once the zoom settles, redraw the visible pages sharper. */
  private scheduleHiRes(): void {
    if (this.hiResTimer) clearTimeout(this.hiResTimer);
    this.hiResTimer = setTimeout(() => {
      if (this.zoom() > 1.2) this.visiblePages().forEach((p) => this.requestPage(p, true));
    }, 250);
  }

  image(page: number | null | undefined): string | null {
    if (!page) return null;
    if (this.zoom() > 1.2) {
      const sharp = this.hiResImages()[page];
      if (sharp) return sharp;
    }
    return this.pageImages()[page] ?? null;
  }

  // ---------------------------------------------------------------- turning

  private turn(dir: 'next' | 'prev'): void {
    const target = this.spreadIndex() + (dir === 'next' ? 1 : -1);
    this.showHint.set(false);
    this.resetZoom();

    if (!this.doublePage()) {
      this.singleTurn.set(null);
      this.spreadIndex.set(target);
      // restart the CSS animation on the next frame
      requestAnimationFrame(() => this.singleTurn.set(dir));
      this.prefetch();
      return;
    }

    const cur = this.current();
    const next = this.spreads()[target];
    this.flip.set(
      dir === 'next'
        ? { dir, front: cur[1], back: next[0], target }
        : { dir, front: cur[0], back: next[1], target }
    );
    this.prefetch(target);
    this.flipTimer = setTimeout(() => {
      this.spreadIndex.set(target);
      this.flip.set(null);
      this.flipTimer = null;
      this.prefetch();
    }, FLIP_MS);
  }

  private cancelFlip(): void {
    if (this.flipTimer) {
      clearTimeout(this.flipTimer);
      this.flipTimer = null;
    }
    this.flip.set(null);
  }

  // ---------------------------------------------------------------- rendering

  private async openPdf(url: string): Promise<void> {
    try {
      const task = pdfjsLib.getDocument({ url, disableRange: true, disableStream: true });
      task.onProgress = ({ loaded, total }: { loaded: number; total: number }) => {
        if (total) this.progress.set(Math.min(99, Math.round((loaded / total) * 100)));
      };
      this.pdf = await task.promise;
      if (this.destroyed) return;

      const first = await this.pdf.getPage(1);
      const viewport = first.getViewport({ scale: 1 });
      this.pageRatio.set(viewport.width / viewport.height);
      this.numPages.set(this.pdf.numPages);
      this.progress.set(100);
      this.prefetch();
      this.loading.set(false);
    } catch {
      if (this.destroyed) return;
      this.error.set('load');
      this.loading.set(false);
    }
  }

  /** Renders the visible pages first, then a few pages ahead and behind. */
  private prefetch(aroundIndex = this.spreadIndex()): void {
    const spreads = this.spreads();
    const order: number[] = [];
    for (const offset of [0, 1, -1, 2, 3, -2]) {
      spreads[aroundIndex + offset]?.forEach((p) => p && order.push(p));
    }
    order.forEach((page) => this.requestPage(page));
  }

  private requestPage(page: number, hiRes = false): void {
    const requested = hiRes ? this.hiResRequested : this.requested;
    if (!this.pdf || requested.has(page)) return;
    requested.add(page);
    this.renderQueue = this.renderQueue.then(() => this.renderPage(page, hiRes)).catch(() => undefined);
  }

  private async renderPage(pageNumber: number, hiRes = false): Promise<void> {
    if (!this.pdf || this.destroyed) return;
    const page = await this.pdf.getPage(pageNumber);
    const base = page.getViewport({ scale: 1 });

    const stageHeight = this.stage()?.nativeElement.clientHeight || window.innerHeight * 0.75;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const baseHeight = Math.min(2200, Math.max(900, stageHeight * dpr));
    const targetHeight = hiRes ? Math.min(4400, baseHeight * 2.2) : baseHeight;
    const viewport = page.getViewport({ scale: targetHeight / base.height });

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const context = canvas.getContext('2d');
    if (!context) return;

    await page.render({ canvasContext: context, viewport }).promise;
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    if (!blob || this.destroyed) return;

    const url = URL.createObjectURL(blob);
    this.objectUrls.push(url);
    const store = hiRes ? this.hiResImages : this.pageImages;
    store.update((images) => ({ ...images, [pageNumber]: url }));
  }
}
