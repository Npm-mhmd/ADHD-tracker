import React, { useEffect } from 'react';

const Modal = ({ open, onClose, title, description, children, footer }) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg animate-scale-in rounded-2xl border border-sand-200 bg-white shadow-lift dark:border-night-700 dark:bg-night-800">
        <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-brand-400/40 to-transparent" aria-hidden="true" />
        <div className="px-6 pt-6">
          <h3 className="font-display text-xl font-bold text-ink dark:text-sand-50">{title}</h3>
          {description && <p className="mt-1 text-sm text-ink-soft dark:text-sand-200/70">{description}</p>}
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex flex-col-reverse gap-3 border-t border-sand-200 bg-sand-50/50 px-6 py-4 sm:flex-row sm:justify-end dark:border-night-700 dark:bg-night-800/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
