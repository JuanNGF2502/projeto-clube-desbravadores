'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { animate, motion, useMotionValue, useReducedMotion } from 'framer-motion';
import { cn } from '@/utils/cn';
import {
  getTabIndex,
  isTabRoot,
  TAB_ROUTES,
  type TabDirection,
} from '@/utils/tabs';
import { getFreshTabDirection, useNavigationStore } from '@/stores/navigationStore';

const AXIS_LOCK_DISTANCE = 8;
const SWIPE_DISTANCE_RATIO = 0.18;
const SWIPE_VELOCITY = 0.5;
const MIN_FLICK_DISTANCE = 28;
const MAX_DRAG_RATIO = 0.38;
const EDGE_GUARD = 20;
const EXIT_DURATION = 0.16;
const ENTRY_OFFSET = 120;

interface SwipeTabsProps {
  children: ReactNode;
  className?: string;
}

/**
 * Permite trocar entre as abas principais (Início, Classes, Unidades, Perfil)
 * com swipe horizontal, no estilo Instagram.
 *
 * O conteúdo acompanha o dedo durante o arraste e a nova tela entra pela
 * direção correspondente ao gesto.
 */
export function SwipeTabs({ children, className }: SwipeTabsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const tabIndex = getTabIndex(pathname);
  const canSwipe = tabIndex >= 0 && isTabRoot(pathname);

  const containerRef = useRef<HTMLDivElement>(null);
  const navigatingRef = useRef(false);
  const dragX = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);

  // Direção capturada no primeiro render, antes de qualquer navegação nova.
  const [entryDirection] = useState<TabDirection | null>(() =>
    getFreshTabDirection()
  );

  // Pré-carrega as abas para o swipe responder rápido.
  useEffect(() => {
    if (!canSwipe) return;
    TAB_ROUTES.forEach((route) => {
      if (route !== pathname) router.prefetch(route);
    });
  }, [canSwipe, pathname, router]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !canSwipe) return;

    // Escuta toda a área de conteúdo (inclusive espaços vazios abaixo dos cards),
    // não apenas o wrapper interno.
    const listenerTarget = container.closest('main') ?? container;

    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let lastX = 0;
    let lastTime = 0;
    let velocity = 0;
    let axis: 'x' | 'y' | null = null;
    let tracking = false;
    let gestureMoved = false;
    let disposed = false;

    let clickGuardHandler: ((event: MouseEvent) => void) | null = null;
    let clickGuardTimer: ReturnType<typeof setTimeout> | null = null;

    const clearClickGuard = () => {
      if (clickGuardHandler) {
        document.removeEventListener('click', clickGuardHandler, true);
        clickGuardHandler = null;
      }
      if (clickGuardTimer) {
        clearTimeout(clickGuardTimer);
        clickGuardTimer = null;
      }
    };

    // Evita que o clique do card/links dispare depois de um swipe.
    const suppressNextClick = () => {
      clearClickGuard();
      clickGuardHandler = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
      };
      document.addEventListener('click', clickGuardHandler, true);
      clickGuardTimer = setTimeout(clearClickGuard, 400);
    };

    const shouldIgnoreTarget = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return true;
      if (document.body.style.overflow === 'hidden') return true;
      if (target.closest('[data-swipe-ignore]')) return true;
      if (
        target.closest(
          'input, textarea, select, [contenteditable="true"], [role="dialog"], [aria-modal="true"]'
        )
      ) {
        return true;
      }

      // Respeita carrosséis e listas com scroll horizontal.
      let element: Element | null = target;
      while (element && element !== listenerTarget) {
        const { overflowX } = window.getComputedStyle(element);
        if (
          (overflowX === 'auto' || overflowX === 'scroll') &&
          element.scrollWidth > element.clientWidth + 2
        ) {
          return true;
        }
        element = element.parentElement;
      }

      return false;
    };

    const reset = () => {
      tracking = false;
      axis = null;
      gestureMoved = false;
      setIsDragging(false);

      if (dragX.get() !== 0) {
        animate(dragX, 0, {
          type: 'spring',
          stiffness: 420,
          damping: 40,
          mass: 0.7,
        });
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (navigatingRef.current || event.touches.length !== 1) {
        reset();
        return;
      }

      const touch = event.touches[0];

      // Evita conflito com o gesto de voltar do navegador nas bordas.
      if (
        touch.clientX <= EDGE_GUARD ||
        touch.clientX >= window.innerWidth - EDGE_GUARD
      ) {
        reset();
        return;
      }

      if (shouldIgnoreTarget(event.target)) {
        reset();
        return;
      }

      dragX.stop();
      tracking = true;
      axis = null;
      gestureMoved = false;
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = performance.now();
      lastX = startX;
      lastTime = startTime;
      velocity = 0;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!tracking || event.touches.length !== 1) return;

      const touch = event.touches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;

      if (!axis) {
        if (
          Math.abs(deltaX) < AXIS_LOCK_DISTANCE &&
          Math.abs(deltaY) < AXIS_LOCK_DISTANCE
        ) {
          return;
        }

        axis =
          Math.abs(deltaX) > Math.abs(deltaY) * 1.2 ? 'x' : 'y';

        if (axis === 'x') {
          setIsDragging(true);
        }
      }

      if (axis === 'y') return;

      // Impede o scroll horizontal nativo enquanto o dedo arrasta a tela.
      if (event.cancelable) event.preventDefault();

      const now = performance.now();
      velocity = (touch.clientX - lastX) / Math.max(now - lastTime, 1);
      lastX = touch.clientX;
      lastTime = now;
      gestureMoved = true;

      const canGoNext = tabIndex < TAB_ROUTES.length - 1;
      const canGoPrev = tabIndex > 0;
      let offset = deltaX;

      // Resistência elástica quando não existe aba naquela direção.
      if ((offset < 0 && !canGoNext) || (offset > 0 && !canGoPrev)) {
        offset *= 0.22;
      }

      const maxOffset = window.innerWidth * MAX_DRAG_RATIO;
      dragX.set(Math.max(-maxOffset, Math.min(maxOffset, offset)));
    };

    const finishGesture = (cancelled: boolean) => {
      if (!tracking) return;

      const wasHorizontal = axis === 'x';
      const moved = gestureMoved;
      const deltaX = lastX - startX;
      const pausedBeforeRelease = performance.now() - lastTime > 120;

      tracking = false;
      axis = null;
      gestureMoved = false;
      setIsDragging(false);

      if (wasHorizontal && moved) {
        suppressNextClick();
      }

      const targetDirection: TabDirection = deltaX < 0 ? 'next' : 'prev';
      const targetIndex =
        tabIndex + (targetDirection === 'next' ? 1 : -1);
      const targetRoute = TAB_ROUTES[targetIndex];

      const distanceThreshold = window.innerWidth * SWIPE_DISTANCE_RATIO;
      const velocityThreshold =
        !pausedBeforeRelease &&
        Math.abs(velocity) > SWIPE_VELOCITY &&
        Math.abs(deltaX) > MIN_FLICK_DISTANCE;

      const shouldNavigate =
        !cancelled &&
        wasHorizontal &&
        Boolean(targetRoute) &&
        (Math.abs(deltaX) > distanceThreshold || velocityThreshold);

      if (!shouldNavigate) {
        if (dragX.get() !== 0) {
          animate(dragX, 0, {
            type: 'spring',
            stiffness: 420,
            damping: 40,
            mass: 0.7,
          });
        }
        return;
      }

      useNavigationStore.getState().setTabTransition(targetDirection);

      if (prefersReducedMotion) {
        dragX.set(0);
        router.push(targetRoute);
        return;
      }

      navigatingRef.current = true;
      const exitOffset =
        targetDirection === 'next'
          ? -window.innerWidth * 0.5
          : window.innerWidth * 0.5;

      animate(dragX, exitOffset, {
        duration: EXIT_DURATION,
        ease: 'easeIn',
      }).then(() => {
        if (!disposed) router.push(targetRoute);
      });
    };

    const handleTouchEnd = () => finishGesture(false);
    const handleTouchCancel = () => finishGesture(true);

    listenerTarget.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    });
    listenerTarget.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    });
    listenerTarget.addEventListener('touchend', handleTouchEnd);
    listenerTarget.addEventListener('touchcancel', handleTouchCancel);

    return () => {
      disposed = true;
      listenerTarget.removeEventListener('touchstart', handleTouchStart);
      listenerTarget.removeEventListener('touchmove', handleTouchMove);
      listenerTarget.removeEventListener('touchend', handleTouchEnd);
      listenerTarget.removeEventListener('touchcancel', handleTouchCancel);
      clearClickGuard();
    };
  }, [canSwipe, dragX, pathname, prefersReducedMotion, router, tabIndex]);

  const animateEntry =
    canSwipe && Boolean(entryDirection) && !prefersReducedMotion;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <motion.div
        style={{ x: dragX, willChange: isDragging ? 'transform' : 'auto' }}
        className="h-full"
      >
        <motion.div
          initial={
            animateEntry
              ? {
                  x: entryDirection === 'next' ? ENTRY_OFFSET : -ENTRY_OFFSET,
                  opacity: 0.55,
                }
              : false
          }
          animate={{ x: 0, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 360,
            damping: 34,
            mass: 0.8,
          }}
          className="h-full"
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
